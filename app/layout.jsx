import "@fontsource-variable/cinzel";
import "@fontsource-variable/jost";
import "./globals.css";
import CookieConsent from "./CookieConsent";
import OfferPopup from "./OfferPopup";

export const metadata = {
  metadataBase: new URL("https://www.babszemviragmuhely.com"),
  title: "Babszem Virágműhely",
  description:
    "Virág- és esküvői dekoráció, csokrok, virágboxok, koszorúk – Ráckeve, Dömsöd, Budapest.",
  openGraph: {
    type: "website",
    locale: "hu_HU",
    siteName: "Babszem Virágműhely",
    title: "Babszem Virágműhely",
    description:
      "Virág- és esküvői dekoráció, csokrok, virágboxok, koszorúk – Ráckeve, Dömsöd, Budapest.",
  },
  twitter: { card: "summary_large_image" },
  // Teszt oldal: indulásig ne indexelje a Google
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#faf6ef" };

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body>
        {children}
        <CookieConsent />
        <OfferPopup />
      </body>
    </html>
  );
}
