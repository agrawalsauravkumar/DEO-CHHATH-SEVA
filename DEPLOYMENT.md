# DEO CHHATH SEVA — Production Deployment & Operations Guide

> **Organization**: NEXTGEN DEVBHOOMI FOUNDATION  
> **Application**: DEO CHHATH SEVA (देव छठ सेवा)  
> **Tagline**: *"रास्ता भी • सहायता भी • सेवा भी"*  
> **Version**: 1.4.0 (Production Release)

---

## 1. Production Architecture Overview

The DEO CHHATH SEVA platform is architected for zero-downtime high-concurrency public service delivery during the Deo Chhath Mahaparv.

```
                   [ Mobile Browsers / PWA Clients ]
                                  │
                                  ▼ (HTTPS / TLS 1.3)
                  [ Cloudflare / Load Balancer / CDN ]
                                  │
               ┌──────────────────┴──────────────────┐
               ▼                                     ▼
      [ Static PWA Assets ]                 [ Backend API Cluster ]
   Service Worker + Web App                Node.js 20+ / Express
   Offline Tile & Bundle Cache             (Port 3000, Multi-instance)
               │                                     │
               │                                     ├────────────────────────┐
               ▼                                     ▼                        ▼
       [ LocalStorage ]                     [ PostgreSQL 15+ ]        [ External Providers ]
    Offline Sync Storage                      with PostGIS 3+         • SMS Gateway (Fast2SMS)
                                             Spatial GIST Indexes     • OSRM Routing Engine
                                                     │                • OpenStreetMap Tiles
                                                     ▼
                                          [ Standby Auto-Fallback ]
                                         Resilient Spatial Cache
```

### High Availability Principles:
1. **Offline-First PWA**: The frontend functions without live internet connectivity via service workers, cached vector tiles, and `/api/sync/bundle` offline storage.
2. **Graceful Database Degradation**: If the PostgreSQL cluster suffers transient network disruption, the server automatically switches to the standby high-speed in-memory spatial store rather than crashing.
3. **Stateless API Layer**: Node.js API processes carry no in-process session affinity, enabling instant horizontal auto-scaling on Google Cloud Run, AWS ECS, or Kubernetes.

---

## 2. Environment Variables Reference

All sensitive credentials must be managed via production secret management (e.g., Google Cloud Secret Manager, AWS Secrets Manager, or Doppler). **Never commit production credentials to source control.**

| Variable | Required | Default | Safe for Browser? | Description |
|---|---|---|---|---|
| `PORT` | Yes | `3000` | No | Internal port for the Express application server. |
| `NODE_ENV` | Yes | `production` | No | Node execution mode (`development` vs `production`). |
| `DATABASE_URL` | Recommended | `""` | No | PostgreSQL connection URI including user, password, host, port, and database name. If omitted, the server enters `STANDBY_LOCAL_FALLBACK` mode. |
| `AUTH_SECRET` | Yes | `""` | No | High-entropy cryptographic string (min 32 bytes) for signing and verifying JWT tokens. |
| `MAP_PROVIDER` | No | `osm` | Yes | Map tile provider identifier (`osm`, `carto`, `mapbox`). |
| `MAP_TILE_URL` | No | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Yes | Standard Slippy Map XYZ tile server URL. |
| `MAP_ATTRIBUTION`| No | `OpenStreetMap contributors` | Yes | Public attribution text displayed on the map canvas. |
| `MAP_PROVIDER_KEY`| Optional | `""` | No | API key if utilizing a commercial tile host (e.g., Stadia, Mapbox). |
| `ROUTING_ENGINE_URL`| No | `https://router.project-osrm.org` | No | OSRM or GraphHopper server endpoint for route calculations. |
| `SMS_PROVIDER` | Optional | `fast2sms` | No | SMS provider adapter (`fast2sms`, `twilio`, `msg91`). |
| `SMS_API_KEY` | Optional | `""` | No | Private API key for dispatching official volunteer & OTP SMS messages. |
| `SMS_API_URL` | Required for production OTP | `""` | No | Private production SMS gateway endpoint. OTP delivery fails closed when it is not configured. |
| `SMS_SENDER_ID` | Optional | `DEOSEV` | No | DLT-registered 6-character sender header for India SMS delivery. |
| `OTP_DEV_MODE` | No | `false` | No | Enables simulated OTP only outside production; production always requires a configured SMS gateway. |
| `NOTIFICATION_CONFIG`| Optional| `""` | No | Webhook URL for forwarding emergency broadcasts and SOS alerts. |
| `CORS_ORIGIN` | Yes | `*` | No | Restrict API access to specific domain in production (e.g., `https://deochhathseva.org`). |

