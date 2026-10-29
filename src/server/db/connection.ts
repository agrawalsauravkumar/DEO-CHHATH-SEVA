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
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ [PostgreSQL]: DATABASE_URL is not configured in production environment. Server operating in STANDBY_LOCAL_FALLBACK mode.');
    }
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
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        const installedPostgis = await client.query(
          "SELECT 1 FROM pg_extension WHERE extname = 'postgis' LIMIT 1"
        );
        hasPostGisExtension = installedPostgis.rows.length > 0;
        if (!hasPostGisExtension) {
          throw new Error('PostGIS extension is unavailable.');
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

      await client.query(`
        ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{}';
        ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS availability_time VARCHAR(150);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_volunteers_user_id_unique
          ON volunteers (user_id) WHERE user_id IS NOT NULL;
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          full_name VARCHAR(150) NOT NULL,
          designation VARCHAR(120) NOT NULL,
          photo_path VARCHAR(255),
          photo_permission_confirmed BOOLEAN NOT NULL DEFAULT false,
          is_demo BOOLEAN NOT NULL DEFAULT false,
          is_published BOOLEAN NOT NULL DEFAULT false,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_team_members_public
          ON team_members (is_published, created_at DESC);
        ALTER TABLE team_members ADD COLUMN IF NOT EXISTS photo_permission_confirmed BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE team_members ADD COLUMN IF NOT EXISTS biography TEXT;
        CREATE TABLE IF NOT EXISTS team_demo_seed_state (
          seed_key VARCHAR(100) PRIMARY KEY,
          seeded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      isConnected = true;
      connectionError = undefined;
      console.log('✅ Connected to PostgreSQL + PostGIS database.');
    } finally {
      client.release();
    }
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message;
    console.warn('⚠️ [PostgreSQL]: Database connection or migration notice:', err.message);
    console.warn('ℹ️ Running in resilient fallback mode.');
    return getDatabaseStatus();
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
    connectionState: isConnected
      ? 'CONNECTED'
      : connectionError
        ? 'ERROR'
        : 'STANDBY_LOCAL_FALLBACK',
    databaseUrlMasked: isConfigured ? masked : 'Not configured (development-only in-memory fallback)',
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
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PostgreSQL is not connected; database operation rejected.');
    }
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
