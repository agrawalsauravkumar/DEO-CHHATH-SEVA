/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DatabaseStatus {
  engine: 'PostgreSQL + PostGIS';
  isConfigured: boolean;
  connectionState: 'CONNECTED' | 'STANDBY_LOCAL_FALLBACK' | 'ERROR';
  databaseUrlMasked?: string;
  hasPostGIS: boolean;
  activePoolSize: number;
  lastCheckedAt: string;
  error?: string;
}

let pool: Pool | null = null;
let isConnected = false;
let hasPostGisExtension = false;
let connectionError: string | undefined;

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && !databaseUrl.includes('placeholder_password')) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' && !databaseUrl.includes('localhost')
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.warn('⚠️ [PostgreSQL Pool Warning]:', err.message);
    });
  } catch (err: any) {
    connectionError = err.message;
    console.warn('⚠️ [PostgreSQL Init Notice]: Using robust local dataset store.', err.message);
  }
}

/**
 * Initializes database connection and runs schema migrations if connected
 */
export async function initializeDatabase(): Promise<DatabaseStatus> {
  if (!pool) {
    return getDatabaseStatus();
  }

  try {
    const client = await pool.connect();
    try {
      // 1. Verify PostGIS extension
      const postgisCheck = await client.query(`
        SELECT default_version, installed_version 
        FROM pg_available_extensions 
        WHERE name = 'postgis';
      `);

      if (postgisCheck.rows.length > 0 && postgisCheck.rows[0].installed_version) {
        hasPostGisExtension = true;
      } else {
        // Attempt to install postgis
        try {
          await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
          hasPostGisExtension = true;
        } catch (extErr: any) {
          console.warn('⚠️ Could not auto-enable postgis extension:', extErr.message);
        }
      }

      // 2. Run schema.sql migrations if tables don't exist
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'facilities'
        );
      `);

      if (!tableCheck.rows[0].exists) {
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
          await client.query(schemaSql);
          console.log('✅ PostgreSQL Schema and PostGIS tables migrated successfully.');
        }
      }

      isConnected = true;
      connectionError = undefined;
      console.log('✅ Connected to PostgreSQL + PostGIS database.');
    } finally {
      client.release();
    }
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message;
    console.warn('ℹ️ PostgreSQL not reachable at DATABASE_URL. Seamlessly operating in High-Fidelity Standby Mode.');
  }

  return getDatabaseStatus();
}

/**
 * Returns current database connection and PostGIS status
 */
export function getDatabaseStatus(): DatabaseStatus {
  const isConfigured = !!(databaseUrl && !databaseUrl.includes('placeholder_password'));
  let masked = '';
  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl.replace(/^postgresql:\/\//i, 'http://'));
      masked = `postgresql://${parsed.username || 'user'}:***@${parsed.host}${parsed.pathname}`;
    } catch {
      masked = 'postgresql://***';
    }
  }

  return {
    engine: 'PostgreSQL + PostGIS',
    isConfigured,
    connectionState: isConnected ? 'CONNECTED' : 'STANDBY_LOCAL_FALLBACK',
    databaseUrlMasked: isConfigured ? masked : 'Not configured (using robust in-memory PostGIS store)',
    hasPostGIS: hasPostGisExtension,
    activePoolSize: pool ? pool.totalCount : 0,
    lastCheckedAt: new Date().toISOString(),
    error: connectionError,
  };
}

/**
 * Executes a SQL query on PostgreSQL pool if available, otherwise returns null
 */
export async function executeQuery<T = any>(text: string, params: any[] = []): Promise<T[] | null> {
  if (!pool || !isConnected) {
    return null;
  }
  try {
    const res = await pool.query(text, params);
    return res.rows as T[];
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}
