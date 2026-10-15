/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { getDatabaseStatus } from '../db/connection';

export const adminRouter = Router();

adminRouter.get(
  '/stats',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN', 'FACILITY_ADMIN', 'HELP_ADMIN'),
  asyncHandler(async (_req, res) => {
    const [users, volunteers, helpRequests, lostFound, parkings, facilities, announcements] =
      await Promise.all([
        repository.getAllUsers(),
        repository.getVolunteers(true),
        repository.getHelpRequests('RECEIVED'),
        repository.getLostFoundReports(),
        repository.getParkings(),
        repository.getFacilities(),
        repository.getAnnouncements(true),
      ]);
    return res.json({
      totalUsers: users.length,
      verifiedVolunteers: volunteers.length,
      activeHelpRequests: helpRequests.length,
      activeLostFound: lostFound.filter((report) =>
        report.status === 'UNDER_REVIEW' || report.status === 'SUBMITTED'
      ).length,
      parkingLocations: parkings.length,
      shuttlePoints: facilities.filter((facility) => facility.category === 'SHUTTLE').length,
      medicalFacilities: facilities.filter((facility) => facility.category === 'MEDICAL').length,
      toilets: facilities.filter((facility) => facility.category === 'TOILET').length,
      waterPoints: facilities.filter((facility) => facility.category === 'WATER').length,
      activeAnnouncements: announcements.length,
      isDemoData: getDatabaseStatus().connectionState !== 'CONNECTED',
      lastUpdated: new Date().toISOString(),
    });
  })
);

adminRouter.get('/festival-config', (_req, res) => res.status(503).json({
  error: 'Authoritative festival dates, contact numbers, and ghat coordinates are not configured.',
}));

adminRouter.get(
  '/users',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    const users = await repository.getAllUsers();
    return res.json({
      total: users.length,
      users: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      })),
    });
  })
);
