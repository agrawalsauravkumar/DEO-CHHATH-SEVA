/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { repository } from '../db/repository';
import { DbAnnouncementCategory, DbAnnouncementPriority, DbAnnouncementStatus } from '../db/types';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';

export const announcementsRouter = Router();

const categories: DbAnnouncementCategory[] = [
  'EMERGENCY', 'ROUTE', 'PARKING', 'SHUTTLE', 'MEDICAL', 'HELP', 'GENERAL', 'CHHATH_INFO', 'SAFETY',
];
const priorities: DbAnnouncementPriority[] = ['NORMAL', 'IMPORTANT', 'URGENT', 'EMERGENCY'];
const statuses: DbAnnouncementStatus[] = [
  'DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'EXPIRED',
];
const ISO_TIMESTAMP_WITH_TIMEZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

announcementsRouter.get('/', asyncHandler(async (_req, res) => {
  const announcements = await repository.getAnnouncements(true);
  return res.json({ total: announcements.length, announcements });
}));

announcementsRouter.get(
  '/admin',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN'),
  asyncHandler(async (_req, res) => {
    const announcements = await repository.getAnnouncements(false);
    return res.json({ total: announcements.length, announcements });
  })
);

announcementsRouter.post(
  '/',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN'),
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { title, shortDescription, details, category, priority, expiresAt } = req.body;
    const expiryTimestamp =
      typeof expiresAt === 'string' && ISO_TIMESTAMP_WITH_TIMEZONE.test(expiresAt)
        ? Date.parse(expiresAt)
        : NaN;
    if (
      typeof title !== 'string' || !title.trim() || title.length > 255 ||
      typeof shortDescription !== 'string' || !shortDescription.trim() || shortDescription.length > 4000 ||
      (details !== undefined && (typeof details !== 'string' || details.length > 10000)) ||
      (category !== undefined && !categories.includes(category)) ||
      (priority !== undefined && !priorities.includes(priority)) ||
      !Number.isFinite(expiryTimestamp) ||
      expiryTimestamp <= Date.now()
    ) {
      return res.status(400).json({
        error: 'Valid announcement fields and a future timezone-aware expiry timestamp are required',
      });
    }

    const announcement = await repository.createAnnouncement({
      id: randomUUID(),
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      details,
      category: category || 'GENERAL',
      priority: priority || 'NORMAL',
      status: 'PUBLISHED',
      isVerifiedOfficial: true,
      source: req.user?.fullName || 'मेला नियंत्रण कक्ष',
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(expiryTimestamp).toISOString(),
      createdBy: req.user?.id,
    });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'PUBLISH_ANNOUNCEMENT',
      entity: 'Announcement',
      entityId: announcement.id,
      newValueSummary: `Title: ${announcement.title} (${announcement.priority})`,
      ipAddress: req.ip,
    });
    return res.status(201).json({ success: true, announcement });
  })
);

announcementsRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN'),
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const status = req.body.status;
    if (typeof status !== 'string' || !statuses.includes(status as DbAnnouncementStatus)) {
      return res.status(400).json({ error: 'Valid announcement status required' });
    }
    if (status === 'PUBLISHED') {
      const existing = await repository.getAnnouncements(false);
      const announcement = existing.find((item) => item.id === req.params.id);
      if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
      if (!announcement.expiresAt || Date.parse(announcement.expiresAt) <= Date.now()) {
        return res.status(400).json({ error: 'An explicit future expiry is required to publish this announcement' });
      }
    }
    const announcement = await repository.updateAnnouncementStatus(req.params.id, status as DbAnnouncementStatus);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'UPDATE_ANNOUNCEMENT_STATUS',
      entity: 'Announcement',
      entityId: announcement.id,
      newValueSummary: `Status set to ${announcement.status}`,
      ipAddress: req.ip,
    });
    return res.json({ success: true, announcement });
  })
);

announcementsRouter.patch(
  '/route-alerts/:id',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN'),
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (typeof req.body.isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive boolean flag required' });
    }
    const alert = await repository.toggleRouteAlert(req.params.id, req.body.isActive);
    if (!alert) return res.status(404).json({ error: 'Route alert not found' });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'TOGGLE_ROUTE_ALERT',
      entity: 'RouteAlert',
      entityId: alert.id,
      newValueSummary: `Active set to ${alert.isActive}`,
      ipAddress: req.ip,
    });
    return res.json({ success: true, alert });
  })
);
