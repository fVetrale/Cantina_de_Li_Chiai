# ADR 005 — Admin Authentication and Access Control (RBAC)

**Date:** 2026-10-31  
**Status:** Accepted  

---

## Context

The winery platform requires administrative access for store operators to manage wine products, vintages, inventory levels, promotions, shipping profiles, and customer orders. Administrative capabilities must be strictly isolated from the public-facing storefront to prevent unauthorized privilege escalation or data leakage.

Per repository security rules (`.agent/rules/security.md` and `.agent/rules/storefront.md`), admin credentials and session cookies must never be exposed or used by storefront client components.

---

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Medusa v2 Native Auth (Email/Password)** | Built-in, zero external dependencies, CLI management (`medusa user`), secure Argon2/bcrypt hashing | Requires manual password lifecycle management |
| **External SSO / OAuth (Google, Auth0)** | Centralized identity management, enterprise 2FA out of the box | Requires external service accounts, complex local dev setup, cost |
| **Passwordless Magic Links** | No passwords stored | Dependent on operational transactional email provider (e.g. SendGrid/Resend) in local dev |

---

## Decision

1. **Native Admin Authentication Provider**: Use Medusa v2's built-in email/password authentication provider for administrative identities.
2. **CLI-Driven Provisioning**: Admin users are provisioned via Medusa CLI (`medusa user -e <email> -p <password>`), ensuring passwords are never stored in version control or plain text configuration files.
3. **Strict Boundary Isolation**:
   - Admin authentication is restricted to the `/admin/*` API and the Vite-bundled Admin UI (`/app`).
   - Storefront (`apps/storefront`) operates exclusively under Customer identities and Publishable API Keys (`pk_*`). Under no circumstances may admin credentials or admin JWT tokens be passed to or stored by the browser in storefront sessions.

---

## Consequences

**Positive:**
- Immediate availability for local development without external third-party identity provider dependencies.
- Passwords are encrypted at rest using Medusa's secure hashing implementation.
- Full compatibility with Medusa v2 RBAC (Role-Based Access Control) for future multi-role management (e.g. sommelier vs fulfillment staff).

**Trade-offs:**
- Password rotation and complexity must be enforced through operational discipline until enterprise SSO or MFA plugins are enabled for production deployment.
