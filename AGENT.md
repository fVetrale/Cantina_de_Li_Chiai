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

## Git
- Work only on a feature branch. Never commit to or push to main.
- Never use force push. Small commits, conventional commit messages.

## Protected zones (human-written only)
Do NOT create or modify anything under:
- apps/backend/src/modules/age-verification/
- apps/backend/src/modules/payment-webhooks/
- apps/backend/src/modules/auth/
- apps/backend/src/modules/shipping-rules/
- .env*, infra/secrets/, .github/workflows/
You may read and review them, and propose changes as a diff in chat only.

## More rules
Security rules always apply: .agent/rules/security.md