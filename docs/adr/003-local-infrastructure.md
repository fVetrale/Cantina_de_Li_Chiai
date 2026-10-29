# ADR 003 — Local Infrastructure: Docker Compose for PostgreSQL and Redis

**Date:** 2026-10-29
**Status:** Accepted

---

## Context

Medusa v2 requires two external runtime services:

1. **PostgreSQL** — primary relational data store (products, orders, customers, inventory).
2. **Redis** — event bus, job queue, and cache layer (async workflows, background jobs).

Every developer must be able to spin up an identical, isolated environment without installing system-level database servers directly, avoiding "works on my machine" issues and conflicting local port usage across projects.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Docker Compose** | Reproducible, isolated, single command, widely known, no cloud dependency | Requires Docker Desktop / Docker Engine |
| System-level install (Homebrew, apt) | No Docker required | Version drift, pollutes global env, conflicts between projects |
| Managed cloud dev DB (e.g. Neon, Upstash) | No local resources needed | Requires internet, account, API keys even for dev; violates local-only security policy |
| Dev containers (VS Code) | Fully containerised dev environment | Heavier toolchain, steeper onboarding |
| SQLite (for dev only) | Zero setup | Medusa v2 does not officially support SQLite; diverges from production |

---

## Decision

Use **Docker Compose** (`infra/docker-compose.yml`) to manage local development dependencies:

- `postgres:16-alpine` — matches the minimum supported PostgreSQL version for Medusa v2; Alpine image minimises attack surface and image size.
- `redis:7-alpine` — current LTS Redis; Alpine for the same reason.

Key security decisions:

1. **Ports bound to `127.0.0.1`** — both `5432` and `6379` are explicitly bound to localhost, preventing any exposure on the local network (e.g. when working on shared Wi-Fi).
2. **Named volumes** — data persists across restarts without bind-mounting host paths, keeping the working tree clean.
3. **Hardcoded local credentials** (`postgres`/`postgres`) — acceptable exclusively for local development where the database is not reachable from outside the machine. These credentials must never be used in staging or production. The `infra/secrets/` directory (git-ignored) is the designated location for environment-specific secret files.
4. **Healthchecks** — both services declare healthchecks (`pg_isready`, `redis-cli ping`) so dependent `docker compose` services (e.g. a future migration runner) can `depends_on: condition: service_healthy`.

---

## Consequences

**Positive:**
- `docker compose -f infra/docker-compose.yml up -d` gives any developer a fully working database + cache stack in seconds.
- Identical PostgreSQL and Redis versions across all developer machines eliminate version-related bugs before they reach CI.
- The `infra/` directory is the single source of truth for local infrastructure; it can be extended with additional services (e.g. MinIO for file storage, MailHog for email testing) without touching application code.
- Named volumes survive `docker compose down` — no accidental data loss during normal development.

**Trade-offs:**
- Docker must be installed on every developer machine.
- Port conflicts are possible if another local service already uses 5432 or 6379; developers must resolve these manually by stopping the conflicting service.
- `down -v` destroys all local data; this must be communicated clearly in onboarding docs (covered in `infra/README.md`).
