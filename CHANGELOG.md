# Changelog

## v0.1.0 — In Progress

### Added
- Initial project scaffold: Next.js (App Router) + PocketBase + Docker
- PocketBase migrations: devices, parts, outcomes, repairs collections + users role field
- Seed data: 18 parts, Repaired (default) + Unrepairable outcomes
- Full repair form: barcode scanner input, parts checklist, outcome selector, notes, photos
- Repair history sidebar (shown after device lookup)
- Search page: filter by tech, outcome, date range, device
- Admin pages: parts, outcomes, users, CSV device import, repair management, reports
- GitHub Actions workflow: builds and pushes Docker images to GHCR on push to main
- `docker-compose.prod.yml`: pulls from GHCR, for use with NGINX Proxy Manager
- Audit Log page (admin-only) — logs every record deletion server-side via PocketBase JS hook; shows time, action, record type, snapshot, and who deleted it; click row to expand full JSON snapshot
- `audit_logs` PocketBase collection + `pb_hooks/audit.pb.js` server-side hook

### Changed
- Role model restructured: **tech** now has full access to all features (parts, outcomes, devices, users, repairs, reports); **admin** has everything tech has plus the Audit Log page
- "Admin" nav link renamed to "Manage" — visible to all authenticated users
- All PocketBase collection rules opened to any authenticated user (`@request.auth.id != ''`)
- Disabled Next.js fetch caching (`fetchCache: force-no-store`) — per PocketBase maintainer guidance (discussion #5313), Next.js overrides `fetch` with its own caching layer which interferes with PocketBase API calls
- PocketBase URL no longer baked at build time; frontend proxies all PocketBase requests through Next.js rewrites (`/pb/*` → `http://pocketbase:8090/*`), works regardless of domain or IP
- Confirmed architecture is safe: PocketBase SDK runs entirely client-side (`"use client"` on all PB files); avoids the shared-singleton SSR auth-leak vulnerability warned about in discussion #5313

### Fixed
- Removed Caddy reverse proxy — using NGINX Proxy Manager instead
- Node.js version bumped from 20 → 24 in frontend Dockerfile
- PocketBase min password length changed from default (10) to 8
- Removed email field — username-only auth (email auth disabled, username auth enabled, email not required)
- PocketBase collection rules — `@request.auth.record.role` is invalid syntax; correct syntax is `@request.auth.role` (affects devices, parts, outcomes, repairs, users create/update/delete rules)
- Tech login failure — root cause: `NEXT_PUBLIC_POCKETBASE_URL` baked into image as `https://tickets.jtk.im/api`; browser JS couldn't reach PocketBase when accessing via `ip:3000`; new logins failed while admin appeared to work due to a cached auth token
