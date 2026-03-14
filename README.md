# repairtracker
# Chromebook Repair Tracker — Project Brief
---

## What We're Building

A web app for tracking Chromebook repair tickets at work. Internal tool for a team of technicians.

**Key stats:**
- ~10 technicians using the system
- ~2,000 Chromebook repairs per year (~40/week)
- Occasional photo uploads attached to tickets
- Self-hosted on Docker (dev), deployed at work (prod)

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js |
| Backend / DB / Auth / Storage | PocketBase |
| Hosting | Docker + Portainer |
| Auth method | Username + password (PocketBase built-in) |

**Why PocketBase:** Single Docker container. Built-in auth, database, file storage, REST API, and admin UI. Right-sized for this use case.

---

## Domains

| Environment | Domain |
|---|---|
| Dev (home) | `tickets.jtk.im` |
| Prod (work) | TBD |

---

## Status

- [x] Stack decided
- [ ] Data model defined — **next step: walk through ticket lifecycle**
- [ ] PocketBase schema designed
- [ ] Next.js project scaffolded
- [ ] Docker Compose written
- [ ] Dev environment running
- [ ] Core ticket CRUD built
- [ ] Auth and user roles
- [ ] Photo upload
- [ ] Testing
- [ ] Prod deployment at work

---

## Data Model (WIP)

> Not yet defined. Need to walk through the full repair ticket lifecycle:
> - How does a ticket get created?
> - What info is captured at intake?
> - What statuses does a ticket move through?
> - Who does what (roles)?
> - What gets logged along the way?
> - How does it close out?

---

## Decisions Log

| Date | Decision |
|---|---|
| 2026-03-13 | Chose PocketBase over Supabase (simpler, single container, self-hostable) |
| 2026-03-13 | Next.js for frontend |
| 2026-03-13 | Username/password auth — no SSO needed |
| 2026-03-13 | Dev at tickets.jtk.im, prod domain TBD |

---

## Open Questions

- Full ticket lifecycle (defines the data model — answer this first)
- What roles exist? (e.g. tech, lead tech, admin?)
- Does any status require manager approval?
- Are tickets assigned to a specific tech or claimed from a queue?
- Work prod environment details (server, OS, Docker setup?)

---

## Next Session Starting Point

1. Walk through the repair ticket lifecycle with Johnny
2. Define fields and statuses from that conversation
3. Design PocketBase collections (schema)
4. Scaffold the Next.js project
