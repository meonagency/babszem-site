import "./home.css";
import { BrandMark } from "./Logo";
import { F, photoProps } from "./fotok";
import RevealInit from "./RevealInit";

/* Főoldal: editorial fotósor. Stílus: Cinzel + Jost, arany/krém (a logócsomag
   színei), éles képélek, pill gombok. Minden kép a public/fotok mappából jön. */

function Photo({ id, sizes, className = "ph", priority = false, alt }) {
  const p = photoProps(id, sizes);
  return (
    <img
      {...p}
      alt={alt ?? p.alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}

const NAV = [
  { href: "#csokrok", label: "Csokrok" },
  { href: "#szertartas", label: "Szertartás" },
  { href: "#vacsora", label: "Vacsora" },
  { href: "#kiegeszitok", label: "Kiegészítők" },
];

const STRIP = [
  { id: "7833", href: "#csokrok", title: "Menyasszonyi csokrok", line: "Omló, gömbölyű és vadvirágos formák" },
  { id: "6868", href: "#szertartas", title: "Szertartás", line: "Boldogságkapu, székdísz, bevonulóút" },
  { id: "8895", href: "#vacsora", title: "Vacsorahelyszín", line: "Főasztal, vendégasztalok, fényfüggöny" },
  { id: "9297", href: "#kiegeszitok", title: "Virágos kiegészítők", line: "Kitűző, csuklódísz, hajdísz" },
];

const CSOKROK = ["7140", "6773", "8945", "6637", "8910", "7048", "7564", "8052", "7824"];
const SZERTARTAS_ROW = ["6867", "6865", "7580", "l230wb"];

const VACSORA = [
  { title: "Krém és fehér, meleg fényben", ids: ["9326", "9329", "9316", "8165"] },
  { title: "Bordó és narancs", ids: ["7611", "8900", "8467", "8455"] },
  { title: "Púder és bordó", ids: ["6251", "6244", "6228", "6256"] },
  { title: "Zöld és fehér", ids: ["bo4vdl", "5mkjp", "50nsff", "aspjn"] },
];

const BENTO = ["6648", "7045", "6684", "5773", "7345", "7042", "8912"];

function Chapter({ n, id, title, text }) {
  return (
    <header className="chap" data-reveal>
      <span className="chap-n" aria-hidden="true">{n}</span>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{text}</p>
      </div>
    </header>
  );
}

export default function Home() {
  const ratio = (id) => (F[id].w / F[id].h).toFixed(3);

  return (
    <div className="home">
      <RevealInit />

      <header className="home-head">
        <a href="#top" className="logo-inline" aria-label="Babszem Virágműhely, az oldal teteje">
          <BrandMark className="logo-inline-mark" />
          <span aria-hidden="true">BABSZEM</span>
        </a>
        <nav className="home-nav" aria-label="Főmenü">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>
        <a href="/kapcsolat" className="btn">Ajánlatkérés</a>
      </header>

      <main id="top">
        {/* 1. Nyitókép */}
        <section className="hero2" aria-labelledby="hero-title">
          <picture>
            <source media="(max-width: 767px)" srcSet={photoProps("8892", "100vw").srcSet} sizes="100vw" />
            <Photo id="7625" sizes="100vw" className="hero2-img" priority alt="" />
          </picture>
          <div className="hero2-copy">
            <h1 id="hero-title">Esküvői<br />virágdekoráció</h1>
            <p>Szertartás, vacsorahelyszín és menyasszonyi csokor a ti színeitekkel. Ráckeve, Dömsöd és Budapest.</p>
            <a href="/kapcsolat" className="btn">Ajánlatkérés</a>
          </div>
        </section>

        {/* 2. Négy terület: lépcsőzött képsáv */}
        <section className="sec wrapx" aria-labelledby="eskuvo-title">
          <header className="chap" data-reveal>
            <span className="chap-n" aria-hidden="true">01</span>
            <div>
              <h2 id="eskuvo-title">Esküvői dekoráció</h2>
              <p>A szertartástól a vacsoráig egy színvilágra épül minden. Négy területet mutatunk, képekkel.</p>
            </div>
          </header>
          <ul className="strip">
            {STRIP.map((s, i) => (
              <li key={s.id} data-reveal style={{ "--d": `${i * 80}ms` }}>
                <a href={s.href}>
                  <span className="strip-img"><Photo id={s.id} sizes="(min-width: 900px) 22vw, 68vw" /></span>
                  <span className="cap-t">{s.title}</span>
                  <span className="cap-l">{s.line}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Egyedi: nagy kép + szöveg */}
        <section className="sec wrapx pair" aria-labelledby="egyedi-title">
          <figure className="pair-img" data-reveal>
            <Photo id="9364" sizes="(min-width: 900px) 58vw, 100vw" />
          </figure>
          <div className="pair-text" data-reveal style={{ "--d": "120ms" }}>
            <h2 id="egyedi-title" className="h-lg">Egyedi, a helyszínhez igazítva</h2>
            <p>Az esküvői dekoráció nem sablonárakra épül. A színeket, a virágokat és a mennyiséget a helyszínhez és a keretösszeghez igazítjuk.</p>
            <a href="/kapcsolat" className="btn">Ajánlatkérés</a>
          </div>
        </section>

        {/* 4. Csokrok: oszlopos kép-fal */}
        <section className="sec wrapx" id="csokrok" aria-labelledby="csokrok-title">
          <Chapter n="02" id="csokrok-title" title="Menyasszonyi csokrok" text="Minden csokor a menyasszony ruhájához és a nap színeihez készül." />
          <ul className="wall">
            {CSOKROK.map((id, i) => (
              <li key={id} data-reveal style={{ "--d": `${(i % 3) * 70}ms` }}>
                <Photo id={id} sizes="(min-width: 900px) 30vw, 48vw" />
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Szertartás: széles kép, négyes sor, pár */}
        <section className="sec wrapx" id="szertartas" aria-labelledby="szertartas-title">
          <Chapter n="03" id="szertartas-title" title="Szertartás" text="Boldogságkapu, székdíszek és bevonulóút: a tekintet a szertartás helyére vezet." />
          <figure className="wide" data-reveal>
            <Photo id="7662" sizes="(min-width: 1400px) 1300px, 100vw" />
          </figure>
          <ul className="quad">
            {SZERTARTAS_ROW.map((id, i) => (
              <li key={id} data-reveal style={{ "--d": `${i * 70}ms` }}>
                <Photo id={id} sizes="(min-width: 900px) 24vw, 48vw" />
              </li>
            ))}
          </ul>
          <div className="duo">
            <figure className="duo-a" data-reveal><Photo id="6163" sizes="(min-width: 900px) 62vw, 100vw" /></figure>
            <figure className="duo-b" data-reveal style={{ "--d": "100ms" }}><Photo id="8914" sizes="(min-width: 900px) 30vw, 100vw" /></figure>
          </div>
        </section>

        {/* 6. Vacsora: négy színvilág, igazított sorok */}
        <section className="sec wrapx" id="vacsora" aria-labelledby="vacsora-title">
          <Chapter n="04" id="vacsora-title" title="Vacsorahelyszín" text="Főasztal és vendégasztalok négy színvilágban." />
          {VACSORA.map((g) => (
            <div className="story" key={g.title}>
              <h3 data-reveal>{g.title}</h3>
              <div className="rowj">
                {g.ids.map((id, i) => (
                  <figure key={id} data-reveal style={{ "--r": ratio(id), "--d": `${i * 70}ms` }}>
                    <Photo id={id} sizes="(min-width: 900px) 30vw, 48vw" />
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 7. Kiegészítők: hétcellás képrács, árnyalt háttéren */}
        <section className="sec sec--tint" id="kiegeszitok" aria-labelledby="kieg-title">
          <div className="wrapx">
            <Chapter n="05" id="kieg-title" title="Virágos kiegészítők" text="Kitűző, csuklódísz, hajdísz és kis csokrok, a csokorral azonos színekben." />
            <ul className="bento">
              {BENTO.map((id, i) => (
                <li key={id} className={`b${i + 1}`} data-reveal style={{ "--d": `${(i % 3) * 70}ms` }}>
                  <Photo id={id} sizes="(min-width: 900px) 34vw, 50vw" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 8. Zárás: ajánlatkérés teljes szélességű képpel */}
        <section className="closing" aria-labelledby="zaras-title">
          <Photo id="5twu8m" sizes="100vw" className="closing-img" />
          <div className="closing-copy" data-reveal>
            <h2 id="zaras-title" className="h-lg">Kérjetek egyedi ajánlatot</h2>
            <p>Írjátok meg a dátumot, a helyszínt és az elképzeléseiteket. Két héten belül személyre szabott ajánlatot küldünk.</p>
            <a href="/kapcsolat" className="btn">Ajánlatkérés</a>
            <p className="closing-note">Csokorra, virágboxra és koszorúra ugyanezen az űrlapon lehet érdeklődni.</p>
          </div>
        </section>
      </main>

      <footer className="home-foot">
        <div className="wrapx foot-grid">
          <a href="#top" className="logo-inline" aria-label="Az oldal teteje">
            <BrandMark className="logo-inline-mark" />
            <span aria-hidden="true">BABSZEM</span>
          </a>
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
          <span className="partner">
            <a href="https://meonagency.com" rel="noopener">Digitális partner: MeOn Agency</a>
            <a href="https://meonagency.com" rel="noopener" className="plogo" aria-label="MeOn Agency">
              <img src="/meon-agency-logo.svg" alt="MeOn Agency" width="78" height="20" />
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
