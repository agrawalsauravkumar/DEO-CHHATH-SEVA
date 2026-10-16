# DEO CHHATH SEVA — Audit and Verification Report

**Organization:** NEXTGEN DEVBHOOMI FOUNDATION  
**Application:** DEO CHHATH SEVA  
**Tagline:** रास्ता भी • सहायता भी • सेवा भी  
**Audit date:** 2026-10-10

## Scope and inspection record

The project tree was enumerated from the workspace root. The application contains a React/TypeScript PWA, shared components and screens, client services and context, an Express/TypeScript API, PostgreSQL/PostGIS schema and repository code, authentication middleware, SMS/OTP providers, environment templates, and deployment documentation. The `src` inventory includes 36 screen files, 15 component files, 27 service files, and modular API routes.

Root/build configuration inspected: `package.json`, `bun.lock` (inventory), `tsconfig.json` (inventory), `vite.config.ts`, `server.ts`, `index.html`, `.gitignore`, `.env.example`, `README.md`, and `DEPLOYMENT.md`. Source read in detail included `src/App.tsx`, `src/context/AppContext.tsx`, user/profile/admin screens and services, global theme CSS/tokens, the authentication/OTP services and providers, auth middleware, API route index, admin/users/help/family/volunteer/lost-and-found/facility/parking/announcement/audit/sync/role routes, and database connection, repository, schema inventory, and entity types. Every route's HTTP method and middleware wiring was inventoried.

Generated `dist`, dependencies, and other build artifacts were not treated as source. No test files or test script are configured in `package.json`.

## Findings and fixes

| Severity | Finding | Fix / status |
|---|---|---|
| HIGH | API authentication inferred identity and role from caller-controlled token substrings; `/api/auth/session` also accepted loose token matches. | **Fixed.** API now issues and verifies HMAC-SHA256 signed tokens with issuer, audience, issue/expiry checks, and active-user lookup. Authorization derives from the database user, not token text. |
| HIGH | Family group creation, membership reads, and location heartbeats lacked authenticated ownership checks, exposing location and contact details. | **Fixed.** These routes require signed authentication; member reads require group membership, heartbeat updates require ownership, and coordinates are range-checked. |
| HIGH | Help request details (including caller contact and GPS data) were readable without authentication; ordinary users could modify workflow status. | **Fixed.** Request listing/status updates require staff or volunteer roles; public SOS submission validates input and cannot elevate its priority. |
| HIGH | Lost-and-found records exposed contact details, identifying features, and coordinates through the public listing; anyone could change report status. | **Fixed.** Public list results omit private fields; status changes are restricted to administrators/help staff, validate status values, and write an audit event. |
| MEDIUM | Public volunteer listings included phone/location fields; profile API serialization returned the whole database record, including `passwordHash`. | **Fixed.** Directory and profile responses now explicitly serialize public/safe fields only. |
| MEDIUM | OTP route had a separate implementation using `Math.random()` and returned its OTP hint regardless of deployment mode; it bypassed the existing provider/rate-limiting service. | **Fixed.** Route now uses the provider-backed OTP service and cryptographic randomness. Test OTP hints are development-only; production without configured SMS delivery fails closed with HTTP 503. |
| HIGH | Public OTP lookup matched phone numbers by substring, and could issue sessions for privileged or suspended accounts. | **Fixed.** Phone lookup now uses normalized exact matches; OTP verification accepts only active public/volunteer accounts. Seeded admin OTP authentication was tested and denied (403). |
| HIGH | Administrative passwords were stored as plaintext source literals and compared directly; the client admin service retained fallback demo credentials. | **Fixed for authentication.** Removed seeded administrator accounts and client credential fallback; password login accepts active administrator roles only and verifies salted scrypt hashes. Added a hidden-input hash generator, direct PostgreSQL account-provisioning instructions, PostgreSQL persistence for user identity/authentication, and server validation of the admin session before showing the dashboard. A real provisioned account and live PostgreSQL authentication still require deployment testing. |
| HIGH | Most non-user domain repository methods and admin dashboard operations still use in-memory or browser-local data, even though a PostgreSQL schema/connection exists. | **Not fixed — release blocker.** User identity/authentication now uses PostgreSQL when connected, but facilities, requests, volunteers, announcements, audit workflows, and dashboard mutations are not consistently persisted/shared. The deployment guide and README now explicitly prohibit using this build as a live government operations system until the remaining workflows are migrated and tested. |
| MEDIUM | The admin dashboard and API contained hard-coded users, audit entries, and notifications that appeared to be live operational records. | **Fixed for these lists.** New installs start these browser-local lists empty, and the API no longer seeds fake admin audit events. Existing saved browser data is retained and still requires migration/verification. |
| MEDIUM | Documented `npm start` invoked plain Node on TypeScript (which failed on ESM directory imports); `clean` used a POSIX-only shell command. | **Fixed.** Production start now uses the installed `tsx` runtime dependency, and clean uses a targeted cross-platform Node script. |
| MEDIUM | The login screen explained that OTP needs internet, but did not clearly offer a way to use the public app without logging in; this made offline use appear blocked. | **Fixed.** Added a prominent guest/public-app action and an online/offline explanation. OTP authentication still requires the server and SMS; no client-side bypass was added. |
| MEDIUM | The map always added OpenStreetMap's network tile layer, even when the browser was offline, causing guaranteed failed tile requests and console errors. | **Fixed.** Tile requests are now suspended while offline, tiles return when connectivity is restored, and the retry control is disabled while offline. Cached verified markers remain eligible to display. |
| HIGH | No downloadable offline map-tile package or offline road-routing engine is configured; the offline map service explicitly reports unavailable and offline route requests fail. | **Not fixed.** Do not fabricate road routes or claim downloaded map availability. An installed/cached app and previously cached data can work offline, but base map tiles, live routes, OTP, and server submissions still need connectivity. |

