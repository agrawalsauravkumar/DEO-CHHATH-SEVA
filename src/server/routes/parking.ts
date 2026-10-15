/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { DbParkingStatus } from '../db/types';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';

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
parkingRouter.patch('/:id/status', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'), requirePersistentDatabase, async (req: AuthenticatedRequest, res) => {
  const { status, availableCapacity } = req.body;
  const validStatuses: DbParkingStatus[] = ['AVAILABLE', 'LIMITED', 'FULL', 'CLOSED', 'UNKNOWN'];
  const parkingStatus = validStatuses.find((validStatus) => validStatus === status);
  if (!parkingStatus) {
    return res.status(400).json({ error: 'Valid parking status is required' });
  }
  if (
    availableCapacity !== undefined &&
    (!Number.isInteger(availableCapacity) || availableCapacity < 0)
  ) {
    return res.status(400).json({ error: 'Available capacity must be a non-negative integer' });
  }
  const parking = (await repository.getParkings()).find((item) => item.id === req.params.id);
  if (!parking) {
    return res.status(404).json({ error: 'Parking location not found' });
  }
  if (
    availableCapacity !== undefined &&
    parking.totalCapacity !== undefined &&
    availableCapacity > parking.totalCapacity
  ) {
    return res.status(400).json({ error: 'Available capacity cannot exceed total capacity' });
  }

  const updated = await repository.updateParkingStatus(req.params.id, parkingStatus, availableCapacity);
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
