---
trigger: always_on
---

# Backend rules (apps/backend)
- Business logic lives in modules and workflows, not in route handlers.
- Handlers: parse input, call a workflow/service, return. Nothing else.
- Slow work (emails, invoices, sync) goes to jobs/subscribers, never
  inline in an HTTP request.
- Every migration is reversible and reviewed by me before running.
- New endpoint = input schema + auth check + test, in the same task.