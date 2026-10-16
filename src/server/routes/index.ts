/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { rolesRouter } from './roles';
import { facilitiesRouter } from './facilities';
import { parkingRouter } from './parking';
import { shuttleRouter } from './shuttle';
import { medicalRouter } from './medical';
import { toiletRouter } from './toilet';
import { waterRouter } from './water';
import { helpRouter } from './help';
import { volunteersRouter } from './volunteers';
import { familyRouter } from './family';
import { lostFoundRouter } from './lostFound';
import { announcementsRouter } from './announcements';
import { routeAlertsRouter } from './routeAlerts';
import { notificationsRouter } from './notifications';
import { syncRouter } from './sync';
import { adminRouter } from './admin';
import { auditRouter } from './audit';
import { teamRouter } from './team';
import { getDatabaseStatus } from '../db/connection';
import { requirePersistentDatabase } from '../middleware/requirePersistentDatabase';

export const apiRouter = Router();

apiRouter.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  return requirePersistentDatabase(req, res, next);
});

function getPublicDatabaseStatus() {
  const {
    engine,
    isConfigured,
    connectionState,
    hasPostGIS,
    activePoolSize,
    lastCheckedAt,
    error,
  } = getDatabaseStatus();
  return {
    engine,
    isConfigured,
    connectionState,
    hasPostGIS,
    activePoolSize,
    lastCheckedAt,
    ...(error ? { error: 'Database connection unavailable' } : {}),
  };
}

// Health & PostGIS Database Status
apiRouter.get('/health', (req, res) => {
  const database = getPublicDatabaseStatus();
  const operationalReady = database.connectionState === 'CONNECTED' && database.hasPostGIS;
  return res.json({
    status: operationalReady ? 'HEALTHY' : 'DEGRADED',
    operationalReady,
    service: 'DEO CHHATH SEVA Backend',
    organization: 'NEXTGEN DEVBHOOMI FOUNDATION',
    tagline: 'रास्ता भी • सहायता भी • सेवा भी',
    version: '1.4.0',
    database,
    timestamp: new Date().toISOString(),
  });
});

// Database direct status inspection
apiRouter.get('/database/status', (req, res) => {
  return res.json(getPublicDatabaseStatus());
});

// Mount Modular Routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/facilities', facilitiesRouter);
apiRouter.use('/parking', parkingRouter);
apiRouter.use('/shuttle', shuttleRouter);
apiRouter.use('/medical', medicalRouter);
apiRouter.use('/toilet', toiletRouter);
apiRouter.use('/water', waterRouter);
apiRouter.use('/help', helpRouter);
apiRouter.use('/volunteers', volunteersRouter);
apiRouter.use('/family', familyRouter);
apiRouter.use('/lost-found', lostFoundRouter);
apiRouter.use('/announcements', announcementsRouter);
apiRouter.use('/route-alerts', routeAlertsRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/sync', syncRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/audit', auditRouter);
apiRouter.use('/team', teamRouter);
apiRouter.use('/', rolesRouter); // mounts /roles and /permissions

// 404 handler for undefined API endpoints (prevents falling through to HTML index)
apiRouter.use((req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use((error: unknown, req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
  if (res.headersSent) return next(error);
  console.error(`[API ERROR] ${req.method} ${req.path}`, error);
  const candidateStatus =
    typeof error === 'object' && error !== null && 'status' in error &&
    typeof error.status === 'number'
      ? error.status
      : 500;
  const statusCode = candidateStatus >= 400 && candidateStatus < 500 ? candidateStatus : 500;
  return res.status(statusCode).json({
    error: statusCode === 413
      ? 'Uploaded content exceeds the allowed size limit.'
      : 'The request could not be completed. Please retry or contact support.',
  });
});