No real secrets were added. `.env.example`, README, and deployment instructions now explain the private `AUTH_SECRET` and the SMS configuration required for production.

## Theme and UI

The project already contained a Chhath-themed splash/home experience and global tokens. Updated the CSS theme values to the requested River Blue `#0B5E8E`, Sunrise Saffron `#FF8C42`, Marigold Gold `#FFD54F`, Leaf Green `#2E7D32`, Earth Brown `#8D6E63`, Cream `#FFF8E1`, and Emergency Red `#E53935`. A nonfunctional profile role switcher that attempted to grant admin privileges was removed.

Browser smoke-check confirmed the splash-to-home navigation, branding, primary service actions, and a 360 px viewport with no horizontal overflow. This was not a page-by-page visual, keyboard, or accessibility audit.

## Tests actually executed

| Check | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | Passed after fixes. |
| `npm run build` | Passed; PWA assets generated. Vite still warns about `__dirname` in its config and the main JavaScript chunk exceeding 500 kB. |
| `npm start` | Passed after correcting the production TypeScript runner; live production-mode health returned HTTP 200. |
| Live development API: health, OTP send/verify, signed session, profile | Passed; authenticated sessions work and profile omits `passwordHash`. |
| Live API authorization: forged admin token; regular-user admin/help access | Forged token returned **401**; regular user returned **403**. |
| Live API family workflows | Own group/member access and heartbeat succeeded; another account was denied (**403**); invalid coordinates were rejected (**400**); anonymous group creation was denied (**401**). |
| Live API privacy/validation | Public lost-and-found listing omitted contact/GPS fields; ordinary-user status update returned **403**; volunteer directory omitted phone/location; invalid SOS coordinates returned **400** and caller-supplied `CRITICAL` priority was stored as `NORMAL`. |
| Production-mode OTP check with no SMS gateway (even with `OTP_DEV_MODE=true`) | Failed closed with **503** and no OTP hint, as intended. |
| OTP account-role check | Ordinary user OTP login succeeded; seeded privileged admin OTP login was denied (**403**) and issued no token. |
| Responsive browser smoke-check | At 360 px viewport, document width was 360 px (no horizontal overflow). |
| Offline guest-flow browser check | Passed in the production preview: after turning network offline on the login screen, the offline message/action appeared and opened the home screen without a login request. This did not verify cold-start offline launch or every offline data workflow. |
| Offline map browser check | Passed for connectivity handling in the production preview: opening the map offline displayed the unavailable-tile warning, disabled retry, and issued no OpenStreetMap tile requests. Actual offline tiles and road routing remain unavailable. |
| Automated unit/API/database/auth test suites | Not run: no test files or test runner script are configured. PostgreSQL integration, actual SMS delivery, GPS permission states, offline operation, and the full admin workflow were not verified. |
| Current password-hash checks | Passed: scrypt hash verifies the correct password, rejects an incorrect password, and does not accept plaintext as a hash. |
| Current `npm run lint` / `npm run build` | Passed after the latest authentication and admin-session changes. Existing Vite `__dirname` and large-chunk warnings remain. |

