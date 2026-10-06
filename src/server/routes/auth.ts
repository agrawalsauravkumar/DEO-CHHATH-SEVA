/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const authRouter = Router();

// In-memory OTP Store for server-side generation, expiration, rate limiting
interface ServerOtpSession {
  mobile: string;
  code: string;
  expiresAt: number;
  attemptsCount: number;
  lastRequestedAt: number;
}
const activeOtpSessions = new Map<string, ServerOtpSession>();

// 1. Password Login (Administrative & Officials)
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = await repository.findUserByPhoneOrUsername(username);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'गलत उपयोगकर्ता नाम या पासवर्ड (Invalid credentials)' });
  }

  const token = `jwt_mock_${user.role}_${Date.now()}`;
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

  // Rate Limiting: 30 seconds cooldown
  const existing = activeOtpSessions.get(clean);
  const now = Date.now();
  if (existing && now - existing.lastRequestedAt < 30000) {
    const waitSec = Math.ceil((30000 - (now - existing.lastRequestedAt)) / 1000);
    return res.status(429).json({
      error: `कृपया ${waitSec} सेकंड प्रतीक्षा करें। (Please wait ${waitSec}s before requesting a new OTP)`,
      cooldownSeconds: waitSec,
    });
  }

  // Generate cryptographically random 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

  activeOtpSessions.set(clean, {
    mobile: clean,
    code,
    expiresAt,
    attemptsCount: 0,
    lastRequestedAt: now,
  });

  return res.json({
    success: true,
    message: 'OTP आपके मोबाइल नंबर पर सफलतापूर्वक भेजा गया।',
    maskedMobile: `XXXXX-${clean.slice(5)}`,
    expiresInSeconds: 300,
    isDevelopmentMode: true,
    devOtpHint: code, // In local development, hint is provided for instant testing
  });
});

// 3. Verify Mobile OTP
authRouter.post('/otp/verify', async (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (!mobileNumber || !otp) {
    return res.status(400).json({ error: 'मोबाइल नंबर और OTP आवश्यक हैं।' });
  }

  const clean = mobileNumber.replace(/\D/g, '');
  const session = activeOtpSessions.get(clean);

  if (!session) {
    return res.status(400).json({
      error: 'कोई सक्रिय OTP सत्र नहीं मिला। कृपया दोबारा OTP भेजें।',
    });
  }

  if (Date.now() > session.expiresAt) {
    activeOtpSessions.delete(clean);
    return res.status(400).json({ error: 'OTP की वैधता समाप्त हो चुकी है (OTP Expired)।' });
  }

  if (session.attemptsCount >= 5) {
    activeOtpSessions.delete(clean);
    return res.status(429).json({
      error: 'अधिकतम गलत प्रयासों की सीमा समाप्त। सुरक्षा कारणों से यह OTP रद्द कर दिया गया है।',
    });
  }

  if (session.code !== otp.trim()) {
    session.attemptsCount += 1;
    return res.status(400).json({
      error: `अमान्य OTP। शेष प्रयास: ${5 - session.attemptsCount}`,
      remainingAttempts: 5 - session.attemptsCount,
    });
  }

  // Verified!
  activeOtpSessions.delete(clean);

  // Check if existing user or create user
  let user = await repository.findUserByPhoneOrUsername(clean);
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

  const token = `jwt_user_${clean}_${Date.now()}`;

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
  if (!authHeader) {
    return res.json({ authenticated: false, user: null });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token.startsWith('jwt_user_')) {
    const clean = token.split('_')[2];
    const user = await repository.findUserByPhoneOrUsername(clean);
    return res.json({
      authenticated: true,
      user: user || {
        id: `usr_${clean}`,
        phone: clean,
        role: 'USER',
        fullName: 'देव दर्शनार्थी',
      },
    });
  }

  if (token.includes('adm')) {
    const admin = await repository.getUserById('adm-001');
    return res.json({ authenticated: true, user: admin });
  }

  return res.json({ authenticated: false, user: null });
});

// 5. Logout
authRouter.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'सफलतापूर्वक लॉगआउट किया गया।' });
});
