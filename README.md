# DEO CHHATH SEVA (देव छठ सेवा)

> **"रास्ता भी • सहायता भी • सेवा भी"**  
> An official public-service initiative by **NEXTGEN DEVBHOOMI FOUNDATION** for pilgrims and devotees visiting the historic Deo Surya Mandir & Chhath Mahaparv in Aurangabad, Bihar.

---

## 📌 Overview

**DEO CHHATH SEVA** is a Hindi-first progressive web application (PWA) and backend project for pilgrims visiting the Sun Temple (सूर्य मंदिर) and holy ghats (सूर्य कुंड एवं रुद्र कुंड) in Deo, Aurangabad, Bihar. It includes public-service screens and backend modules, but it has not been load-tested or approved for large-scale live event operations.

Facility status, emergency response, volunteer coordination, family safety, lost-and-found, and administration are not all fully persisted or verified as live workflows. Do not interpret demonstrations, local-only records, or map estimates as authoritative operational information.

> **Production status:** This repository is not yet ready to operate a live government event. Most domain records and administration actions are not persisted to PostgreSQL and may be local to one server/browser. See the release-readiness gate in [DEPLOYMENT.md](./DEPLOYMENT.md).

**Offline login:** The app intentionally supports an on-device OTP for offline/demo access. That OTP creates only a local, time-limited `USER` session; it does not verify a phone number with the server and cannot authorize server-side operations. A server-verified session requires the configured production OTP provider.

---

## 🌟 Key Features

1. **Interactive GIS Map & Route Navigation**
   - High-performance Leaflet-based interactive map with OpenStreetMap integration.
   - Previously cached app assets and map tiles may work offline; there is no downloadable offline map package.
   - Any route or facility data must be checked against an authorized, current source before operational use.

2. **Essential Public Facilities (PostGIS Spatial Queries)**
   - Screens and API modules are available for parking, shuttles, medical aid, toilets, drinking water, and help facilities.
   - Live location, occupancy, opening status, and service availability require verified data from the responsible authority; they are not guaranteed by this app.

3. **सुरक्षा एवं सहायता (Emergency & Help Response)**
   - Emergency screens can provide phone links and location-sharing flows, subject to device permissions and connectivity.
   - Confirm helpline numbers and response coverage with local authorities; the app does not itself guarantee dispatch or staffed help posts.

4. **परिवार सुरक्षा एवं स्थान साझा (Family Location Sharing)**
   - Family sharing is disabled in production until a persistent, consent-based service is implemented and verified.

5. **खोया-पाया केंद्र (Lost & Found)**
   - Screens and API routes support lost-and-found reports; the complete client moderation/contact workflow still needs end-to-end verification.
   - Do not assume a report is reaching staffed ground posts or public-address systems.

6. **स्वयंसेवक प्रबंधन (Volunteer Network)**
   - Volunteer and help-request management screens/API modules are present.
   - Live rosters, dispatch, escalation, and cross-device persistence require authorized data and operational testing.

7. **आधिकारिक घोषणाएं एवं मार्ग अलर्ट (Official Broadcasts)**
   - The app can present announcements and route alerts from an authorized verified feed.
   - No live feed or real-time crowd/road data is guaranteed until an official source is configured.

8. **सुगम्यता (Senior Citizen & Accessibility Mode)**
   - High-contrast, large-font senior citizen mode.
   - Voice assistance in Hindi for critical navigation guidance.

---

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Leaflet, Lucide Icons, Vite PWA Workbox.
- **Backend API**: Node.js, Express, TypeScript (`tsx` dev runner, modular routing architecture).
- **Spatial Database**: PostgreSQL 15+ with **PostGIS** spatial extension (WGS84 SRID 4326).
- **State & Sync**: PostgreSQL schema and connection pool are present, with selected database-backed routes; other domain workflows still use in-memory or browser-local state and need end-to-end persistence verification.
- **Offline Architecture**: Service Worker caching, IndexedDB / LocalStorage storage, and a sync-bundle endpoint are present; offline tiles, routing, and reliable mutation sync are not guaranteed.

