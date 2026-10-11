import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
await Promise.all(
  ['dist', 'server.js'].map((target) =>
    rm(path.join(projectRoot, target), { recursive: true, force: true })
  )
);
