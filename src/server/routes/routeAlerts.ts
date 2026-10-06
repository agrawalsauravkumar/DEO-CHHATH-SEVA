/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const routeAlertsRouter = Router();

routeAlertsRouter.get('/', async (req, res) => {
  const alerts = await repository.getRouteAlerts();
  return res.json({
    total: alerts.length,
    alerts,
  });
});
