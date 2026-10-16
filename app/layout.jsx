import "@fontsource-variable/cinzel";
import "@fontsource-variable/jost";
import "./globals.css";

export const metadata = {
  title: "Babszem Virágműhely",
  description:
    "Virág- és esküvői dekoráció, csokrok, virágboxok, koszorúk – Ráckeve, Dömsöd, Budapest.",
  // Teszt oldal: indulásig ne indexelje a Google
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#faf6ef" };

export default function RootLayout({ children }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
