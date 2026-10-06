/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const helpRouter = Router();

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
  const { type, description, userName, userPhone, latitude, longitude, priority } = req.body;
  if (!type || !description) {
    return res.status(400).json({ error: 'Type and description required' });
  }

  const reqNumber = `REQ-DEO-${Date.now().toString().slice(-6)}`;
  const newReq = await repository.createHelpRequest({
    id: `help-${Date.now()}`,
    requestNumber: reqNumber,
    type,
    description,
    userName: userName || 'अज्ञात श्रद्धालु',
    userPhone: userPhone || '',
    latitude,
    longitude,
    status: 'RECEIVED',
    priority: priority || 'NORMAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: 'आपकी सहायता प्रार्थना मेला नियंत्रण कक्ष को प्रेषित कर दी गई है।',
    request: newReq,
  });
});

// 3. Get Help Requests (Volunteers & Admin)
helpRouter.get('/requests', async (req, res) => {
  const status = req.query.status as string | undefined;
  const requests = await repository.getHelpRequests(status);
  return res.json({ total: requests.length, requests });
});

// 4. Update Help Request Status (Assign / Resolve)
helpRouter.patch('/requests/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { status, resolutionNotes } = req.body;
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
