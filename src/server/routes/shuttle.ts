/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { asyncHandler } from '../middleware/asyncHandler';

export const shuttleRouter = Router();

shuttleRouter.get('/', asyncHandler(async (_req, res) => {
  const [routes, facilities] = await Promise.all([
    repository.getShuttleRoutes(),
    repository.getFacilities('SHUTTLE'),
  ]);
  return res.json({
    total: facilities.length,
    routes,
    points: facilities,
  });
}));

shuttleRouter.get('/routes', asyncHandler(async (_req, res) => {
  const routes = await repository.getShuttleRoutes();
  return res.json({
    total: routes.length,
    routes,
  });
}));

shuttleRouter.get('/points', asyncHandler(async (_req, res) => {
  const facilities = await repository.getFacilities('SHUTTLE');
  return res.json({
    total: facilities.length,
    points: facilities,
  });
}));
