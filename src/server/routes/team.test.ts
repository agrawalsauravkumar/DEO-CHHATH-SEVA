import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { teamRouter } from './team';

test('team administration endpoints reject requests without authentication', async (context) => {
  const app = express();
  app.use(express.json());
  app.use('/api/team', teamRouter);
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
  const endpoint = `http://127.0.0.1:${address.port}/api/team`;

  const [listResponse, createResponse, privatePhotoResponse] = await Promise.all([
    fetch(`${endpoint}/admin`),
    fetch(`${endpoint}/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Test', designation: 'Test' }),
    }),
    fetch(`${endpoint}/admin/00000000-0000-4000-8000-000000000001/photo`),
  ]);

  assert.equal(listResponse.status, 401);
  assert.equal(createResponse.status, 401);
  assert.equal(privatePhotoResponse.status, 401);
});
