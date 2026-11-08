import { Suspense } from "react";
import { getDictionary, defaultLocale, pickNavbarDictionary, type Locale } from "@/lib/i18n";
import { NotFoundContent } from "@/components/NotFoundContent";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/** Only the four strings the 404 body needs, in both languages (the boundary is in every page payload). */
function texts(locale: Locale) {
  const pdp = getDictionary(locale).pdp;
  return { errorLabel: pdp.errorLabel, title: pdp.notFoundTitle, description: pdp.notFoundDesc, back: pdp.backToCatalog };
}

export default function NotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <div className="flex min-h-screen flex-col bg-ivory-50 text-cellar-900">
      {/* The root 404 boundary is serialized into every page: pass only the Navbar slices. */}
      <Navbar dict={pickNavbarDictionary(dict)} currentLocale={defaultLocale} />

      <main className="flex-grow flex items-center justify-center pt-28 pb-20 px-4">
        <Suspense fallback={null}>
          <NotFoundContent it={texts("it")} en={texts("en")} />
        </Suspense>
      </main>

      <Footer dict={dict} />
    </div>
  );
}
