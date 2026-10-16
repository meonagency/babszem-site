import { LogoStacked } from "./Logo";

export default function Home() {
  return (
    <main className="wrap">
      <section className="hero">
        <h1 className="sr-only">Babszem Virágműhely</h1>
        <LogoStacked />
        <p className="eyebrow">Az oldal hamarosan elkészül</p>
        <p className="lead">
          Virág- és esküvői dekoráció, dekorációs eszközök bérlése, csokrok,
          virágboxok és koszorúk. Ráckeve, Dömsöd és Budapest.
        </p>
        <nav className="links" aria-label="Elérhetőség">
          <a href="mailto:babszemviragmuhely@gmail.com">babszemviragmuhely@gmail.com</a>
          <a href="https://www.facebook.com/babszemviragmuhely/" rel="noopener">Facebook</a>
          <a href="https://www.instagram.com/babszemviragmuhely/" rel="noopener">Instagram</a>
        </nav>
      </section>
      <footer className="foot">
        Digitális partner: <a href="https://meonagency.com" rel="noopener">MeOn Agency</a>
      </footer>
    </main>
  );
}
