/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const notificationsRouter = Router();

notificationsRouter.get('/', async (req, res) => {
  const announcements = await repository.getAnnouncements(true);
  const notifications = announcements.map((a) => ({
    id: `notif-${a.id}`,
    title: a.title,
    body: a.shortDescription,
    category: a.category,
    priority: a.priority,
    timestamp: a.publishedAt,
    read: false,
  }));

  return res.json({
    total: notifications.length,
    notifications,
  });
});
