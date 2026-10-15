/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';

export const usersRouter = Router();

usersRouter.get('/profile', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = await repository.getUserById(req.user.id);
  if (!user) {
    return res.json({
      id: req.user.id,
      phone: req.user.phone,
      fullName: req.user.fullName,
      role: req.user.role,
      status: 'ACTIVE',
      preferences: { language: 'hi', seniorCitizenMode: false, highContrast: false },
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
}));

usersRouter.put('/profile', requireAuth, requirePersistentDatabase, asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { fullName, email, avatarUrl } = req.body;
  if (
    (fullName !== undefined && (typeof fullName !== 'string' || !fullName.trim() || fullName.length > 150)) ||
    (email !== undefined &&
      (typeof email !== 'string' || (email.length > 255) || (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))) ||
    (avatarUrl !== undefined && (typeof avatarUrl !== 'string' || avatarUrl.length > 2048))
  ) {
    return res.status(400).json({ error: 'Valid profile details required' });
  }
  const user = await repository.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (fullName !== undefined) user.fullName = fullName.trim();
  if (email !== undefined) user.email = email.trim() || undefined;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl || undefined;
  user.updatedAt = new Date().toISOString();
  await repository.saveUser(user);
  await repository.logAudit({
    userId: user.id,
    userName: user.fullName,
    action: 'UPDATE_PROFILE',
    entity: 'User',
    entityId: user.id,
    newValueSummary: 'Profile updated by user',
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
}));

usersRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const status = req.body.status;
    if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
      return res.status(400).json({ error: 'Valid user status required' });
    }
    if (req.user?.id === req.params.id && status === 'SUSPENDED') {
      return res.status(400).json({ error: 'You cannot suspend your own account' });
    }
    const updated = await repository.updateUserStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'USER_STATUS_CHANGE',
      entity: 'User',
      entityId: updated.id,
      newValueSummary: `Status set to ${updated.status}`,
      ipAddress: req.ip,
    });
    return res.json({
      success: true,
      user: { id: updated.id, fullName: updated.fullName, role: updated.role, status: updated.status },
    });
  })
);