### Administrator account provisioning

The application does not create administrator accounts or ship default credentials. After applying `src/server/db/schema.sql`, generate a salted scrypt hash from a hidden terminal prompt:

```bash
npm run admin:password-hash
```

Insert the generated hash into the `users.password_hash` column through a trusted database session, replacing the example identity and hash. Never place a plaintext password in SQL, source control, or a deployment variable:

```sql
INSERT INTO users (email, username, full_name, role, status, password_hash)
VALUES ('admin@example.org', 'admin@example.org', 'Authorized Administrator',
        'SUPER_ADMIN', 'ACTIVE', 'scrypt$<salt-hex>$<key-hex>');
```

The first account's identity and role must be approved by the organization's database/security administrator.

### Release readiness gate

PostgreSQL persistence is currently implemented for user identity/authentication only. Other application and administration workflows still use in-memory or browser-local data, so records may not be shared across devices or survive a server/browser restart. Do not use this build as the live government operations system until those workflows are backed by PostgreSQL and tested against the production deployment.

---

## 3. PostgreSQL + PostGIS Migration Guide

### 3.1 Server Requirements
- **PostgreSQL**: Version 15 or 16
- **PostGIS**: Version 3.3 or higher
- **RAM**: Minimum 2 GB (4 GB recommended for mela peak)
- **Storage**: SSD with minimum 20 GB allocated

### 3.2 Database Provisioning Steps

1. **Connect to PostgreSQL Instance as Superuser**:
   ```bash
   psql -U postgres -h <db_host>
   ```

2. **Create Database and Dedicated Application User**:
   ```sql
   CREATE DATABASE deo_chhath_db;
   CREATE USER deo_user WITH ENCRYPTED PASSWORD 'replace_with_strong_password_32_chars';
   GRANT ALL PRIVILEGES ON DATABASE deo_chhath_db TO deo_user;
   ALTER DATABASE deo_chhath_db OWNER TO deo_user;
   \c deo_chhath_db
   GRANT ALL ON SCHEMA public TO deo_user;
   ```

3. **Install Required Extensions**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
   *Verify installation:*
   ```sql
   SELECT PostGIS_Version();
   ```

4. **Execute Schema Migration (`schema.sql`)**:
   Run the migration script located at `src/server/db/schema.sql`:
   ```bash
   psql -U deo_user -h <db_host> -d deo_chhath_db -f src/server/db/schema.sql
   ```

### 3.3 Schema Verification Checklist
Verify that all core tables and spatial indices have been created:
```sql
\dt
```
Expected Tables:
- `users`
- `volunteers`
- `facilities`
- `parking_locations`
- `shuttle_routes`
- `shuttle_points`
- `help_requests`
- `family_groups`
- `family_members`
- `family_locations`
- `lost_found_reports`
- `announcements`
- `route_alerts`
- `notifications`
- `audit_logs`
- `festival_config`

Verify PostGIS Spatial Index on Facilities:
```sql
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'facilities';
```
*(Confirms `idx_facilities_location` using `GIST (location)` is active for millisecond radius lookups).*

---

## 4. Production Deployment Methods

### Native Android App

The Android project in `android/` wraps the Vite web build with Capacitor. Deploy the API on HTTPS first, then create an untracked local `.env.local` containing `VITE_API_BASE_URL=https://<api-host>` (origin only; do not include `/api`). Set the backend's comma-separated `CORS_ORIGIN` to allow `https://localhost` (the Capacitor WebView origin) and any separately hosted web app origins. No production API hostname is embedded in source.

Install Android Studio and the Android SDK, then run `npm run android:sync` and `npm run android:open`. For a local debug package on Windows, run `.\android\gradlew.bat -p android assembleDebug`; the APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Debug APKs are for testing only. Generate a signed AAB/APK in Android Studio for release and protect the signing key outside source control. Confirm `applicationId` (`org.nextgendevbhoomi.deochhathseva`) before publishing because changing it later creates a different app listing.

