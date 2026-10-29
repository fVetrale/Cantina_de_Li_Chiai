# ADR 001 — Monorepo Tooling: pnpm Workspaces

**Date:** 2026-10-29
**Status:** Accepted

---

## Context

The project is a winery e-commerce platform composed of multiple distinct applications and shared code:

- `apps/backend` — Medusa v2 (TypeScript, Node.js)
- `apps/storefront` — Next.js (App Router, TypeScript)
- `packages/shared` — shared Zod schemas and TypeScript types

These packages have overlapping dependencies and need to share code without publishing to a registry. A monorepo approach was chosen to enable unified tooling, single-command CI pipelines, and atomic cross-package changes.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **pnpm Workspaces** | Built-in workspace protocol, strict dependency isolation, fast installs via content-addressable store, no hoisting footguns | Requires pnpm as package manager |
| npm Workspaces | Native to npm | Slower, weaker isolation, no `workspace:` protocol |
| Yarn Berry (PnP) | Zero-installs, strict | Complex tooling compat, steep learning curve |
| Turborepo / Nx | Advanced caching and task orchestration | Extra layer of complexity; premature at this stage |
| Separate repos | Full isolation | Painful cross-package coordination, duplicated CI |

---

## Decision

Use **pnpm Workspaces** (`pnpm-workspace.yaml`) as the sole monorepo mechanism, with a root `package.json` that defines cross-workspace scripts (`lint`, `typecheck`, `test`, `build`, `dev`).

Key choices:
- `packageManager` field in root `package.json` pins the exact pnpm version (enforced by Corepack).
- `engines` field enforces Node ≥ 20 and pnpm ≥ 9.
- No additional build-orchestration tool (Turborepo etc.) is introduced now; it can be added later as task graph complexity grows.

---

## Consequences

**Positive:**
- Single `pnpm install` at the root resolves all workspace dependencies.
- `workspace:*` protocol allows packages to reference each other without publishing.
- Strict symlink layout prevents phantom dependency bugs.
- `pnpm audit` can be run from the root to cover the entire dependency graph.

**Trade-offs:**
- All contributors must use pnpm (enforced via Corepack / `packageManager` field).
- No incremental build caching out-of-the-box; full `-r run build` reruns every package.
