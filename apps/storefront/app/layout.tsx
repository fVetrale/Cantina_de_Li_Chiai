import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { getCurrentCartSummary } from "@/lib/data/cart-session";
import { CustomerProvider } from "@/components/CustomerProvider";
import { getCurrentCustomer } from "@/lib/data/auth-session";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000"),
  title: "Cantina de Li Chiai | Vini d'Autore del Cilento",
  description:
    "Enoteca ufficiale di Cantina de Li Chiai nel Parco Nazionale del Cilento (Salerno, Campania). Fiano del Cilento DOC, Aglianico Riserva e vini nati sul flysch tra ulivi e mare.",
  keywords: [
    "Cantina de Li Chiai",
    "Fiano del Cilento DOC",
    "Aglianico del Cilento DOC",
    "Cilento DOC Rosso",
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
      className={`${cormorant.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory-50 text-cellar-900 selection:bg-wine-700 selection:text-gold-100">
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
