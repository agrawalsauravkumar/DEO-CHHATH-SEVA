/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';

export const medicalRouter = Router();

medicalRouter.get('/', async (req, res) => {
  const facilities = await repository.getFacilities('MEDICAL');
  return res.json({
    total: facilities.length,
    helpline: '108',
    facilities,
  });
});
