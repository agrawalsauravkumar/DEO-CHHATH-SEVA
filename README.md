# DEO CHHATH SEVA (देव छठ सेवा)

> **"रास्ता भी • सहायता भी • सेवा भी"**  
> An official public-service initiative by **NEXTGEN DEVBHOOMI FOUNDATION** for pilgrims and devotees visiting the historic Deo Surya Mandir & Chhath Mahaparv in Aurangabad, Bihar.

---

## 📌 Overview

**DEO CHHATH SEVA** is a high-reliability, offline-first, Hindi-first progressive web application (PWA) and backend platform engineered to serve millions of pilgrims during the sacred Chhath Puja festival at the Sun Temple (सूर्य मंदिर) and holy ghats (सूर्य कुंड एवं रुद्र कुंड) in Deo, Aurangabad, Bihar.

The platform provides comprehensive crowd navigation, live facility tracking, emergency medical response, dedicated volunteer coordination, family safety networks, lost & found reporting, and senior citizen assistance with real-time administration and audit compliance.

---

## 🌟 Key Features

1. **Interactive GIS Map & Route Navigation**
   - High-performance Leaflet-based interactive map with OpenStreetMap integration.
   - Offline tile and bundle caching for zero-connectivity situations.
   - Geo-fenced Chhath Ghats, Surya Mandir zone, and restricted pedestrian corridors.
   - Live turn-by-turn routing with diversion and road-closure alerts.

2. **Essential Public Facilities (PostGIS Spatial Queries)**
   - **पार्किंग (Parking)**: Real-time bay occupancy (P1 College Ground, P2 High School, P3 Bypass), vehicle type tags, and walking time estimates.
   - **ई-रिक्शा शटल (Free Shuttles)**: Designated pickup/drop points with dedicated routes for the elderly and Chhath vrattis.
   - **चिकित्सा शिविर (Medical & First Aid)**: CHC Deo, Surya Kund Emergency Post, 24x7 ambulance coordination, and direct 108 dispatch.
   - **शौचालय एवं स्नानागार (Sanitation)**: Separate male, female, and divyangjan-accessible sanitation clusters with changing rooms.
   - **अमृत शीतल जल सेवा (Drinking Water)**: RO pure chilled drinking water kiosks run by NextGen Dev Bhoomi Foundation.

3. **सुरक्षा एवं सहायता (Emergency & Help Response)**
   - Single-tap SOS distress signal broadcasting with GPS geolocation.
   - Direct helpline links: Police (112), Ambulance (108), Mela Control Room (`06186-224200`).
   - Manned emergency help posts across the mela perimeter.

4. **परिवार सुरक्षा एवं स्थान साझा (Family Location Sharing)**
   - Secure family groups with 6-digit invite codes.
   - Battery-efficient GPS heartbeats with privacy killswitches.
   - Last known location markers and meeting point coordination.

5. **खोया-पाया केंद्र (Lost & Found)**
   - Rapid reporting for lost persons, children, elders, and essential belongings.
   - Integration with central public announcement loudspeakers and volunteer ground posts.

6. **स्वयंसेवक प्रबंधन (Volunteer Network)**
   - On-duty volunteer tracking, badge verification, and zonal assignment.
   - Help request dispatch and escalation matrix.

7. **आधिकारिक घोषणाएं एवं मार्ग अलर्ट (Official Broadcasts)**
   - Push notifications and home screen alert banners for Arghya timings (संध्या व प्रातः अर्घ्य).
   - Real-time road closures, VIP movement updates, and crowd density advisories.

8. **सुगम्यता (Senior Citizen & Accessibility Mode)**
   - High-contrast, large-font senior citizen mode.
   - Voice assistance in Hindi for critical navigation guidance.

---

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Leaflet, Lucide Icons, Vite PWA Workbox.
- **Backend API**: Node.js, Express, TypeScript (`tsx` dev runner, modular routing architecture).
- **Spatial Database**: PostgreSQL 15+ with **PostGIS** spatial extension (WGS84 SRID 4326).
- **State & Sync**: In-memory repository fallback for standalone development; dual-mode PostgreSQL connection pool for production.
- **Offline Architecture**: Service Worker caching, IndexedDB / LocalStorage replication, and `/api/sync/bundle` offline sync packaging.

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
*(Development works out-of-the-box using the robust in-memory PostGIS spatial repository without requiring an external PostgreSQL instance)*.

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
