import Link from "next/link";
import { CloudOff, RotateCw } from "lucide-react";
import type { getDictionary } from "@/lib/i18n";

interface CatalogUnavailableProps {
  dict: ReturnType<typeof getDictionary>;
  /** URL of the current page, so "retry" re-renders it on the server. */
  retryHref: string;
  /** Home URL (with ?lang= when needed). Hidden when omitted. */
  homeHref?: string;
  /** Use "h1" when this message is the main content of the page. */
  headingLevel?: "h1" | "h2";
  /** Optional anchor id, e.g. "catalog" to keep home page links working. */
  id?: string;
}

/**
 * Shown instead of products when the Medusa backend is unreachable.
 * We never show invented products or prices (ADR 026).
 */
export function CatalogUnavailable({
  dict,
  retryHref,
  homeHref,
  headingLevel = "h2",
  id,
}: CatalogUnavailableProps) {
  const t = dict.catalogUnavailable;
  const Heading = headingLevel;

  return (
    <section
      id={id}
      role="status"
      aria-labelledby="catalog-unavailable-title"
      className="py-16 sm:py-20"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-ivory-100 border border-ivory-300">
          <CloudOff className="h-6 w-6 text-wine-900" aria-hidden="true" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-gold-700 mb-2">
          {t.eyebrow}
        </p>
        <Heading
          id="catalog-unavailable-title"
          className="font-serif text-3xl sm:text-4xl font-bold text-wine-950 tracking-tight mb-4"
        >
          {t.title}
        </Heading>
        <p className="text-sm sm:text-base text-cellar-600 leading-relaxed mb-8">
          {t.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={retryHref}
            className="inline-flex items-center gap-2 bg-wine-900 px-6 py-3 text-sm font-semibold text-ivory-50 transition-colors hover:bg-wine-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            {t.retry}
          </Link>
          {homeHref && (
            <Link
              href={homeHref}
              className="inline-flex items-center border border-ivory-300 px-6 py-3 text-sm font-semibold text-cellar-900 transition-colors hover:border-wine-900 hover:text-wine-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              {t.backHome}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
