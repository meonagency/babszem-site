import Link from "next/link";
import { BrandMark } from "../Logo";
import ContactForm from "./ContactForm";
import "./form.css";

export const metadata = {
  title: "Ajánlatkérés és kapcsolat – Babszem Virágműhely",
  description:
    "Esküvői virágdekoráció, csokrok, virágboxok, koszorúk és eszközbérlés. Írd meg, mire lenne szükséged, és hamarosan jelentkezünk.",
};

export default function KapcsolatPage() {
  return (
    <main className="kp">
      <header className="kp-head">
        <Link href="/" className="kp-brand" aria-label="Babszem Virágműhely – főoldal">
          <BrandMark className="kp-mark" />
          <span>BABSZEM</span>
        </Link>
      </header>
      <section className="kp-intro">
        <h1>Ajánlatkérés</h1>
        <p>
          Esküvő esetén néhány kérdésen végigvezetünk, hogy az első ajánlat már a ti elképzeléseitekhez
          igazodjon. Minden más megkereséshez elég pár sor.
        </p>
      </section>
      <ContactForm />
      <footer className="foot">
        <a href="https://meonagency.com" rel="noopener" className="partner">
          <span>Digitális partner: MeOn Agency</span>
          <img src="/meon-agency-logo.svg" alt="MeOn Agency" width="78" height="20" />
        </a>
      </footer>
    </main>
  );
}
