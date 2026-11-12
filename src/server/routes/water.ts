/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { asyncHandler } from '../middleware/asyncHandler';

export const waterRouter = Router();

waterRouter.get('/', asyncHandler(async (_req, res) => {
  const facilities = await repository.getFacilities('WATER');
  return res.json({
    total: facilities.length,
    facilities,
  });
}));