### Option A: Containerized Deployment (Docker / Google Cloud Run / AWS ECS)

1. **Build Container Image**:
   Create a standard `Dockerfile`:
   ```dockerfile
   FROM node:22-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:22-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   ENV PORT=3000
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/server.ts ./server.ts
   COPY --from=builder /app/src/server ./src/server
   RUN npm install -g tsx
   EXPOSE 3000
   USER node
   CMD ["tsx", "server.ts"]
   ```

2. **Build and Tag Image**:
   ```bash
   docker build -t gcr.io/nextgen-foundation/deo-chhath-seva:v1.4.0 .
   ```

3. **Deploy to Google Cloud Run**:
   ```bash
   gcloud run deploy deo-chhath-seva \
     --image gcr.io/nextgen-foundation/deo-chhath-seva:v1.4.0 \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,PORT=3000 \
     --set-secrets DATABASE_URL=DEO_DB_URL:latest,AUTH_SECRET=DEO_AUTH_SECRET:latest \
     --cpu 2 \
     --memory 2Gi \
     --min-instances 2 \
     --max-instances 50
   ```

### Option B: Linux VPS / Ubuntu 22.04 LTS (Systemd + Nginx)

1. **System Preparation**:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm nginx ufw
   sudo npm install -g tsx
   ```

2. **Application Directory Setup**:
   ```bash
   sudo mkdir -p /var/www/deo-chhath-seva
   sudo chown -R $USER:$USER /var/www/deo-chhath-seva
   git clone <repository-url> /var/www/deo-chhath-seva
   cd /var/www/deo-chhath-seva
   npm ci
   npm run build
   ```

3. **Configure Systemd Service (`/etc/systemd/system/deo-chhath.service`)**:
   ```ini
   [Unit]
   Description=DEO CHHATH SEVA Production Service
   After=network.target postgresql.service

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/deo-chhath-seva
   ExecStart=/usr/local/bin/tsx /var/www/deo-chhath-seva/server.ts
   Restart=always
   RestartSec=5
   Environment=NODE_ENV=production
   Environment=PORT=3000
   EnvironmentFile=/var/www/deo-chhath-seva/.env

   [Install]
   WantedBy=multi-user.target
   ```

4. **Start & Enable Service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable deo-chhath
   sudo systemctl start deo-chhath
   sudo systemctl status deo-chhath
   ```

