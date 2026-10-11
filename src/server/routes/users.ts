/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const usersRouter = Router();

// Get current user profile
usersRouter.get('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await repository.getUserById(req.user.id);
  if (!user) {
    return res.json({
      id: req.user.id,
      phone: req.user.phone,
      fullName: req.user.fullName,
      role: req.user.role,
      status: 'ACTIVE',
      preferences: {
        language: 'hi',
        seniorCitizenMode: false,
        highContrast: false,
      },
    });
  }

  return res.json({
    id: user.id,
    phone: user.phone,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  });
});

// Update profile details
usersRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { fullName, email, avatarUrl } = req.body;
  const user = await repository.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (fullName) user.fullName = fullName.trim();
  if (email !== undefined) user.email = email.trim();
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  user.updatedAt = new Date().toISOString();

  await repository.saveUser(user);
  await repository.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'UPDATE_PROFILE',
    entity: 'User',
    entityId: user.id,
    newValueSummary: `Profile updated by user`,
    ipAddress: req.ip,
  });

  return res.json({
    success: true,
    user: {
      id: user.id,
      phone: user.phone,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});
