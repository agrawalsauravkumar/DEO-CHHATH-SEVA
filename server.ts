/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes';
import { initializeDatabase } from './src/server/db/connection';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const portArgumentIndex = process.argv.findIndex((argument) => argument === '--port' || argument === '-p');
const argumentPort = portArgumentIndex >= 0 ? Number(process.argv[portArgumentIndex + 1]) : undefined;
const PORT = Number(process.env.PORT || argumentPort || 3000);
const isProd = process.env.NODE_ENV === 'production';

// Express Middlewares
app.use(express.json());

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

// ================================================================
// VITE DEV SERVER OR STATIC PRODUCTION SERVE
// ================================================================
async function startServer() {
  // 1. Initialize PostgreSQL + PostGIS or Standby local store
  await initializeDatabase();

  if (!isProd) {
    // Development: Create Vite server in middleware mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
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
