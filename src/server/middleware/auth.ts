/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import { DbUserRole } from '../db/types';

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
  if (!authHeader) {
    return res.status(401).json({
      error: 'अनधिकृत पहुंच (Unauthorized): प्रमाणीकरण टोकन आवश्यक है।',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // Handle Mock/Demo & Dev JWT tokens
  if (token.startsWith('jwt_user_')) {
    const parts = token.split('_');
    const phone = parts[2] || '';
    req.user = {
      id: `usr_${phone}`,
      role: 'USER',
      phone,
      fullName: 'देव दर्शनार्थी (Devotee)',
    };
    return next();
  }

  if (token.includes('SUPER_ADMIN') || token.includes('super_admin')) {
    req.user = {
      id: 'adm-001',
      role: 'SUPER_ADMIN',
      username: 'admin@nextgendevbhoomi.org',
      fullName: 'मुख्य समन्वयक (NextGen Dev Bhoomi Foundation)',
    };
    return next();
  }

  if (token.includes('CONTENT_ADMIN') || token.includes('controller')) {
    req.user = {
      id: 'adm-002',
      role: 'CONTENT_ADMIN',
      username: 'controller@aurangabad.gov.in',
      fullName: 'मेला नियंत्रण कक्ष अधिकारी (जिला प्रशासन औरंगाबाद)',
    };
    return next();
  }

  if (token.includes('ADMIN') || token.includes('adm')) {
    req.user = {
      id: 'adm-001',
      role: 'ADMIN',
      fullName: 'प्रशासक अधिकारी (Mela Administrator)',
    };
    return next();
  }

  if (token.includes('VOLUNTEER') || token.includes('vol')) {
    req.user = {
      id: 'vol-001',
      role: 'VOLUNTEER',
      fullName: 'सत्यापित स्वयंसेवक (Verified Volunteer)',
    };
    return next();
  }

  return res.status(401).json({
    error: 'अमान्य अथवा समाप्त टोकन (Invalid or expired token)।',
    code: 'TOKEN_INVALID',
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
