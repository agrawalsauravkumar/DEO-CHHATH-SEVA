/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import {
  AuthConfigurationError,
  assertAuthConfiguration,
  createAuthToken,
  getAuthenticatedUser,
} from '../middleware/auth';
import { otpService } from '../providers/sms/OtpService';

export const authRouter = Router();

// 1. Password Login (Administrative & Officials)
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = await repository.findUserByPhoneOrUsername(username);
  if (!user || user.passwordHash !== password || user.status !== 'ACTIVE') {
    return res.status(401).json({ error: 'गलत उपयोगकर्ता नाम या पासवर्ड (Invalid credentials)' });
  }

  let token: string;
  try {
    token = createAuthToken(user.id);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return res.status(503).json({ error: 'Authentication service is not configured' });
    }
    throw error;
  }

  await repository.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'ADMIN_LOGIN_SUCCESS',
    entity: 'Auth',
    entityId: user.id,
    newValueSummary: `Logged in with role ${user.role}`,
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      token,
      lastLoginAt: user.lastLoginAt,
    },
    token,
  });
});

// 2. Request Mobile OTP (Devotees, Volunteers & Public)
authRouter.post('/otp/send', async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber || typeof mobileNumber !== 'string') {
    return res.status(400).json({ error: 'वैध मोबाइल नंबर आवश्यक है (Valid mobile number required)' });
  }

  const clean = mobileNumber.replace(/\D/g, '');
  if (clean.length !== 10) {
    return res.status(400).json({ error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
  }

  const otpResult = await otpService.requestOtp(clean);
  if (!otpResult.success) {
    const status = otpResult.code === 'INVALID'
      ? 400
      : otpResult.code === 'RATE_LIMITED'
        ? 429
        : 503;
    return res.status(status).json({
      error: otpResult.code === 'UNAVAILABLE'
        ? 'OTP सेवा अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।'
        : otpResult.error,
    });
  }

  return res.json({
    success: true,
    message: 'OTP आपके मोबाइल नंबर पर सफलतापूर्वक भेजा गया।',
    maskedMobile: otpResult.maskedMobile,
    expiresInSeconds: otpResult.expiresInSeconds,
    isDevelopmentMode: otpResult.isDevelopmentMode,
    ...(otpResult.isDevelopmentMode && otpResult.devOtpHint
      ? { devOtpHint: otpResult.devOtpHint }
      : {}),
  });
});

// 3. Verify Mobile OTP
authRouter.post('/otp/verify', async (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (!mobileNumber || !otp) {
    return res.status(400).json({ error: 'मोबाइल नंबर और OTP आवश्यक हैं।' });
  }

  if (typeof mobileNumber !== 'string' || typeof otp !== 'string') {
    return res.status(400).json({ error: 'मोबाइल नंबर और OTP आवश्यक हैं।' });
  }
  const cleanMobile = mobileNumber.replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    return res.status(400).json({ error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
  }

  try {
    assertAuthConfiguration();
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return res.status(503).json({ error: 'Authentication service is not configured' });
    }
    throw error;
  }

  const otpResult = otpService.verifyOtp(cleanMobile, otp);
  if (!otpResult.success) {
    return res.status(otpResult.code === 'BRUTE_FORCE' ? 429 : 400).json({
      error: otpResult.error,
      remainingAttempts: otpResult.remainingAttempts,
    });
  }

  // Verified!
  const clean = otpResult.mobileNumber!;

  // Check if existing user or create user
  let user = await repository.findUserByPhoneOrUsername(clean);
  if (user && !['USER', 'VOLUNTEER'].includes(user.role)) {
    return res.status(403).json({
      error: 'इस खाते के लिए मोबाइल OTP लॉगिन उपलब्ध नहीं है। कृपया अधिकृत व्यवस्थापक लॉगिन का उपयोग करें।',
    });
  }
  if (user && user.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'यह खाता सक्रिय नहीं है। सहायता टीम से संपर्क करें।' });
  }
  if (!user) {
    user = await repository.saveUser({
      id: `usr_${clean}`,
      phone: clean,
      fullName: 'देव दर्शनार्थी (Devotee)',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
  } else {
    user.lastLoginAt = new Date().toISOString();
    await repository.saveUser(user);
  }

  let token: string;
  try {
    token = createAuthToken(user.id);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return res.status(503).json({ error: 'Authentication service is not configured' });
    }
    throw error;
  }

  return res.json({
    success: true,
    message: 'प्रमाणीकरण सफल (Authentication Successful)',
    user: {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      token,
    },
    token,
  });
});

// 4. Session Validation
authRouter.get('/session', async (req, res) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!bearerToken) {
    return res.json({ authenticated: false, user: null });
  }

  try {
    const user = await getAuthenticatedUser(bearerToken);
    if (!user) {
      return res.json({ authenticated: false, user: null });
    }
    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return res.status(503).json({ error: 'Authentication service is not configured' });
    }
    throw error;
  }
});

// 5. Logout
authRouter.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'सफलतापूर्वक लॉगआउट किया गया।' });
});
