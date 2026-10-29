# AGENTS.md — Winery e-commerce

## Project
Online shop for a winery (Italy, EU). Monorepo:
- apps/backend: Medusa v2 (TypeScript), PostgreSQL, Redis
- apps/storefront: Next.js (App Router, TypeScript)
- packages/shared: shared types and Zod schemas
- infra/: Docker and CI config

## Working style
- Reply to me in Italian. Code, comments and commits in English.
- One small task at a time. Before editing, post a short plan
  (files to touch and why). Wait for my OK if more than 3 files change.
- Never refactor, rename or "clean up" code outside the task.
- Never add a dependency without asking. Justify it: maintenance,
  license, known CVEs.
- If a requirement is ambiguous, ask. Do not guess.

## Definition of done
Run `pnpm lint && pnpm typecheck && pnpm test`. A task is done only when
all pass. Report the real output, never claim success without running them.

## Git & Workflow
- Strict branching model: `main` (production), `develop` (integration), and feature branches (`feature/task-name`).
- NEVER commit or push directly to `main` or `develop`.
- Always create a new feature branch starting from `develop` for each new task or section.
- A feature branch can be merged into `develop` ONLY after fully meeting the "Definition of done" (all tests, linting, and typechecks pass).
- Only the `develop` branch is allowed to be merged into `main` (production release).
- Never use force push. Use small, atomic commits with Conventional Commits formatting.

## Protected zones (human-written only)
Do NOT create or modify anything under:
- apps/backend/src/modules/age-verification/
- apps/backend/src/modules/payment-webhooks/
- apps/backend/src/modules/auth/
- apps/backend/src/modules/shipping-rules/
- .env*, infra/secrets/, .github/workflows/
You may read and review them, and propose changes as a diff in chat only.

## Rules & Context
Always read and adhere to the specific guidelines located in the `.agent/rules/` directory before executing a task. 
Global rules must always be applied, while domain-specific rules apply based on the files being edited:
- **Security:** `.agent/rules/security.md` (Always apply)
- **Documentation:** `.agent/rules/documentation.md` (Always apply - ADR generation)
- **Backend:** `.agent/rules/backend.md` (Apply when modifying apps/backend)
- **Storefront:** `.agent/rules/storefront.md` (Apply when modifying apps/storefront)