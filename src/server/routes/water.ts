/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const waterRouter = Router();

waterRouter.get('/', async (req, res) => {
  const facilities = await repository.getFacilities('WATER');
  return res.json({
    total: facilities.length,
    facilities,
  });
});
