import Link from "next/link";

export const metadata = { title: "Adatkezelési tájékoztató – Babszem Virágműhely" };

// TODO: a végleges tájékoztató a vállalkozás adatai (forma, név, székhely, adószám) után készül el.
export default function Adatkezeles() {
  return (
    <main className="wrap">
      <section className="hero" style={{ textAlign: "left", maxWidth: 640 }}>
        <h1 className="eyebrow" style={{ fontSize: 22 }}>Adatkezelési tájékoztató</h1>
        <p>
          A kapcsolatfelvételi űrlapon megadott adatokat (név, e-mail cím, telefonszám és az üzenetben
          megadott részletek) kizárólag a megkeresés megválaszolására és az ajánlat elkészítésére
          használjuk.
        </p>
        <p>
          A beérkező megkereséseket a Google Táblázatok szolgáltatásban tároljuk, a továbbításukhoz a
          Make automatizálási platformot, az értesítéshez a Telegramot használjuk.
        </p>
        <p>
          Ha az esküvői űrlapon papíráru-segítséget (meghívó és egyéb papíráru) kérsz és ehhez külön hozzájárulsz,
          a nevedet, e-mail címedet, az esküvő dátumát és a papíráruval kapcsolatos válaszaidat a Veluma Wedding
          (Szőke Simeon Károly egyéni vállalkozó) is megkapja, hogy ajánlatot adhasson. Ezt a hozzájárulást
          bármikor visszavonhatod.
        </p>
        <p>
          A részletes tájékoztató hamarosan felkerül. Addig is kérdéssel vagy az adataid törlésével
          kapcsolatban írj a <a href="mailto:babszemviragmuhely@gmail.com">babszemviragmuhely@gmail.com</a> címre.
        </p>
        <p><Link href="/">← Vissza a főoldalra</Link></p>
      </section>
    </main>
  );
}
