/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const syncRouter = Router();

// Full Sync Package (Used by Offline Map and Local Storage Sync)
syncRouter.get(['/bundle', '/package'], async (req, res) => {
  const facilities = await repository.getFacilities();
  const parkings = await repository.getParkings();
  const shuttleRoutes = await repository.getShuttleRoutes();
  const announcements = await repository.getAnnouncements(true);
  const routeAlerts = await repository.getRouteAlerts();
  return res.json({
    version: '1.4.0',
    generatedAt: new Date().toISOString(),
    organization: 'NEXTGEN DEVBHOOMI FOUNDATION',
    data: {
      facilities,
      parkings,
      shuttleRoutes,
      announcements,
      routeAlerts,
    },
    counts: {
      facilities: facilities.length,
      parkings: parkings.length,
      announcements: announcements.length,
      routeAlerts: routeAlerts.length,
    },
  });
});

// Sync Status Timestamp
syncRouter.get('/status', (req, res) => {
  return res.json({
    isOnline: true,
    serverTime: new Date().toISOString(),
    latestDataRevision: 104,
  });
});