## Remaining blockers and next steps

1. **Do not use this build for live government operations.** Migrate every domain/admin workflow from in-memory/browser-local stores to authenticated PostgreSQL-backed APIs, and verify persistence across server restarts and multiple devices.
2. Configure PostgreSQL/PostGIS, `AUTH_SECRET`, an approved administrator account (provisioned with `npm run admin:password-hash`), and the production SMS gateway; test administrator and citizen flows against those real services.
3. Add automated route/auth/database tests and test persistence, SMS delivery, offline/GPS behavior, and all user/admin screens across mobile, tablet, and desktop.
4. Address the existing Vite config compatibility and large-chunk warnings; run accessibility and keyboard audits before release.

This report records the inspected modules and verification actually performed; it does not claim a complete behavioral or production-service verification.

## Verification addendum — 2026-10-16

### Map, online/offline, and responsive checks

- In the browser preview, 15/15 OpenStreetMap tiles loaded. A real zoom-control click changed the tile zoom from 15 to 16, and a mouse drag changed the visible tile coordinates. OpenStreetMap attribution remained visible.
- The configured authoritative facility feed was unavailable in the preview, so no real ghat, parking, help-desk, or other facility records/markers could be checked. Search correctly showed no verified places rather than substituting demo locations. Routing and selection against an authorized facility record remain unverified.
- A mocked permission-denied result displayed the Hindi denial message without drawing a device marker. This does not substitute for a real browser permission prompt, GPS accuracy test, emulator, or device test.
- When the browser context was switched offline while the app was open, the app displayed its offline state, removed the online tile layer, disabled tile retry, and restored the online state when connectivity returned. No offline tile package or road-routing data is configured. Previously cached verified facility records may be read from IndexedDB, but none were available to validate in this preview. A cold-start offline launch was not verified.
- Home, map, and About screens were checked at 320, 345, 375, 390, 768, and 1280 CSS-pixel viewport widths. No horizontal overflow was measured. Map controls remained visible; the map bottom stayed just above the bottom navigation.

### Language, theme, Foundation content, and development configuration

- Hindi is the only currently translated interface. Bhojpuri, Magahi, and English remain listed but are now marked unavailable in both language surfaces; unsupported stored preferences fall back to Hindi. Translation coverage for those three languages is therefore incomplete.
- Legacy hard-coded colors were aligned to the current shared Chhath palette. Browser computed styles confirmed the river-blue token on the About and map screens. This does not constitute a full visual, keyboard, or accessibility audit of every screen.
- The official Foundation website timed out during retrieval. The supplied LinkedIn company profile was accessible and publishes the organization’s Deo/Aurangabad location, mission/vision, focus areas, and `nextgendevbhoomi@gmail.com`; the About page now attributes this summary to that profile. Instagram exposed only a brief profile summary and a LinkedIn link. Registration details, achievements, photographs, and member identities were not independently verified.
- The browser preview used Vite without the Express API. Its `/api/announcements` and operational-data requests returned 404/invalid JSON; this demonstrates the preview’s missing API server and is not evidence that production API endpoints were tested.
- The Vite config uses ESM-compatible `fileURLToPath` path handling and explicitly sets `server.hmr: false`. No repository reference to port `24678` was found, and no such WebSocket error occurred in this preview. The prior port-specific error could not be reproduced. The latest production build emitted no `__dirname` or large-chunk warning.

### Current automated verification

| Check | Result |
|---|---|
| `npm run lint` | Passed (`tsc --noEmit`). |
| `npm run test` | Passed: 19/19 tests (5 announcement tests and 14 app/backend tests). |
| `npm run build` | Passed; 112 PWA precache entries generated; no Vite warning in this run. |
| `git diff --check` and `git diff --cached --check` | Passed; Git reported only a line-ending warning for the pre-existing `dev-dist/sw.js` change. |

The 14-screen manual audit, live PostgreSQL/API and admin CRUD verification, authoritative location-data review, real GPS/device permissions, cold-start offline launch, full translation work, Android build/device tests, and production deployment checks remain incomplete. Do not treat this addendum as release approval.
