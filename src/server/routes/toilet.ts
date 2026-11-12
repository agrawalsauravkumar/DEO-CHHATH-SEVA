/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { asyncHandler } from '../middleware/asyncHandler';

export const toiletRouter = Router();

toiletRouter.get('/', asyncHandler(async (_req, res) => {
  const facilities = await repository.getFacilities('TOILET');
  return res.json({
    total: facilities.length,
    facilities,
  });
}));
