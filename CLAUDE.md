# CLAUDE.md

Guidance for Claude Code (or any AI assistant) working in this repository.

## Project Overview

RepairTracker is an internal Chromebook repair-tracking app for a school district IT team (~10 technicians, ~2,000 repairs/year). Single-container-friendly stack: Next.js frontend + PocketBase backend, deployed via Docker/Portainer.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | Next.js (App Router) | 16.1.6 |
| UI library | React / React DOM | 19.2.4 |
| Language | TypeScript | ^5 (strict mode) |
| Styling | Tailwind CSS | ^4 |
| Backend / DB / Auth / Storage | PocketBase (vendored binary) | 0.36.6 |
| PocketBase JS SDK | `pocketbase` npm package | ^0.26.8 |
| Charts | recharts | ^3.8.0 |
| CSV parsing | papaparse | ^5.5.3 |
| Toasts | sonner | ^2.0.7 |
| Unit tests | Vitest + Testing Library | vitest ^4.1.0 |
| E2E tests | Playwright | ^1.58.2 |
| Lint | ESLint (flat config, `eslint-config-next`) | ^9 |
| Node runtime (Docker) | node:24-alpine | — |
| Base OS (PocketBase image) | Alpine | 3.19 |

No Prettier config is present. Bundling/build is handled by Next.js itself (`output: "standalone"`).

## Folder Structure

```
repairtracker/
├── frontend/                  Next.js web app (the UI)
│   ├── src/
│   │   ├── app/                Routes only (App Router) — login, repairs, repairs/search,
│   │   │                       admin/{audit,devices,outcomes,parts,repairs,reports,users}
│   │   ├── components/         UI grouped by domain: admin/, repair/, layout/
│   │   ├── hooks/               useAuth, useBarcodeScanner, useDevice, useOutcomes, useParts, useRepairs
│   │   ├── lib/
│   │   │   ├── api/             One file per PocketBase collection (repairs.ts, devices.ts, parts.ts,
│   │   │   │                    outcomes.ts, users.ts, audit.ts) — thin wrappers over the PB SDK
│   │   │   ├── validators/      Pure functions returning { valid, errors }
│   │   │   ├── types.ts         All shared domain types/interfaces in one file
│   │   │   ├── auth.ts          Auth helpers around PocketBase's authStore
│   │   │   └── pocketbase.ts    Shared PocketBase client singleton
│   │   └── __tests__/unit/      Vitest unit tests
│   ├── Dockerfile              Multi-stage build, standalone output, non-root user
│   └── (config) tsconfig.json, eslint.config.mjs, vitest.config.ts, next.config.ts, postcss.config.mjs
├── pocketbase/                 Vendored PocketBase backend
│   ├── Dockerfile              Downloads the pinned PocketBase binary onto Alpine
│   ├── pb_migrations/          Sequential migrations: 1_initial_schema.js … 5_parts_inventory.js
│   └── pb_hooks/                Server-side hooks (e.g. audit.pb.js logs deletions)
├── .github/workflows/          CI: builds & pushes both Docker images to GHCR
├── docker-compose.yml          Prod-style compose — pulls pre-built GHCR images
├── docker-compose.yml.old      Superseded build-from-source compose file (see Known Issues)
├── .env.example                NEXT_PUBLIC_POCKETBASE_URL
├── CHANGELOG.md                Running changelog of features/fixes
└── README.md                   Project brief and stack rationale
```

## Coding Conventions

**Naming**
- Components: PascalCase files and named exports (`components/repair/RepairForm.tsx` → `export function RepairForm()`), not default exports.
- Hooks/libs: camelCase files (`hooks/useRepairs.ts`, `lib/api/repairs.ts`).
- Route files: lowercase Next.js convention (`app/repairs/page.tsx`).
- Booleans prefixed `is`/`has` (`isLoading`, `isSubmitting`).
- Domain types are singular PascalCase nouns in `lib/types.ts` (`Repair`, `Device`, `Part`, `Outcome`, `User`), extending PocketBase's `RecordModel`. Purpose-specific shapes suffixed accordingly (`RepairFormData`, `RepairFilters`, `ValidationResult`).
- PocketBase collection/field names are snake_case (`asset_tag`, `parts_used`) even though surrounding TS code is camelCase — this is expected, not an inconsistency to "fix".

