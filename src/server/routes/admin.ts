/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const adminRouter = Router();

// 1. Dashboard Statistics
adminRouter.get('/stats', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN', 'FACILITY_ADMIN', 'HELP_ADMIN'), async (req, res) => {
  const users = await repository.getAllUsers();
  const volunteers = await repository.getVolunteers(true);
  const helpRequests = await repository.getHelpRequests('RECEIVED');
  const lostFound = await repository.getLostFoundReports();
  const parkings = await repository.getParkings();
  const facilities = await repository.getFacilities();
  const announcements = await repository.getAnnouncements(true);

  return res.json({
    totalUsers: users.length,
    verifiedVolunteers: volunteers.length,
    activeHelpRequests: helpRequests.length,
    activeLostFound: lostFound.filter((l) => l.status === 'UNDER_REVIEW' || l.status === 'SUBMITTED').length,
    parkingLocations: parkings.length,
    shuttlePoints: facilities.filter((f) => f.category === 'SHUTTLE').length,
    medicalFacilities: facilities.filter((f) => f.category === 'MEDICAL').length,
    toilets: facilities.filter((f) => f.category === 'TOILET').length,
    waterPoints: facilities.filter((f) => f.category === 'WATER').length,
    activeAnnouncements: announcements.length,
    lastUpdated: new Date().toISOString(),
  });
});

// 2. Festival Configuration
adminRouter.get('/festival-config', (req, res) => {
  return res.json(repository.getFestivalConfig());
});

// 3. User Directory (Admin Only)
adminRouter.get('/users', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const users = await repository.getAllUsers();
  return res.json({
    total: users.length,
    users: users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      phone: u.phone,
      email: u.email,
      role: u.role,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    })),
  });
});
