/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

export const facilitiesRouter = Router();

// 1. Get All Facilities (Optional category filter)
facilitiesRouter.get('/', async (req, res) => {
  const category = req.query.category as string | undefined;
  const facilities = await repository.getFacilities(category);
  return res.json({
    total: facilities.length,
    facilities,
  });
});

// 2. PostGIS Spatial Nearby Query
// e.g. GET /api/facilities/nearby?lat=24.6548&lon=84.4372&radius=1500&category=PARKING
facilitiesRouter.get('/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  const radius = parseInt((req.query.radius as string) || '2000', 10);
  const category = req.query.category as string | undefined;

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: 'Valid lat and lon numeric coordinates required' });
  }

  const nearby = await repository.getNearbyFacilities(lat, lon, radius, category);
  return res.json({
    userLocation: { latitude: lat, longitude: lon },
    radiusMeters: radius,
    count: nearby.length,
    results: nearby,
  });
});

// 3. Get Facility by ID
facilitiesRouter.get('/:id', async (req, res) => {
  const facility = await repository.getFacilityById(req.params.id);
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found' });
  }
  return res.json(facility);
});

// 4. Create New Facility (Admin Only)
facilitiesRouter.post('/', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'), async (req: AuthenticatedRequest, res) => {
  const { name, category, latitude, longitude, address, description, phone } = req.body;
  if (!name || !category || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Name, category, latitude and longitude required' });
  }

  const newFac = await repository.createFacility({
    id: `fac-${Date.now()}`,
    name,
    category,
    latitude,
    longitude,
    address,
    description,
    phone,
    isVerified: true,
    isActive: true,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await repository.logAudit({
    userId: req.user?.id,
    userName: req.user?.fullName,
    action: 'CREATE_FACILITY',
    entity: 'Facility',
    entityId: newFac.id,
    newValueSummary: `Created facility ${name} (${category})`,
    ipAddress: req.ip,
  });

  return res.status(201).json(newFac);
});

// 5. Update Facility (Admin Only)
facilitiesRouter.put('/:id', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN', 'FACILITY_ADMIN'), async (req: AuthenticatedRequest, res) => {
  const updated = await repository.updateFacility(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Facility not found' });
  }

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
});
