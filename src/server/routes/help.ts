/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { repository } from '../db/repository';
import { DbHelpRequestStatus } from '../db/types';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';

export const helpRouter = Router();

function isHelpRequestStatus(value: unknown): value is DbHelpRequestStatus {
  return value === 'RECEIVED' || value === 'ASSIGNED' || value === 'IN_PROGRESS' ||
    value === 'ESCALATED' || value === 'RESOLVED' || value === 'CANCELLED';
}

const getHelpOverview = asyncHandler(async (_req, res) => {
  const points = await repository.getFacilities('HELP');
  return res.json({
    helplines: {
      police: '112',
      ambulance: '108',
      fire: '101',
      women: '181',
      elderline: '14567',
    },
    helpPoints: points,
  });
});

helpRouter.get('/', getHelpOverview);
helpRouter.get('/points', getHelpOverview);

helpRouter.post('/request', requirePersistentDatabase, asyncHandler(async (req, res) => {
  const { type, description, userName, userPhone, latitude, longitude } = req.body;
  if (
    typeof type !== 'string' || !type.trim() || type.length > 80 ||
    typeof description !== 'string' || !description.trim() || description.length > 2000 ||
    (userName !== undefined && (typeof userName !== 'string' || userName.length > 120)) ||
    (userPhone !== undefined &&
      (typeof userPhone !== 'string' || !/^\+?[\d\s()-]{7,20}$/.test(userPhone))) ||
    typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180
  ) {
    return res.status(400).json({ error: 'Valid help request details required' });
  }

  const now = new Date().toISOString();
  const request = await repository.createHelpRequest({
    id: randomUUID(),
    requestNumber: `REQ-DEO-${randomUUID().slice(0, 8).toUpperCase()}`,
    type: type.trim(),
    description: description.trim(),
    userName: userName?.trim() || 'अज्ञात श्रद्धालु',
    userPhone: userPhone?.trim() || '',
    latitude,
    longitude,
    status: 'RECEIVED',
    priority: 'NORMAL',
    createdAt: now,
    updatedAt: now,
  });
  return res.status(201).json({
    success: true,
    message: 'आपका सहायता अनुरोध सफलतापूर्वक दर्ज हुआ है।',
    request,
  });
}));

helpRouter.get(
  '/requests',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'HELP_ADMIN', 'VOLUNTEER', 'USER'),
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const status = req.query.status as string | undefined;
    if (status && !isHelpRequestStatus(status)) {
      return res.status(400).json({ error: 'Valid help request status required' });
    }
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HELP_ADMIN'].includes(req.user!.role);
    let requests = await repository.getHelpRequests(status);
    if (!isAdmin) {
      const volunteer = (await repository.getVolunteers()).find(
        (item) => item.userId === req.user!.id && item.status === 'VERIFIED'
      );
      if (!volunteer) return res.status(403).json({ error: 'Verified volunteer account required' });
      requests = requests.filter(
        (item) => !item.assignedVolunteerId || item.assignedVolunteerId === volunteer.id
      );
      requests = requests.map((item) => item.assignedVolunteerId === volunteer.id
        ? item
        : { ...item, userPhone: undefined });
    }
    return res.json({ total: requests.length, requests });
  })
);

helpRouter.patch(
  '/requests/:id',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'HELP_ADMIN', 'VOLUNTEER', 'USER'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { status, resolutionNotes } = req.body;
    if (!isHelpRequestStatus(status)) {
      return res.status(400).json({ error: 'Valid help request status required' });
    }
    if (resolutionNotes !== undefined &&
      (typeof resolutionNotes !== 'string' || resolutionNotes.length > 2000)) {
      return res.status(400).json({ error: 'Resolution notes must be 2000 characters or fewer' });
    }

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HELP_ADMIN'].includes(req.user!.role);
    let assignedVolunteerId: string | undefined;
    if (isAdmin && req.body.assignedVolunteerId !== undefined) {
      if (typeof req.body.assignedVolunteerId !== 'string') {
        return res.status(400).json({ error: 'assignedVolunteerId must be a string' });
      }
      const volunteer = (await repository.getVolunteers()).find(
        (item) => item.id === req.body.assignedVolunteerId && item.status === 'VERIFIED'
      );
      if (!volunteer) return res.status(400).json({ error: 'Verified volunteer not found' });
      assignedVolunteerId = volunteer.id;
    }

    if (!isAdmin) {
      const volunteer = (await repository.getVolunteers()).find(
        (item) => item.userId === req.user!.id && item.status === 'VERIFIED'
      );
      if (!volunteer) return res.status(403).json({ error: 'Verified volunteer account required' });
      const existing = (await repository.getHelpRequests()).find((item) => item.id === req.params.id);
      if (!existing) return res.status(404).json({ error: 'Help request not found' });
      if (status === 'RECEIVED' && existing.assignedVolunteerId === volunteer.id) {
        const released = await repository.releaseHelpRequest(req.params.id, volunteer.id);
        if (!released) return res.status(409).json({ error: 'Help request assignment changed; refresh and retry' });
        await repository.logAudit({
          userId: req.user?.id,
          userName: req.user?.fullName,
          action: 'HELP_REQUEST_RELEASED',
          entity: 'HelpRequest',
          entityId: released.id,
          newValueSummary: 'Volunteer released the assignment',
          ipAddress: req.ip,
        });
        return res.json(released);
      }
      if (status === 'ASSIGNED' && !existing.assignedVolunteerId) {
        if (!volunteer.isOnDuty) {
          return res.status(403).json({ error: 'Set yourself on duty before accepting a help request' });
        }
        assignedVolunteerId = volunteer.id;
      } else if (existing.assignedVolunteerId !== volunteer.id) {
        return res.status(403).json({ error: 'You may only update a request assigned to you' });
      }
    }

    const updated = await repository.updateHelpRequestStatus(
      req.params.id,
      status,
      resolutionNotes,
      assignedVolunteerId
    );
    if (!updated) {
      return res.status(status === 'ASSIGNED' ? 409 : 404).json({
        error: status === 'ASSIGNED'
          ? 'Help request was just assigned to another volunteer; refresh the list'
          : 'Help request not found',
      });
    }

    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'HELP_REQUEST_UPDATE',
      entity: 'HelpRequest',
      entityId: updated.id,
      newValueSummary: `Status set to ${updated.status}`,
      ipAddress: req.ip,
    });
    return res.json(updated);
  })
);
