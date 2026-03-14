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

### Fixed
- Removed Caddy reverse proxy — using NGINX Proxy Manager instead
- Node.js version bumped from 20 → 24 in frontend Dockerfile
- PocketBase min password length changed from default (10) to 8
- Removed email field — username-only auth (email auth disabled, username auth enabled, email not required)

### Known Issues (under investigation)
- Tech/user role login fails — admin login works; suspected PocketBase username auth not applying correctly on existing instances; pushing updated image to confirm fix
