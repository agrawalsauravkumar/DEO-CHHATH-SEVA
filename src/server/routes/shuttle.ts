/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const shuttleRouter = Router();

shuttleRouter.get('/', async (req, res) => {
  const [routes, facilities] = await Promise.all([
    repository.getShuttleRoutes(),
    repository.getFacilities('SHUTTLE'),
  ]);
  return res.json({
    total: facilities.length,
    routes,
    points: facilities,
  });
});

shuttleRouter.get('/routes', async (req, res) => {
  const routes = await repository.getShuttleRoutes();
  return res.json({
    total: routes.length,
    routes,
  });
});

shuttleRouter.get('/points', async (req, res) => {
  const facilities = await repository.getFacilities('SHUTTLE');
  return res.json({
    total: facilities.length,
    points: facilities,
  });
});
