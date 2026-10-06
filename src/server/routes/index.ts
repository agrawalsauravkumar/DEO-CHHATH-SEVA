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
import { getDatabaseStatus } from '../db/connection';

export const apiRouter = Router();

// Health & PostGIS Database Status
apiRouter.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  return res.json({
    status: 'HEALTHY',
    service: 'DEO CHHATH SEVA Backend',
    organization: 'NEXTGEN DEV BHOOMI FOUNDATION',
    tagline: 'रास्ता भी • सहायता भी • सेवा भी',
    version: '1.4.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Database direct status inspection
apiRouter.get('/database/status', (req, res) => {
  return res.json(getDatabaseStatus());
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
apiRouter.use('/', rolesRouter); // mounts /roles and /permissions
