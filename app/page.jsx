import { LogoStacked } from "./Logo";

export default function Home() {
  return (
    <main className="wrap">
      <section className="hero">
        <h1 className="sr-only">Babszem Virágműhely</h1>
        <LogoStacked />
        <p className="eyebrow">Az oldal hamarosan elkészül</p>
        <p className="lead">
          <span className="nw">Virág- és esküvői dekoráció, dekorációs eszközök bérlése, csokrok, virágboxok és koszorúk.</span>
          <br />
          Ráckeve, Dömsöd és Budapest.
        </p>
        <a href="/kapcsolat" className="cta">Ajánlatkérés</a>
        <nav className="links" aria-label="Elérhetőség">
          <a href="mailto:babszemviragmuhely@gmail.com" className="mail">babszemviragmuhely@gmail.com</a>
          <div className="social">
            <span className="soc">
              <img src="/instagram-icon.svg" alt="" width="20" height="20" />
              <a href="https://www.instagram.com/babszemviragmuhely/" rel="noopener">Instagram</a>
            </span>
            <span className="soc">
              <img src="/facebook-icon.svg" alt="" width="20" height="20" />
              <a href="https://www.facebook.com/babszemviragmuhely/" rel="noopener">Facebook</a>
            </span>
          </div>
        </nav>
      </section>
      <footer className="foot">
        <span className="partner">
          <a href="https://meonagency.com" rel="noopener">Digitális partner: MeOn Agency</a>
          <a href="https://meonagency.com" rel="noopener" className="plogo" aria-label="MeOn Agency">
            <img src="/meon-agency-logo.svg" alt="MeOn Agency" width="78" height="20" />
          </a>
        </span>
      </footer>
    </main>
  );
}
