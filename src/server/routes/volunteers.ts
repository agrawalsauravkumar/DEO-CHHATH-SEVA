/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const volunteersRouter = Router();

// 1. Get Volunteer Directory (Optionally only on-duty)
volunteersRouter.get('/', async (req, res) => {
  const onDutyOnly = req.query.onDuty === 'true';
  const volunteers = await repository.getVolunteers(onDutyOnly);
  return res.json({
    total: volunteers.length,
    volunteers: volunteers.map((volunteer) => ({
      id: volunteer.id,
      badgeNumber: volunteer.badgeNumber,
      fullName: volunteer.fullName,
      status: volunteer.status,
      serviceAreas: volunteer.serviceAreas,
      servicesOffered: volunteer.servicesOffered,
      currentAssignedZone: volunteer.currentAssignedZone,
      isOnDuty: volunteer.isOnDuty,
    })),
  });
});

// 2. Toggle On-Duty Status (Volunteer self or Admin)
volunteersRouter.patch('/:id/duty', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { isOnDuty } = req.body;
  if (typeof isOnDuty !== 'boolean') {
    return res.status(400).json({ error: 'isOnDuty boolean flag required' });
  }

  const volunteer = (await repository.getVolunteers()).find((item) => item.id === req.params.id);
  if (!volunteer) {
    return res.status(404).json({ error: 'Volunteer not found' });
  }

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'].includes(req.user!.role);
  if (!isAdmin && (req.user!.role !== 'VOLUNTEER' || volunteer.userId !== req.user!.id)) {
    return res.status(403).json({ error: 'You may only update your own volunteer duty status' });
  }

  const updated = await repository.toggleVolunteerDuty(req.params.id, isOnDuty);
  if (!updated) return res.status(404).json({ error: 'Volunteer not found' });

  await repository.logAudit({
    userId: req.user?.id,
    userName: req.user?.fullName,
    action: 'VOLUNTEER_DUTY_TOGGLE',
    entity: 'Volunteer',
    entityId: updated.id,
    newValueSummary: `Duty set to ${isOnDuty ? 'ON DUTY' : 'OFF DUTY'}`,
    ipAddress: req.ip,
  });

  return res.json(updated);
});