5. **Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/deochhath`)**:
   ```nginx
   server {
       listen 80;
       server_name deochhathseva.org www.deochhathseva.org;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name deochhathseva.org www.deochhathseva.org;

       ssl_certificate /etc/letsencrypt/live/deochhathseva.org/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/deochhathseva.org/privkey.pem;

       # Gzip compression for fast mobile loading
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript image/svg+xml;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           proxy_read_timeout 60s;
       }
   }
   ```

---

## 5. Health Check & Monitoring

### Automated Health Verification
Verify deployment integrity using built-in health endpoints:

1. **System Health Endpoint**:
   ```bash
   curl -s -f https://deochhathseva.org/api/health | jq .
   ```
   Expected response:
   ```json
   {
     "status": "HEALTHY",
     "service": "DEO CHHATH SEVA Backend",
     "organization": "NEXTGEN DEVBHOOMI FOUNDATION",
     "tagline": "रास्ता भी • सहायता भी • सेवा भी",
     "version": "1.4.0",
     "database": {
       "engine": "PostgreSQL + PostGIS",
       "isConfigured": true,
       "connectionState": "CONNECTED",
       "hasPostGIS": true,
       "activePoolSize": 5
     }
   }
   ```

2. **Database Engine Inspection**:
   ```bash
   curl -s https://deochhathseva.org/api/database/status | jq .
   ```

3. **Offline Sync Package Validation**:
   ```bash
   curl -s -I https://deochhathseva.org/api/sync/bundle
   ```
   Must return `HTTP/1.1 200 OK` with `Content-Type: application/json`.

---

## 6. Rollback & Disaster Recovery Procedures

### 6.1 Scenario A: Application Failure (Faulty Release Deployment)

If a newly deployed version produces unexpected errors:

1. **Cloud Run / Container Reversion**:
   Instantly shift 100% of user traffic back to the prior stable revision:
   ```bash
   # List revisions
   gcloud run revisions list --service deo-chhath-seva --region asia-south1

   # Re-route traffic instantly (0 downtime)
   gcloud run services update-traffic deo-chhath-seva \
     --region asia-south1 \
     --to-revisions=deo-chhath-seva-00014-abc=100
   ```

2. **Systemd / VPS Reversion**:
   ```bash
   cd /var/www/deo-chhath-seva
   git checkout tags/v1.3.9
   npm ci
   npm run build
   sudo systemctl restart deo-chhath
   ```

---

### 6.2 Scenario B: Database Schema Rollback

If a migration requires reversal:

1. **Prepare Rollback Script (`src/server/db/rollback_v1.4.0.sql`)**:
   ```sql
   BEGIN;
   -- Revert in reverse order of foreign keys
   DROP TABLE IF EXISTS audit_logs CASCADE;
   DROP TABLE IF EXISTS notifications CASCADE;
   DROP TABLE IF EXISTS route_alerts CASCADE;
   DROP TABLE IF EXISTS announcements CASCADE;
   DROP TABLE IF EXISTS lost_found_reports CASCADE;
   DROP TABLE IF EXISTS family_locations CASCADE;
   DROP TABLE IF EXISTS family_members CASCADE;
   DROP TABLE IF EXISTS family_groups CASCADE;
   DROP TABLE IF EXISTS help_requests CASCADE;
   DROP TABLE IF EXISTS shuttle_points CASCADE;
   DROP TABLE IF EXISTS shuttle_routes CASCADE;
   DROP TABLE IF EXISTS parking_locations CASCADE;
   DROP TABLE IF EXISTS facilities CASCADE;
   DROP TABLE IF EXISTS volunteers CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   DROP TABLE IF EXISTS festival_config CASCADE;

   -- Drop custom types
   DROP TYPE IF EXISTS route_alert_type CASCADE;
   DROP TYPE IF EXISTS announcement_status CASCADE;
   DROP TYPE IF EXISTS announcement_priority CASCADE;
   DROP TYPE IF EXISTS announcement_category CASCADE;
   DROP TYPE IF EXISTS parking_status CASCADE;
   DROP TYPE IF EXISTS facility_category CASCADE;
   DROP TYPE IF EXISTS lost_found_status CASCADE;
   DROP TYPE IF EXISTS lost_found_type CASCADE;
   DROP TYPE IF EXISTS help_request_status CASCADE;
   DROP TYPE IF EXISTS volunteer_status CASCADE;
   DROP TYPE IF EXISTS user_status CASCADE;
   DROP TYPE IF EXISTS user_role CASCADE;
   COMMIT;
   ```

2. **Execute Rollback**:
   ```bash
   psql -U deo_user -h <db_host> -d deo_chhath_db -f src/server/db/rollback_v1.4.0.sql
   ```

3. **Re-apply Previous Schema / Backup**:
   ```bash
   psql -U deo_user -h <db_host> -d deo_chhath_db -f backup_pre_release.sql
   ```

---

### 6.3 Scenario C: Complete Disaster Recovery from Backup

1. **Nightly Automated Backup Command**:
   Configure a cronjob executing every 6 hours during festival dates:
   ```bash
   pg_dump -U deo_user -h <db_host> -Fc deo_chhath_db > /backups/deo_backup_$(date +%Y%m%d_%H%M%S).dump
   ```

2. **Restoring to New Server or Replica**:
   ```bash
   # Create clean database
   dropdb -U postgres -h <db_host> deo_chhath_db
   createdb -U postgres -h <db_host> -O deo_user deo_chhath_db

   # Enable PostGIS
   psql -U postgres -h <db_host> -d deo_chhath_db -c 'CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'

   # Restore custom format dump
   pg_restore -U deo_user -h <db_host> -d deo_chhath_db -v /backups/deo_backup_latest.dump
   ```

---

## 7. Emergency Contact Protocol During Chhath Mahaparv

In the event of critical infrastructure alerts during festival operational hours:
- **DevOps Incident Lead**: `tech-oncall@nextgendevbhoomi.org`
- **Mela IT Coordinator**: Available 24x7 at Central Control Room, Deo
- **District Administration Liaison**: Office of District Magistrate, Aurangabad
