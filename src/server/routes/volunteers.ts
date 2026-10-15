/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { repository } from '../db/repository';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { DbVolunteerStatus } from '../db/types';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';

export const volunteersRouter = Router();

volunteersRouter.get('/', asyncHandler(async (req, res) => {
  const volunteers = await repository.getVolunteers(req.query.onDuty === 'true', true);
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
}));

volunteersRouter.get('/admin', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN', 'FACILITY_ADMIN', 'HELP_ADMIN'), asyncHandler(async (_req, res) => {
  const volunteers = await repository.getVolunteers();
  return res.json({ total: volunteers.length, volunteers });
}));

volunteersRouter.get('/me', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const volunteer = (await repository.getVolunteers()).find((item) => item.userId === req.user!.id);
  return res.json({ volunteer: volunteer || null });
}));

volunteersRouter.post('/', requireAuth, requireRole('USER'), requirePersistentDatabase, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { fullName, phone, serviceAreas, servicesOffered, languages, availabilityTime, currentAssignedZone } = req.body;
  if (
    typeof fullName !== 'string' || !fullName.trim() || fullName.length > 150 ||
    typeof phone !== 'string' || !/^\+?[\d\s()-]{7,20}$/.test(phone) ||
    !Array.isArray(serviceAreas) || serviceAreas.length > 20 ||
    !serviceAreas.every((area: unknown) => typeof area === 'string' && area.length <= 100) ||
    !Array.isArray(servicesOffered) || servicesOffered.length > 20 ||
    !servicesOffered.every((service: unknown) => typeof service === 'string' && service.length <= 100) ||
    !Array.isArray(languages) || languages.length > 10 ||
    !languages.every((language: unknown) => typeof language === 'string' && language.length <= 50) ||
    (availabilityTime !== undefined &&
      (typeof availabilityTime !== 'string' || availabilityTime.length > 150)) ||
    (currentAssignedZone !== undefined &&
      (typeof currentAssignedZone !== 'string' || currentAssignedZone.length > 100))
  ) {
    return res.status(400).json({ error: 'Valid volunteer registration details required' });
  }
  if ((await repository.getVolunteers()).some((item) => item.userId === req.user!.id)) {
    return res.status(409).json({ error: 'इस खाते के लिए स्वयंसेवक आवेदन पहले से दर्ज है।' });
  }

  const now = new Date().toISOString();
  const volunteer = await repository.createVolunteer({
    id: randomUUID(),
    userId: req.user!.id,
    badgeNumber: `PENDING-${randomUUID().slice(0, 8).toUpperCase()}`,
    fullName: fullName.trim(),
    phone: phone.trim(),
    status: 'PENDING',
    serviceAreas,
    servicesOffered,
    languages,
    availabilityTime,
    currentAssignedZone: currentAssignedZone || serviceAreas[0] || '',
    isOnDuty: false,
    createdAt: now,
    updatedAt: now,
  });
  await repository.logAudit({
    action: 'VOLUNTEER_REGISTRATION',
    entity: 'Volunteer',
    entityId: volunteer.id,
    newValueSummary: 'New volunteer application submitted for verification',
    ipAddress: req.ip,
  });
  return res.status(201).json({ success: true, volunteer });
}));

volunteersRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'),
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const statuses: DbVolunteerStatus[] = ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'];
    const status = req.body.status;
    if (typeof status !== 'string' || !statuses.includes(status as DbVolunteerStatus)) {
      return res.status(400).json({ error: 'Valid volunteer status required' });
    }
    const volunteer = await repository.updateVolunteerStatus(
      req.params.id,
      status as DbVolunteerStatus,
      req.user?.id
    );
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'VOLUNTEER_STATUS_UPDATE',
      entity: 'Volunteer',
      entityId: volunteer.id,
      newValueSummary: `Status set to ${volunteer.status}`,
      ipAddress: req.ip,
    });
    return res.json({ success: true, volunteer });
  })
);

volunteersRouter.patch('/:id/duty', requireAuth, requirePersistentDatabase, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { isOnDuty } = req.body;
  if (typeof isOnDuty !== 'boolean') {
    return res.status(400).json({ error: 'isOnDuty boolean flag required' });
  }

  const volunteer = (await repository.getVolunteers()).find((item) => item.id === req.params.id);
  if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

  const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'].includes(req.user!.role);
  if (!isAdmin && volunteer.userId !== req.user!.id) {
    return res.status(403).json({ error: 'You may only update your own volunteer duty status' });
  }
  if (!isAdmin && volunteer.status !== 'VERIFIED') {
    return res.status(403).json({ error: 'Only verified volunteers may change duty status' });
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
}));
