import type { Metadata } from "next";
import { Bodoni_Moda, Lato } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { HtmlLang } from "@/components/HtmlLang";
import { CartProvider } from "@/components/CartProvider";
import { getCurrentCartSummary } from "@/lib/data/cart-session";
import { CustomerProvider } from "@/components/CustomerProvider";
import { getCurrentCustomer } from "@/lib/data/auth-session";

// Editorial typography (ADR 045): Bodoni Moda for titles and long text, Lato for labels.
// Bodoni Moda's lightest weight is 400.
const bodoni = Bodoni_Moda({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000"),
  title: "Cantina de Li Chiai | Vini d'Autore del Cilento",
  description:
    "I vini di famiglia di Cantina de Li Chiai ad Abatemarco, nel Parco Nazionale del Cilento (Salerno, Campania): Chiai Rosso, Rosso Vecchio, Chiai Bianco e Bianco Dolce, con spedizione in tutta Italia o ritiro in cantina.",
  keywords: [
    "Cantina de Li Chiai",
    "Chiai Rosso",
    "Rosso Vecchio",
    "Chiai Bianco",
    "Bianco Dolce",
    "Vino del Cilento",
    "Parco Nazionale del Cilento",
    "Vino Salerno Campania",
    "Enoteca online vino campano",
  ],
  authors: [{ name: "Cantina de Li Chiai" }],
  openGraph: {
    title: "Cantina de Li Chiai | Vini d'Autore del Cilento",
    description:
      "Vini artigianali prodotti sui suoli flysch del Parco Nazionale del Cilento, provincia di Salerno. Scopri le etichette esclusive e acquista online con spedizione protetta.",
    url: "https://cantinadelichiai.it",
    siteName: "Cantina de Li Chiai",
    images: [
      {
        url: "/images/home_page.jpeg",
        width: 1200,
        height: 630,
        alt: "Vigneti di Cantina de Li Chiai nel Parco Nazionale del Cilento",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Navbar cart counter (ADR 036). Null when there is no cart or the backend is unreachable.
  const [cart, customer] = await Promise.all([getCurrentCartSummary(), getCurrentCustomer()]);

  return (
    <html
      lang="it"
      className={`${bodoni.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory-50 text-cellar-900 selection:bg-black selection:text-white">
        {/* Without JavaScript the reveal animations never run: keep every block visible (ADR 046). */}
        <noscript>
          <style>{`.reveal-block,.reveal-block .text-reveal,.reveal-pending{opacity:1!important;transform:none!important}.reveal-block__media::before{display:none!important}`}</style>
        </noscript>
        <Suspense fallback={null}>
          <HtmlLang />
        </Suspense>
        {/* Only the first name and the wishlist product ids reach the browser (ADR 040, 042). */}
        <CustomerProvider
          customer={customer ? { firstName: customer.firstName, wishlist: customer.wishlist } : null}
        >
          <CartProvider
            counter={cart ? { itemCount: cart.itemCount, itemTotal: cart.itemTotal } : null}
          >
            {children}
          </CartProvider>
        </CustomerProvider>
      </body>
    </html>
  );
}
