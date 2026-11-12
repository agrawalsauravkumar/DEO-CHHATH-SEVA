/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';

const previousEnvironment = {
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
};

process.env.NODE_ENV = 'production';
delete process.env.DATABASE_URL;

const { apiRouter } = await import('./index');

test('production API fails closed when the database is unavailable', async (context) => {
  const app = express();
  app.use('/api', apiRouter);
  const server = app.listen(0, '127.0.0.1');
  context.after(() => new Promise<void>((resolve, reject) => {
    server.closeAllConnections();
    server.close((error) => error ? reject(error) : resolve());
  }));

  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.');
  const endpoint = `http://127.0.0.1:${address.port}/api`;

  const [facilities, login, family, syncBundle, parking, shuttle, medical, toilet, water, notifications,
    volunteers, lostFound, announcements, team, health, databaseStatus, routeConfig] = await Promise.all([
    fetch(`${endpoint}/facilities`),
    fetch(`${endpoint}/auth/login`, { method: 'POST' }),
    fetch(`${endpoint}/family`),
    fetch(`${endpoint}/sync/bundle`),
    fetch(`${endpoint}/parking`),
    fetch(`${endpoint}/shuttle`),
    fetch(`${endpoint}/medical`),
    fetch(`${endpoint}/toilet`),
    fetch(`${endpoint}/water`),
    fetch(`${endpoint}/notifications`),
    fetch(`${endpoint}/volunteers`),
    fetch(`${endpoint}/lost-found`),
    fetch(`${endpoint}/announcements`),
    fetch(`${endpoint}/team`),
    fetch(`${endpoint}/health`),
    fetch(`${endpoint}/database/status`),
    fetch(`${endpoint}/routes/config`),
  ]);

  for (const response of [
    facilities, login, family, syncBundle, parking, shuttle, medical, toilet, water,
    notifications, volunteers, lostFound, announcements, team,
  ]) {
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /PostgreSQL is unavailable/);
  }
  assert.equal(health.status, 200);
  assert.equal(databaseStatus.status, 200);
  assert.equal(routeConfig.status, 200);
});

test.after(() => {
  if (previousEnvironment.nodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousEnvironment.nodeEnv;
  if (previousEnvironment.databaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousEnvironment.databaseUrl;
});
