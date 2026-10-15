/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { asyncHandler } from '../middleware/asyncHandler';

export const routeAlertsRouter = Router();

routeAlertsRouter.get('/', asyncHandler(async (_req, res) => {
  const alerts = await repository.getRouteAlerts();
  return res.json({
    total: alerts.length,
    alerts,
  });
}));
