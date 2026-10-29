/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes';
import { initializeDatabase, getDatabaseStatus } from './src/server/db/connection';
import { repository } from './src/server/db/repository';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgumentIndex = process.argv.findIndex((argument) => argument === '--port' || argument === '-p');
const argumentPort = portArgumentIndex >= 0 ? Number(process.argv[portArgumentIndex + 1]) : undefined;
const PORT = Number(process.env.PORT || argumentPort || 3000);
const isProd = process.env.NODE_ENV === 'production';

// Express Middlewares
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use('/api', (req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin) {
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(requestOrigin) ||
      requestOrigin.startsWith('http://localhost') ||
      requestOrigin.startsWith('https://localhost') ||
      requestOrigin.startsWith('capacitor://localhost')
    ) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Photo-Permission-Confirmed, Cache-Control, Pragma'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Production & Operations Health Endpoint
app.get('/api/health', (_req, res) => {
  const dbStatus = getDatabaseStatus();
  return res.json({
    status: 'ok',
    service: 'DEO CHHATH SEVA API',
    organization: 'NEXTGEN DEVBHOOMI FOUNDATION',
    version: '1.4.0',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      engine: dbStatus.engine,
      state: dbStatus.connectionState,
      hasPostGIS: dbStatus.hasPostGIS,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Request logger for API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// ================================================================
// MODULAR REST API ARCHITECTURE (Step 22)
// Modules: /auth, /users, /roles, /permissions, /facilities,
//          /parking, /shuttle, /medical, /toilet, /water, /help,
//          /volunteers, /family, /lost-found, /announcements,
//          /route-alerts, /notifications, /sync, /admin, /audit
// ================================================================
app.use('/api', apiRouter);

// Never serve HTML for missing API routes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ================================================================
// VITE DEV SERVER OR STATIC PRODUCTION SERVE
// ================================================================
async function startServer() {
  // 1. Initialize PostgreSQL + PostGIS (resilient, does not terminate process on DB unreachable)
  try {
    await initializeDatabase();
  } catch (err: any) {
    console.warn('⚠️ [Database Notice]: Initial connection attempt failed, running in standby mode:', err.message);
  }

  if (process.env.NODE_ENV === 'development' && process.env.DEMO_TEAM_SEED === 'true') {
    await repository.seedDemoTeamMembers();
    console.log('Development-only demo team profiles are enabled.');
  }

  if (!isProd) {
    // Development: Create Vite server in middleware mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: { port: PORT + 1000 },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DEO CHHATH SEVA Backend Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
