# 014. Dynamic Navbar Catalog Dropdown and Terroir Streamlining

## Context
With the introduction of the dedicated winery page (`/la-cantina` via ADR 013), the geological, microclimatic, and altitude characteristics of the Cilento National Park are thoroughly explored in the brand storytelling. Having a separate *"Il Terroir"* link in the main navigation created redundancy and clutter in the primary floating island bar.

Furthermore, customers exploring the boutique winery's offerings needed direct, quick access to specific wine styles (e.g., *Vini Bianchi*, *Vini Rossi*, *Riserve*) straight from the header, without navigating away or relying on static, hardcoded sub-navigation links that require developer maintenance every time a new category is introduced in Medusa v2.

## Alternatives Considered
1. **Static hardcoded sub-navigation in the navbar client component**:
   - *Pros*: Simple to code without prop drilling.
   - *Cons*: High maintenance burden; anytime a category is renamed or added in Medusa Admin, code edits and deployments would be required.
2. **Client-side fetch inside `<Navbar />` with `useEffect`**:
   - *Pros*: Component is self-contained.
   - *Cons*: Introduces client-side waterfalls, layout shift during hydration, extra requests from every visitor's browser, and exposes backend network latency.
3. **Server-side fetch with ISR cache passed to `<Navbar />` (Chosen)**:
   - *Pros*: Zero client-side waterfalls; HTML is pre-rendered with the current categories; ISR (`revalidate: 300`) keeps data fresh from Medusa v2; fallback to default categories ensures zero-downtime resiliency.

## Decision
1. **Removed "Il Terroir" from Navbar**: The header items are streamlined to:
   - **I Nostri Vini** (`/vini`) with interactive category dropdown.
   - **La Cantina** (`/la-cantina`) leading to the winery heritage & cellar storytelling.
   - **Contatti** (`/#footer`) leading to customer support & estate location.
2. **Interactive Dropdown on Desktop & Mobile**:
   - Built with pure CSS hover states (`group-hover:opacity-100 group-hover:visible group-hover:translate-y-0`) with subtle micro-transitions and chevron rotation (`group-hover:rotate-180`).
   - Frosted Aglianico glass panel (`bg-[#20080e]/95 backdrop-blur-2xl border border-gold-400/35`) matching the brand design system.
   - Mobile menu features an indented category accordion sub-list.
3. **Dynamic Category Synchronization**:
   - Server Components (`app/page.tsx`, `app/vini/page.tsx`, `app/la-cantina/page.tsx`, `app/prodotti/[handle]/page.tsx`) invoke `getCategories()` cached via Next.js ISR (5 minutes).
   - Dynamic categories are passed via `categories?: WineCategory[]` to `<Navbar />`.
   - The dropdown renders "Tutti i Vini" followed by dynamic category pills linking to `/vini?categoria=${cat.handle}`.

## Consequences
### Positive
- **Streamlined Navigation**: Eliminates redundant terroir links, focusing user intent on the catalog and the cellar history.
- **Automated Catalog Maintenance**: New product categories created in Medusa Admin automatically appear in the navbar dropdown within the ISR revalidation window without code edits.
- **Zero Client Hydration Overhead**: Pre-rendered at the server boundary with accessible HTML markup.

### Trade-offs
- Category additions in the backend take up to 5 minutes to reflect on cached static pages unless an on-demand revalidation hook is triggered.
