# 030. Continuous Integration with GitHub Actions

- **Status:** Accepted (2026-11-04)
- **Related:** ADR 024 (backend lint and test tooling), ADR 028 (storefront unit tests)

## Context
The Definition of Done (`AGENT.md`) is `pnpm lint && pnpm typecheck && pnpm test`, and a feature branch may be merged into `develop` only when all three pass. Until now nothing enforced this. The repository had no `.github/workflows/`, so every check depended on someone running the commands locally. The repository is hosted on GitHub, and every change reaches `develop` through a pull request.

`.github/workflows/` is a protected zone (human-written only). The user explicitly authorized this one change.

## Alternatives
1. **Manual checks only.** Rejected: it is easy to forget, and it does not scale once checkout and payment code arrive.
2. **Local git hooks (husky, lefthook).** Rejected as the only gate: hooks can be skipped (`--no-verify`), they need a new dependency, and they run only on one machine. They could be added later as a convenience.
3. **Another CI provider.** Rejected: GitHub Actions is built into the host, free for this usage, and needs no extra account.
4. **GitHub Actions running the Definition of Done.** (Chosen)

## Decision
`.github/workflows/ci.yml` has one job, "Lint, typecheck, test":

- **Triggers:**
  - pull requests targeting `develop` or `main`;
  - pushes to `develop`, to check the merge result.
- **Steps:**
  1. checkout;
  2. pnpm, with the version read from `"packageManager": "pnpm@9.15.0"` in the root `package.json`;
  3. Node.js 22 with the pnpm cache;
  4. `pnpm install --frozen-lockfile`, which fails if `pnpm-lock.yaml` is out of date;
  5. `pnpm lint`;
  6. `pnpm typecheck`;
  7. `pnpm test`.
- **Security hardening:**
  - `permissions: contents: read`: the workflow token cannot write to the repository.
  - `persist-credentials: false` on checkout.
  - Every third-party action is **pinned to a full commit SHA**, with the release tag in a comment. A moved or compromised tag cannot change what runs. Only releases at least two weeks old were chosen (`pnpm/action-setup` v6.1.0 rather than v6.1.1, which was one day old).
  - No secrets are used. Unit tests need no database, `.env` or keys.
- **Concurrency:** a new push cancels the previous run on the same ref. Timeout: 15 minutes.
- **Not included yet:**
  - The backend HTTP integration tests (`test:integration:http`). They need a Postgres service container. They will be added as a second job when the first protected API routes arrive (the IDOR 403/404 tests).
  - `next build`. It needs the backend env variables and is not part of the Definition of Done.

## Consequences
- **Positive:**
  - Every PR shows whether it meets the Definition of Done, and an outdated lockfile is caught.
  - The same commands run locally and in CI.
- **Verified (2026-11-04):** the exact CI steps were run on a fresh clone (no `node_modules`, `.next` or `.env`). Install, lint, typecheck and test passed (16 storefront tests; the backend has no unit tests yet). The workflow file itself will first run on GitHub with the PR that introduces it.
- **To do (manual, on GitHub):** make the check **required** under Settings → Branches (or Rulesets) for `develop` and `main`, with "Require status checks to pass" set to "Lint, typecheck, test". Without this the CI only reports and does not block merges.
- **Maintenance:**
  - Pinned SHAs do not update themselves. Update them on purpose (Dependabot for `github-actions` could open those PRs, which needs a separate decision).
  - Node 22 matches local development. The project's declared minimum is still Node ≥ 20.
