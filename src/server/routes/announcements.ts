/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const announcementsRouter = Router();

// 1. Get Official Announcements
announcementsRouter.get('/', async (req, res) => {
  const announcements = await repository.getAnnouncements(true);
  return res.json({
    total: announcements.length,
    announcements,
  });
});

// 2. Broadcast / Publish New Official Announcement (Content Admin & Super Admin)
announcementsRouter.post('/', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN'), async (req: AuthenticatedRequest, res) => {
  const { title, shortDescription, details, category, priority, routeAlert } = req.body;
  if (!title || !shortDescription) {
    return res.status(400).json({ error: 'Title and shortDescription required' });
  }

  const ann = await repository.createAnnouncement({
    id: `ann-${Date.now()}`,
    title,
    shortDescription,
    details,
    category: category || 'GENERAL',
    priority: priority || 'NORMAL',
    status: 'PUBLISHED',
    isVerifiedOfficial: true,
    source: req.user?.fullName || 'मेला नियंत्रण कक्ष',
    publishedAt: new Date().toISOString(),
    routeAlert,
  });

  await repository.logAudit({
    userId: req.user?.id,
    userName: req.user?.fullName,
    action: 'PUBLISH_ANNOUNCEMENT',
    entity: 'Announcement',
    entityId: ann.id,
    newValueSummary: `Title: ${title} (${priority})`,
    ipAddress: req.ip,
  });

  return res.status(201).json({ success: true, announcement: ann });
});
