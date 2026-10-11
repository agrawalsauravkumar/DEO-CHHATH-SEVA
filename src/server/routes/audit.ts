/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { repository } from '../db/repository';
import { requireAuth, requireRole } from '../middleware/auth';

export const auditRouter = Router();

auditRouter.get('/', requireAuth, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  const logs = await repository.getAuditLogs();
  return res.json(logs);
});
