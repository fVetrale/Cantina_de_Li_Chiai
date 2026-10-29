---
trigger: always_on
---

# Storefront rules (apps/storefront)
- Server Components by default; client components only when needed.
- Catalog and product pages use ISR/caching. No per-request fetches
  for data that rarely changes.
- All user-facing text goes through i18n (it, en). No hardcoded strings.
- Never call the backend with admin credentials from the browser.
- Accessibility: semantic HTML, alt text, keyboard navigation.
- Images via next/image with explicit sizes.