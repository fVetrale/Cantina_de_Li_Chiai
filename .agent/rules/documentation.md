---
trigger: always_on
---

# Documentation rules (always apply)

## Architecture Decision Records (ADRs)
- Always generate a new file in the `docs/adr/` directory whenever a significant architectural, security, or technological decision is made.
- Name the file using the format `NNN-short-title.md` (e.g., `001-password-hashing.md`), incrementing the number sequentially by checking existing files.
- Strictly follow this internal structure for every ADR:
  - **Context**: The underlying problem, requirement, or starting point.
  - **Alternatives**: The options, tools, or approaches considered.
  - **Decision**: The final choice and the reasoning behind it (focusing on security, performance, and maintainability).
  - **Consequences**: The positive impacts and potential trade-offs of the choice.
- Treat ADRs as an immutable log. Never overwrite, edit, or delete older ADRs to change a past decision. If an architectural decision changes later, create a new ADR that references and supersedes the old one.