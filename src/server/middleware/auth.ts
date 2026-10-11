/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { repository } from '../db/repository';
import { DbUserRole } from '../db/types';

const AUTH_TOKEN_ISSUER = 'deo-chhath-seva';
const AUTH_TOKEN_AUDIENCE = 'deo-chhath-seva-api';
const AUTH_TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;

interface AuthTokenPayload {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

export class AuthConfigurationError extends Error {
  constructor() {
    super('Authentication signing secret is not configured');
    this.name = 'AuthConfigurationError';
  }
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32 || /placeholder|change.?me|example|replace|generate/i.test(secret)) {
    throw new AuthConfigurationError();
  }
  return secret;
}

export function assertAuthConfiguration(): void {
  getAuthSecret();
}

function signTokenContent(content: string): Buffer {
  return createHmac('sha256', getAuthSecret()).update(content).digest();
}

export function createAuthToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload: AuthTokenPayload = {
    sub: userId,
    iss: AUTH_TOKEN_ISSUER,
    aud: AUTH_TOKEN_AUDIENCE,
    iat: now,
    exp: now + AUTH_TOKEN_LIFETIME_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const content = `${header}.${encodedPayload}`;
  return `${content}.${signTokenContent(content).toString('base64url')}`;
}

function verifyAuthToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  let header: { alg?: string; typ?: string };
  let payload: Partial<AuthTokenPayload>;
  let signature: Buffer;

  try {
    header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    signature = Buffer.from(encodedSignature, 'base64url');
  } catch {
    return null;
  }

  if (header.alg !== 'HS256' || header.typ !== 'JWT') return null;

  const expectedSignature = signTokenContent(`${encodedHeader}.${encodedPayload}`);
  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(signature, expectedSignature)
  ) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    typeof payload.sub !== 'string' ||
    !payload.sub ||
    payload.iss !== AUTH_TOKEN_ISSUER ||
    payload.aud !== AUTH_TOKEN_AUDIENCE ||
    typeof payload.iat !== 'number' ||
    payload.iat > now ||
    typeof payload.exp !== 'number' ||
    payload.exp <= now ||
    payload.exp - payload.iat > AUTH_TOKEN_LIFETIME_SECONDS
  ) {
    return null;
  }

  return payload.sub;
}

export async function getAuthenticatedUser(token: string) {
  const userId = verifyAuthToken(token);
  if (!userId) return null;

  const user = await repository.getUserById(userId);
  return user?.status === 'ACTIVE' ? user : null;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: DbUserRole;
    phone?: string;
    username?: string;
    fullName: string;
  };
}

const ROLE_PRIORITY: Record<DbUserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  CONTENT_ADMIN: 80,
  FACILITY_ADMIN: 80,
  HELP_ADMIN: 80,
  VOLUNTEER: 50,
  USER: 10,
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!bearerToken) {
    return res.status(401).json({
      error: 'अनधिकृत पहुंच (Unauthorized): प्रमाणीकरण टोकन आवश्यक है।',
      code: 'AUTH_REQUIRED',
    });
  }

  getAuthenticatedUser(bearerToken).then((user) => {
    if (!user) {
      return res.status(401).json({
        error: 'अमान्य अथवा समाप्त टोकन (Invalid or expired token)।',
        code: 'TOKEN_INVALID',
      });
    }

    req.user = {
      id: user.id,
      role: user.role,
      phone: user.phone,
      username: user.username,
      fullName: user.fullName,
    };
    return next();
  }).catch((error: unknown) => {
    if (error instanceof AuthConfigurationError) {
      return res.status(503).json({ error: 'Authentication service is not configured' });
    }
    return next(error);
  });
};

export const requireRole = (...allowedRoles: DbUserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'प्रमाणीकरण आवश्यक है (Authentication Required)' });
    }

    const userRole = req.user.role;
    // Super admin bypasses all role checks
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: 'अनुमति नहीं है (Forbidden): इस कार्य हेतु आवश्यक विशेषाधिकार उपलब्ध नहीं हैं।',
      requiredRoles: allowedRoles,
      yourRole: userRole,
    });
  };
};