**Organization**
- Layered: `lib/api/*` (PB SDK calls) → `hooks/use*` (loading/error/data state wrapper) → `components/*` (grouped by feature domain, not by type) → `app/*` (routing only, no logic).
- Validators are pure functions in `lib/validators/*`, returning `{ valid, errors }` rather than throwing.
- All shared types live centrally in `lib/types.ts`, not co-located per component.

**TypeScript**
- `strict: true`; path alias `@/*` → `./src/*`.
- Use `import type { ... }` for type-only imports.
- Prefer `interface` for object/domain shapes.

**State management**
- No global store (no Redux/Zustand/Context-as-store). Local `useState` plus small custom hooks per concern. Auth state is read directly from PocketBase's `authStore`.

**Styling**
- Tailwind v4 utility classes inline in JSX. No CSS modules/styled-components. `globals.css` only holds theme tokens and dark-mode media query.
- User-facing feedback via `sonner` toasts (`toast.success` / `toast.error`), not inline banners.

**Error handling**
- `lib/api/*` functions generally let errors propagate; calling components catch and show a generic `toast.error(...)`. Follow this pattern for new mutations rather than introducing new error-handling styles.
- Exception: `decrementPartStock` in `lib/api/parts.ts` deliberately swallows errors (documented "best-effort" inventory) — don't copy this pattern elsewhere without the same justification.

**Testing**
- Vitest for unit tests (`src/__tests__/unit/*.test.ts`), Playwright for e2e. Use `describe`/`it` with plain-English descriptions.

**PocketBase migrations**
- File naming: `N_description.js` with sequential integer prefix and snake_case description.
- Structure: `/// <reference path="../pb_data/types.d.ts" />` then `migrate((app) => { ... }, (app) => { ... })` with up/down functions; box-drawing comment headers (`// ── devices ──`) per collection section.

## Known Issues

- **PocketBase collection rules are wide open**: `pocketbase/pb_migrations/4_audit_and_open_rules.js` grants every authenticated user full CRUD (`@request.auth.id != ''`) on `devices`, `parts`, `outcomes`, `repairs`, and even `users`. Documented as an intentional tradeoff for a small trusted team, but it's a real access-control gap if that assumption ever changes.
- **Errors are widely swallowed with generic messages**: most mutations in `components/admin/*.tsx` (OutcomeManager, PartManager, UserManager) and `RepairForm.tsx` do `catch { toast.error("generic message") }` with no logging of the actual error. `lib/api/devices.ts` and `lib/api/outcomes.ts` catch and return `null`/`{}` silently. Debugging a production failure will be hard until these at least log the underlying error.
- **`decrementPartStock` (`lib/api/parts.ts`) is not atomic**: it does a read-then-write per part via `Promise.allSettled` and explicitly documents that "errors are swallowed — inventory is best-effort." Concurrent repairs logging the same part could lose stock decrements.
- **`docker-compose.yml.old` is stale and still committed**: superseded by the current GHCR-image-based `docker-compose.yml`; keeping it around risks someone using the wrong one.
- **Hardcoded fallback URL**: `frontend/next.config.ts` defaults `POCKETBASE_INTERNAL_URL` to `http://pocketbase:8090` if unset, which only works for the specific Docker Compose service name/port — fine for now but brittle if the topology changes.
- **Test coverage is thin**: only `lib/validators/*` has unit tests; no component tests exist despite `@testing-library/react` being installed, and no CI job currently runs the Playwright e2e suite automatically (workflow only builds/pushes Docker images).
- **CHANGELOG-documented past incidents worth remembering**: PocketBase URL previously got baked in at build time (broke logins when accessed by IP instead of hostname); an earlier `@request.auth.record.role` rule had invalid syntax; a stale Docker build cache once served an old PocketBase binary; `useBarcodeScanner` originally called `e.preventDefault()` unconditionally, blocking manual Enter-key submission.
