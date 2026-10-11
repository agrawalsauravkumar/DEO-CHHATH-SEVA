/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { DbHelpRequestStatus } from '../db/types';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const helpRouter = Router();

function isHelpRequestStatus(value: unknown): value is DbHelpRequestStatus {
  return value === 'RECEIVED' ||
    value === 'ASSIGNED' ||
    value === 'IN_PROGRESS' ||
    value === 'ESCALATED' ||
    value === 'RESOLVED' ||
    value === 'CANCELLED';
}

// 1. Get Official Help Points & Emergency Helplines
helpRouter.get('/points', async (req, res) => {
  const points = await repository.getFacilities('HELP');
  return res.json({
    helplines: {
      police: '112',
      ambulance: '108',
      fire: '101',
      women: '181',
      elderline: '14567',
      melaControlRoom: '06186-224200',
    },
    helpPoints: points,
  });
});

// 2. Submit Help Request (SOS)
helpRouter.post('/request', async (req, res) => {
  const { type, description, userName, userPhone, latitude, longitude } = req.body;
  if (
    typeof type !== 'string' ||
    !type.trim() ||
    type.length > 80 ||
    typeof description !== 'string' ||
    !description.trim() ||
    description.length > 2000 ||
    (userName !== undefined && (typeof userName !== 'string' || userName.length > 120)) ||
    (userPhone !== undefined && (typeof userPhone !== 'string' || !/^\+?[\d\s()-]{7,20}$/.test(userPhone))) ||
    ((latitude !== undefined || longitude !== undefined) &&
      (typeof latitude !== 'number' ||
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        typeof longitude !== 'number' ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180))
  ) {
    return res.status(400).json({ error: 'Valid help request details required' });
  }

  const reqNumber = `REQ-DEO-${Date.now().toString().slice(-6)}`;
  const newReq = await repository.createHelpRequest({
    id: `help-${Date.now()}`,
    requestNumber: reqNumber,
    type: type.trim(),
    description: description.trim(),
    userName: userName || 'अज्ञात श्रद्धालु',
    userPhone: userPhone || '',
    latitude,
    longitude,
    status: 'RECEIVED',
    priority: 'NORMAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: 'सर्वर प्रक्रिया ने अनुरोध प्राप्त किया है। स्थायी संग्रहण या सहायता भेजे जाने की पुष्टि नहीं है।',
    request: newReq,
  });
});

// 3. Get Help Requests (Volunteers & Admin)
helpRouter.get('/requests', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'HELP_ADMIN', 'VOLUNTEER'), async (req, res) => {
  const status = req.query.status as string | undefined;
  const requests = await repository.getHelpRequests(status);
  return res.json({ total: requests.length, requests });
});

// 4. Update Help Request Status (Assign / Resolve)
helpRouter.patch('/requests/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'HELP_ADMIN', 'VOLUNTEER'), async (req: AuthenticatedRequest, res) => {
  const { status, resolutionNotes } = req.body;
  if (!isHelpRequestStatus(status)) {
    return res.status(400).json({ error: 'Valid help request status required' });
  }
  const updated = await repository.updateHelpRequestStatus(req.params.id, status, resolutionNotes);
  if (!updated) {
    return res.status(404).json({ error: 'Help request not found' });
  }

  await repository.logAudit({
    userId: req.user?.id,
    userName: req.user?.fullName,
    action: 'HELP_REQUEST_UPDATE',
    entity: 'HelpRequest',
    entityId: updated.id,
    newValueSummary: `Status set to ${status}`,
    ipAddress: req.ip,
  });

  return res.json(updated);
});
