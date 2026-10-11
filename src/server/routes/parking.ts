/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const parkingRouter = Router();

// Get All Parking Facilities
parkingRouter.get('/', async (req, res) => {
  const parkings = await repository.getParkings();
  return res.json({
    total: parkings.length,
    parkings,
  });
});

// Update Live Parking Occupancy Status (Facility Admin or Police)
parkingRouter.patch('/:id/status', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'), async (req: AuthenticatedRequest, res) => {
  const { status, availableCapacity } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updated = await repository.updateParkingStatus(req.params.id, status, availableCapacity);
  if (!updated) {
    return res.status(404).json({ error: 'Parking location not found' });
  }

  await repository.logAudit({
    userId: req.user?.id,
    userName: req.user?.fullName,
    action: 'UPDATE_PARKING_STATUS',
    entity: 'Parking',
    entityId: updated.id,
    newValueSummary: `Status set to ${status}, available: ${availableCapacity}`,
    ipAddress: req.ip,
  });

  return res.json(updated);
});
