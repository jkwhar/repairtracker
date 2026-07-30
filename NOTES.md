# Audit Backlog

Read-only audit of the repo (Next.js 16 frontend + PocketBase 0.36 backend). Ranked by risk/impact, not file order. Each item cites file:line for verification.

## Critical

1. **Any authenticated user can self-promote to admin, reset any password, or delete any user account.** `pocketbase/pb_migrations/4_audit_and_open_rules.js:28-49` overwrites the admin-only rules from `1_initial_schema.js:16-21,33-38,52-56` and sets `createRule/updateRule/deleteRule = "@request.auth.id != ''"` on `devices`, `parts`, `outcomes`, and — critically — **`users`**. `lib/api/users.ts:19-27` (`updateUserRole`, `resetUserPassword`, `deleteUser`) call PocketBase directly with no server-side role check, and the client-side gating (`RoleGuard.tsx`) isn't even wired up (see #2). Any "tech"-role account can hit the PocketBase API directly and grant itself admin. This is a full vertical privilege-escalation path.

2. **The role-gating component for `/admin/*` is dead code — admin routes aren't actually role-restricted.** `components/layout/RoleGuard.tsx` has zero call sites anywhere in the app (verified by grep). `app/admin/layout.tsx:50` wraps `/admin/*` only in `AuthGuard` (checks *logged in*, not *role*). `app/admin/audit/page.tsx:73-85` hand-rolls its own `isAdmin` check instead, and redirects to a different page (`/admin/parts`) than `RoleGuard` would (`/repairs`) — so behavior is inconsistent even where a check exists, and most admin pages have no role check at all client-side. Combined with #1, this means the only thing standing between a tech and full admin functionality in the UI is... nothing.

## High

3. **PocketBase is exposed directly on the network with no TLS/reverse proxy.** `docker-compose.yml:5-7` maps port `8090:8090` straight to the host. If this host is reachable beyond a trusted LAN, the admin API, auth, and file storage are served over plaintext HTTP alongside the wide-open rules in #1 — an attacker on path has both transport-level and authorization-level exposure.

4. **`decrementPartStock` silently corrupts inventory under failure or concurrency.** `lib/api/parts.ts:40-54` does a per-part `getOne` + `update` (not atomic, not a transaction) wrapped in `Promise.allSettled`, with a comment stating errors are intentionally swallowed ("best-effort"). No logging, no toast, no audit trail on failure. Two technicians logging repairs against the same part concurrently can lose a stock decrement with zero record anywhere that it happened. This is also an N+1 write pattern (2 round trips × parts-per-repair on every submission).

## Medium

5. **Audit logging only covers deletes — creates and updates aren't audited at all.** `pocketbase/pb_hooks/audit.pb.js:4` registers only `onRecordAfterDeleteSuccess`. Repair creation/edits, part quantity changes, and user role/password changes are never logged, which undermines the purpose of having an audit trail (and is inconsistent with the `AuditLog` UI in `app/admin/audit/page.tsx`, which renders a generic `action` field as if more action types were expected).

6. **Missing DB indexes on fields that are actually filtered on.** `pocketbase/pb_migrations/1_initial_schema.js:120-123` only indexes `repairs.device` and `repairs.tech`, but `lib/api/repairs.ts:35-38` filters by `outcome` and a `created` date range with no matching index. `parts.active` is filtered in `getActiveParts` (`lib/api/parts.ts:7`) with no index on `parts` at all. Query cost will grow linearly with the ~2,000 repairs/year as this goes unaddressed.

7. **Reports page has a hardcoded 2000-row fetch cap that will start silently truncating data.** `app/admin/reports/page.tsx:26` calls `searchRepairs({}, 1, 2000)` with `expand`, fetching the entire table on every visit — no pagination, no caching. At ~2,000 repairs/year this cap will begin dropping recent data within about a year, without any visible error.

8. **Reports page recomputes expensive aggregates on every render.** `app/admin/reports/page.tsx:13-18,37-67`: `groupBy` (implemented with `{...acc, [k]: [...]}` inside `.reduce`, effectively O(n²)) and multiple derived aggregates run unmemoized against up to 2,000 expanded records on every render, with no `useMemo`.

9. **Errors are widely swallowed or reduced to generic, misleading messages, hiding real failure causes.** Examples: `hooks/useAuth.ts:30-42` collapses all login failures (including network/server errors) into "Invalid username or password."; `components/admin/UserManager.tsx:38-50,52-65` discards the real error and guesses at a cause ("Cannot delete — user may have associated repairs." is not derived from the actual error); `RepairForm.tsx:94-104` has an empty `catch {}` with only a generic toast; `lib/api/devices.ts:15-17` and `lib/api/outcomes.ts:16-18` catch and return `null` with zero logging anywhere in the API layer. None of `lib/api/*` ever calls `console.error`, so production failures leave no server-side trace to debug from.

## Low

10. **Dead exports** (verified unused via grep, safe to delete or wire up): `lib/auth.ts:23` `isAuthenticated()` (shadowed by an unrelated hook field of the same name, never actually imported), `lib/api/repairs.ts:73` `updateRepair()`, `lib/api/devices.ts:20` `getDevices()` (there's no device list/browse UI at all), and `resetUserPassword` (`lib/api/users.ts:24`) is imported into `UserManager.tsx:5` but never called — the admin UI has no password-reset feature despite the API existing.

11. **Duplicated CRUD/list logic that should be shared helpers/components:**
    - Identical `{items, total}` pagination mapping in `lib/api/repairs.ts:28,48`, `lib/api/devices.ts:20-26`, `lib/api/audit.ts:14-23` — candidate for a shared `paginate()` helper.
    - Nearly identical pagination UI (Prev/Next, `Math.ceil(total/pageSize)`) copy-pasted in `app/admin/repairs/page.tsx:102-117`, `app/repairs/search/page.tsx:162-183`, `app/admin/audit/page.tsx:139-154` — candidate for a shared `<Pagination>` component.
    - Outcome badge color logic duplicated verbatim in `app/admin/repairs/page.tsx:78-82` and `app/repairs/search/page.tsx:142-146`.
    - Outcomes are fetched on mount four different ways (`hooks/useOutcomes.ts`, plus ad-hoc calls in `OutcomeManager.tsx:13`, `admin/repairs/page.tsx:16`, `repairs/search/page.tsx:28`) instead of all using the existing `useOutcomes` hook.
    - `OutcomeManager.tsx`, `PartManager.tsx`, `UserManager.tsx` all hand-roll the same load/mutate/toast pattern — candidate for a shared `useCrudList`/`useResource` hook.

12. **Inconsistent async style**: most of `lib/api/*` and hooks use `async/await`, but `hooks/useOutcomes.ts:13-16`, `hooks/useParts.ts:13-16`, `OutcomeManager.tsx:13`, `PartManager.tsx:14` use `.then/.catch` for the same kind of fetch-on-mount logic. Pick one style for new code.

13. **`lib/pocketbase.ts:11,18`** exports the same client both as a named export and a default export — the only file in `lib/` that dual-exports; minor but worth standardizing.

## Verified clean (no action needed)

- No hardcoded secrets/API keys found in frontend, PocketBase config, Dockerfiles, or CI workflows.
- No `eval`, `Function()`, or `dangerouslySetInnerHTML` usage anywhere in `frontend/src`.
- No `any` typing found anywhere in `frontend/src` — typing is consistently strict.
- Component export style (named exports for components, default exports for Next.js pages) is consistent throughout.
- `audit_logs` collection correctly has `createRule/updateRule/deleteRule = null` — properly locked to server-side-only writes.