### Directory Structure
```
├── DEPLOYMENT.md              # Production deployment & rollback guide
├── README.md                  # Project overview & documentation
├── metadata.json              # AI Studio applet capabilities & metadata
├── package.json               # Node.js dependencies & scripts
├── server.ts                  # Express production server & Vite dev middleware
├── index.html                 # HTML entry point (SEO & PWA metadata)
├── vite.config.ts             # Vite configuration with PWA plugin
├── src/
│   ├── main.tsx               # Client entry point
│   ├── App.tsx                # Navigation, routing & screen switcher
│   ├── context/               # Global state (AppContext, Voice, Auth, Theme)
│   ├── components/            # UI components (Header, BottomNav, Modals, Map)
│   ├── screens/               # 20+ feature screens (Home, Map, Parking, Help, etc.)
│   ├── services/              # Client services (SyncService, FacilityService, etc.)
│   └── server/                # Modular backend API architecture
│       ├── db/                # Database pool, PostGIS queries & schema.sql
│       │   ├── connection.ts  # PostgreSQL pool & fallback detector
│       │   ├── repository.ts  # Data repository with PostGIS SQL queries
│       │   ├── schema.sql     # Complete PostgreSQL + PostGIS schema DDL
│       │   ├── spatial.ts     # Haversine & PostGIS geometry helpers
│       │   └── types.ts       # Database entity interfaces
│       ├── middleware/        # JWT auth & RBAC permissions matrix
│       └── routes/            # REST endpoint routers
│           ├── auth.ts        # /api/auth (Login, OTP, Session)
│           ├── facilities.ts  # /api/facilities (Spatial category queries)
│           ├── parking.ts     # /api/parking (Real-time slots)
│           ├── shuttle.ts     # /api/shuttle (Routes & stops)
│           ├── help.ts        # /api/help (Help requests & SOS)
│           ├── volunteers.ts  # /api/volunteers (Duty & assignments)
│           ├── family.ts      # /api/family (Groups & location heartbeats)
│           ├── lostFound.ts   # /api/lost-found (Search & reports)
│           ├── announcements.ts # /api/announcements (Official broadcasts)
│           ├── sync.ts        # /api/sync (Bundle & package exports)
│           ├── admin.ts       # /api/admin (Dashboard & verification)
│           └── audit.ts       # /api/audit (Audit trail logs)
└── public/
    ├── branding/              # SVG & PNG logos, app icons, badges
    └── favicon.svg            # Chhath Puja Surya Arghya favicon
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20+ or 22+
- npm 10+ (or bun)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd deo-chhath-seva
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Generate a private signing secret (for example, with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`) and set it as `AUTH_SECRET` in `.env`. Authentication is disabled until a non-placeholder secret of at least 32 characters is configured.
For local development set `NODE_ENV=development` and `OTP_DEV_MODE=true` to enable the simulated OTP provider. Production requires a configured SMS gateway (`SMS_API_KEY` and `SMS_API_URL`); it will not return test OTP codes or silently fall back to simulated delivery.
*(Development uses the in-memory spatial repository without requiring an external PostgreSQL instance once the authentication secret is configured.)*

There are no built-in administrator accounts. After applying the database schema, generate a password hash in a real terminal using `npm run admin:password-hash`, then provision an authorized account directly in PostgreSQL using the generated hash and a unique username/email. Never use a demo password or commit the hash.

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Build the Android App

The Android app is a native Capacitor shell around the same web app. Install Android Studio with its Android SDK, and deploy the API over HTTPS before building: OTP login, facility sync, help requests, and lost-and-found submissions use the backend.

1. Put the deployed backend origin (without `/api` or a trailing path) in a local `.env.local` file:
   ```dotenv
   VITE_API_BASE_URL=https://api.example.org
   ```
   Set the deployed backend's comma-separated `CORS_ORIGIN` to include `https://localhost` and any separately hosted web app origins. Never use an HTTP production URL.
2. Build the web bundle and copy it into Android:
   ```bash
   npm run android:sync
   ```
3. Open the project in Android Studio:
   ```bash
   npm run android:open
   ```
4. To build a local debug APK on Windows:
   ```powershell
   .\android\gradlew.bat -p android assembleDebug
   ```
   Output: `android\app\build\outputs\apk\debug\app-debug.apk`. Install this debug build on a test device; it is not a Play Store release.
5. For Play Store distribution, use Android Studio's **Generate Signed Bundle / APK** and a privately stored release signing key. Back up the key securely and never commit it. Confirm the application ID and store listing details before publishing.

After changing frontend code or `VITE_API_BASE_URL`, rerun `npm run android:sync` before launching Android Studio. This workspace can generate and sync the Android project, but producing a release APK/AAB also needs Android Studio/SDK, a deployed backend, and a release signing key.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status, version & PostGIS database connection |
| `GET` | `/api/facilities` | List facilities by category (`PARKING`, `MEDICAL`, `WATER`, etc.) |
| `GET` | `/api/facilities/nearby` | Spatial query sorted by distance (`?lat=...&lng=...&cat=...`) |
| `GET` | `/api/parking` | Real-time parking availability and capacity |
| `GET` | `/api/shuttle/routes` | E-Rickshaw routes and pickup points |
| `GET` | `/api/announcements` | Official administration broadcasts & Arghya timings |
| `GET` | `/api/route-alerts` | Active traffic closures & pedestrian diversions |
| `POST` | `/api/help/requests` | Submit emergency SOS or assistance request |
| `POST` | `/api/family/groups` | Create or join a family group for tracking |
| `POST` | `/api/family/location` | Submit GPS location heartbeat |
| `GET` | `/api/sync/bundle` | Complete offline dataset bundle for PWA local caching |

---

## 📜 Public Service Commitment

**DEO CHHATH SEVA** is strictly non-commercial and public-welfare oriented.  
- **No Ads**: Free of any third-party advertising or commercial tracking.  
- **Privacy First**: Family location sharing requires explicit consent and group codes; location heartbeats are time-bound and privacy protected.  
- **Trustworthy**: Official broadcasts are labeled `VERIFIED OFFICIAL` with provenance from District Administration and Mela Control Room.

---

## 📞 Helpline & Support

- **Mela Central Control Room**: `06186-224200`
- **Emergency Police**: `112`
- **Ambulance (CHC Deo)**: `108`
- **Organization**: NextGen Dev Bhoomi Foundation  
- **Official Email**: `seva@nextgendevbhoomi.org`
