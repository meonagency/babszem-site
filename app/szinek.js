// Színtábla: a kérdőív színválasztói és a Képtár fájlnév-színkódjai egyetlen helyről jönnek.
//  key   – a fájlnévben szereplő kód (kisbetű, ékezet nélkül)
//  chips – a kérdőív feliratai (egy kulcshoz több is tartozhat); ha nincs, a szín nem választható chipként
//  alias – más írásmódok (szabad szöveg, régi sorok, régi fájlnevek), amelyek erre a kulcsra mennek
//  match – kérésnél ezekre a kulcsokra is találhat (pl. a pasztell púder, rózsaszín, barack képet is)
// Új szín felvétele: egy sor ide. A sorrend a kérdőív chipjeinek sorrendje.
export const SZINEK = [
  { key: "feher", chips: ["fehér"], alias: ["white"] },
  { key: "krem", chips: ["krém"], alias: ["ekru", "bezs"] },
  { key: "puder", chips: ["púder"], alias: [] },
  { key: "rozsaszin", chips: ["rózsaszín"], alias: ["pink"] },
  { key: "barack", chips: ["barack"], alias: ["oszibarack"] },
  { key: "terrakotta", chips: ["terrakotta"], alias: ["narancs", "narancssarga", "tegla"] },
  { key: "bordo", chips: ["bordó"], alias: [] },
  { key: "piros", chips: ["piros"], alias: ["voros"] },
  { key: "lila", chips: ["levendula", "lila"], alias: ["orgona"] },
  { key: "kek", chips: ["kék"], alias: [] },
  { key: "zold", chips: ["zöld"], alias: ["zsalya", "oliva"] },
  { key: "sarga", chips: ["sárga"], alias: [] },
  { key: "barna", chips: ["barna"], alias: [] },
  { key: "arany", chips: ["arany"], alias: ["aranysarga"] },
  { key: "pasztell", chips: ["pasztell"], alias: [], match: ["puder", "rozsaszin", "barack"] },
  { key: "szines", chips: ["színes"], alias: ["vegyes", "tarka"] },
];

const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/** A kérdőív chipjei, a táblabeli sorrendben. */
export const COLOR_CHIPS = SZINEK.flatMap((z) => z.chips || []);

// minden írásmód (kulcs, chip, alias) → kulcs
const TO_KEY = new Map(
  SZINEK.flatMap((z) => [z.key, ...(z.chips || []), ...(z.alias || [])].map((n) => [norm(n), z.key]))
);
const MATCH = new Map(SZINEK.map((z) => [z.key, z.match || []]));

/** Fájlnév-színkód → kulcs (ismeretlen kód változatlanul marad). */
export const fileColorKey = (token) => TO_KEY.get(norm(token)) || norm(token);

/** Kérdőív-színek (chip vagy szabad szöveg) → kért kulcsok halmaza. A szabad szöveg szavaira is keres. */
export function requestedColorKeys(list) {
  const out = new Set();
  const add = (k) => { out.add(k); (MATCH.get(k) || []).forEach((m) => out.add(m)); };
  for (const c of list) {
    const n = norm(c);
    if (!n) continue;
    if (TO_KEY.has(n)) add(TO_KEY.get(n));
    else n.split(/\s+/).forEach((w) => add(TO_KEY.get(w) || w));
  }
  out.delete("szines"); // a "színes" kérés nem ad színpontot
  return out;
}
