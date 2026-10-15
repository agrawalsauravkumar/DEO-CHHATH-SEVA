/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { repository } from '../db/repository';
import { DbFacilityCategory } from '../db/types';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';

export const facilitiesRouter = Router();

const FACILITY_CATEGORIES = ['PARKING', 'SHUTTLE', 'MEDICAL', 'TOILET', 'WATER', 'HELP', 'RELIGIOUS'];

function isFacilityCategory(value: unknown): value is DbFacilityCategory {
  return typeof value === 'string' && FACILITY_CATEGORIES.includes(value);
}

facilitiesRouter.get('/', asyncHandler(async (req, res) => {
  const category = req.query.category as string | undefined;
  if (category && !isFacilityCategory(category)) {
    return res.status(400).json({ error: 'Valid facility category required' });
  }
  const facilities = await repository.getFacilities(category);
  return res.json({ total: facilities.length, facilities });
}));

facilitiesRouter.get('/nearby', asyncHandler(async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const radius = Number(req.query.radius || 2000);
  const category = req.query.category as string | undefined;
  if (
    !Number.isFinite(lat) || lat < -90 || lat > 90 ||
    !Number.isFinite(lon) || lon < -180 || lon > 180 ||
    !Number.isFinite(radius) || radius < 1 || radius > 50000 ||
    (category !== undefined && !isFacilityCategory(category))
  ) {
    return res.status(400).json({ error: 'Valid coordinates, radius, and category required' });
  }

  const results = await repository.getNearbyFacilities(lat, lon, radius, category);
  return res.json({
    userLocation: { latitude: lat, longitude: lon },
    radiusMeters: radius,
    count: results.length,
    results,
  });
}));

facilitiesRouter.get('/:id', asyncHandler(async (req, res) => {
  const facility = await repository.getFacilityById(req.params.id);
  if (!facility) return res.status(404).json({ error: 'Facility not found' });
  return res.json(facility);
}));

facilitiesRouter.post(
  '/',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'),
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { name, nameEn, category, latitude, longitude, address, description, phone } = req.body;
    if (
      typeof name !== 'string' || !name.trim() || name.length > 200 ||
      (nameEn !== undefined && (typeof nameEn !== 'string' || nameEn.length > 200)) ||
      !isFacilityCategory(category) ||
      typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
      (address !== undefined && (typeof address !== 'string' || address.length > 500)) ||
      (description !== undefined && (typeof description !== 'string' || description.length > 4000)) ||
      (phone !== undefined && (typeof phone !== 'string' || phone.length > 50))
    ) {
      return res.status(400).json({ error: 'Valid name, category, coordinates, and optional details required' });
    }

    const now = new Date().toISOString();
    const facility = await repository.createFacility({
      id: randomUUID(),
      name: name.trim(),
      nameEn,
      category,
      latitude,
      longitude,
      address,
      description,
      phone,
      isVerified: true,
      isActive: true,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'CREATE_FACILITY',
      entity: 'Facility',
      entityId: facility.id,
      newValueSummary: `Created facility ${facility.name} (${facility.category})`,
      ipAddress: req.ip,
    });
    return res.status(201).json(facility);
  })
);

facilitiesRouter.put(
  '/:id',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'),
  requirePersistentDatabase,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const allowedKeys = [
      'name', 'nameEn', 'category', 'latitude', 'longitude', 'address', 'description', 'phone',
      'isVerified', 'isActive', 'isArchived',
    ];
    if (Object.keys(req.body).some((key) => !allowedKeys.includes(key))) {
      return res.status(400).json({ error: 'Unsupported facility field' });
    }
    const updated = await repository.updateFacility(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Facility not found' });
    await repository.logAudit({
      userId: req.user?.id,
      userName: req.user?.fullName,
      action: 'UPDATE_FACILITY',
      entity: 'Facility',
      entityId: updated.id,
      newValueSummary: `Updated facility ${updated.name}`,
      ipAddress: req.ip,
    });
    return res.json(updated);
  })
);
