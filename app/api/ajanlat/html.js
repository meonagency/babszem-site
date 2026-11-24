// Ajánlat: képválogatás a képtárból + HTML az elfogadott sablon (v1) szerint.
import { LOGO_FEHER_SVG } from "./logo-feher.js";
import { megszolitas } from "./megszolitas.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MARK, MARK_VIEWBOX } from "../../mark";
import { SECTIONS, ITEMS, UPSELL, KIEMELT, KIEMELT_OLDALRA, BORITO_FOLDER, TEXTS, CONTACT, VELUMA } from "./katalogus";
import { DECOR_GROUPS, SEASONAL, PREMIUM } from "../../kapcsolat/fields";
import { fileColorKey, requestedColorKeys } from "../../szinek";
import { KEPCIMKEK } from "./kepcimkek";

const PER_SECTION = 4;

const esc = (v) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// kisbetű, ékezet nélkül – a fájlnevek és a színvilág összevetéséhez
export const norm = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const IMAGE_RE = /\.(jpe?g|png|webp|heic|heif)$/i;

const SHAPES = ["kerekded", "modern"];

/** Fájlnév → { cat, colors, shape, num } a "kategória_színek[_forma]_sorszám.jpg" minta szerint (lazán). A forma elhagyható. */
export function parseName(name) {
  const base = norm(name).replace(IMAGE_RE, "");
  const parts = base.split(/[_\s]+/).filter(Boolean);
  const cat = ["szezonalis", "premium", "altalanos"].includes(parts[0]) ? parts[0] : "";
  const colorPart = cat ? parts[1] || "" : "";
  const numMatch = base.match(/(\d+)(?!.*\d)/);
  const shape = cat ? parts.slice(2).find((x) => SHAPES.includes(x)) || "" : "";
  // a színkódok a közös színtáblán át kulccsá alakulnak (pl. a régi "narancs" → "terrakotta")
  const colors = colorPart ? [...new Set(colorPart.split("-").filter(Boolean).map(fileColorKey))] : [];
  return { cat, colors, shape, num: numMatch ? Number(numMatch[1]) : 9999 };
}

const listOf = (v) =>
  (Array.isArray(v) ? v : String(v ?? "").split(/[,;\n]/)).map((x) => String(x).trim()).filter(Boolean);

/**
 * Képválogatás. files: a Make Drive-listája [{id, name, parents, thumbnailLink}].
 * overrides: { prefer: [fájlnév…], skip: [fájlnév…] } – a táblázat kézi oszlopai.
 */
// Pontozás sorrendje (a súlyokból következik): kézi felülírás > kerülendő virág > szín > kedvenc virág > forma > szezon/ár kategória > sorszám.
// Egy helyen állítható; a szín egy találata legalább annyit ér, mint a kedvenc virágok együtt (legfeljebb 2 virág számít).
export const WEIGHTS = { prefer: 1000, avoid: -15, color: 10, flower: 5, flowerMax: 2, shape: 4, category: 2, mixed: 2 };

/** Veluma-fájlnév → { tetel, colors } a "veluma_{tétel}_{színek}_{sorszám}.jpg" minta szerint. Más név: null. */
export function parseVeluma(name) {
  const parts = norm(name).replace(IMAGE_RE, "").split("_");
  if (parts[0] !== "veluma") return null;
  return { tetel: parts[1] || "", colors: [...new Set((parts[2] || "").split("-").filter(Boolean).map(fileColorKey))] };
}

const hash = (str) => [...String(str)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

/**
 * Veluma-blokk: legfeljebb 3 kép a "90 Veluma partner" mappából, a pár színei szerint.
 * Pontozás: színtalálat (WEIGHTS.color) > azonos pontszámnál az ajánlat azonosítójából képzett, stabil sorrend (így nem mindenkinél ugyanaz a három kép).
 * Válogatás: előbb tételenként (szett, meghívó, ültetőkártya…) a legjobb, hogy a három kép ne ugyanazt mutassa; a hiányt a következő legjobbak töltik.
 */
export function pickVeluma(offer, images) {
  const colorList = listOf(offer.colors);
  const colors = requestedColorKeys(colorList);
  const wantsMixed = colorList.some((c) => norm(c) === "szines");
  const seed = String(offer.id || offer.name || "");
  const ranked = images
    .filter((f) => (f.parents || []).includes(VELUMA.folder))
    .map((f) => ({ f, p: parseVeluma(f.name) }))
    .filter((x) => x.p && VELUMA.labels[x.p.tetel]) // a "hangulat" és ismeretlen tételek nem papíráru-képek
    .map((x) => ({
      ...x,
      score: WEIGHTS.color * x.p.colors.filter((c) => colors.has(c)).length + (wantsMixed && x.p.colors.length >= 3 ? WEIGHTS.mixed : 0),
      tie: hash(seed + x.f.name),
    }))
    .sort((a, b) => b.score - a.score || a.tie - b.tie);
  const picked = [];
  const tetelek = new Set();
  for (const x of ranked) {
    if (picked.length >= 3) break;
    if (tetelek.has(x.p.tetel)) continue;
    tetelek.add(x.p.tetel);
    picked.push(x);
  }
  for (const x of ranked) {
    if (picked.length >= 3) break;
    if (!picked.includes(x)) picked.push(x);
  }
  return { images: picked.map((x) => ({ file: x.f, label: VELUMA.labels[x.p.tetel] })) };
}

export function plan(offer, files, overrides = {}) {
  const prefer = new Set(listOf(overrides.prefer).map(norm));
  const skip = new Set(listOf(overrides.skip).map(norm));
  const cat = offer.flower_category === SEASONAL ? "szezonalis" : offer.flower_category === PREMIUM ? "premium" : "";
  const colorList = listOf(offer.colors);
  const colors = requestedColorKeys(colorList);
  const wantsMixed = colorList.some((c) => norm(c) === "szines");
  // kedvenc (szezonális) és a megadott prémium virágok ugyanúgy "kért virág"
  const wanted = [...listOf(offer.favorite_flowers), ...listOf(offer.premium_flowers)].map(norm);
  const avoidText = norm(offer.avoid_flowers); // szabad szöveg: a címke tövét keressük benne (pl. "liliomot" ~ "liliom")
  const shape = SHAPES.includes(norm(offer.bouquet_shape)) ? norm(offer.bouquet_shape) : "";

  const images = (files || []).filter((f) => f && f.id && IMAGE_RE.test(f.name || "") && !skip.has(norm(f.name)));
  // folders: egy mappa-azonosító vagy több (pl. a székdíszek az Odavezető út képeiből is merítenek)
  const ranked = (folders) =>
    images
      .filter((f) => (f.parents || []).some((p) => [].concat(folders).includes(p)))
      .filter((f) => cat === "premium" || parseName(f.name).cat !== "premium") // prémium képet csak prémium kérésnél mutatunk (árvárakozás); a prémium kérés a szezonális és általános képekre tartalékként támaszkodhat
      .map((f) => {
        const p = parseName(f.name);
        const tags = (KEPCIMKEK[(f.parents || [])[0]]?.[f.name] || "").split(" ").map(norm).filter(Boolean);
        let score = 0;
        if (prefer.has(norm(f.name))) score += WEIGHTS.prefer;
        if (avoidText) score += WEIGHTS.avoid * tags.filter((t) => avoidText.includes(t)).length; // gépi címke: büntetés, nem kizárás
        score += WEIGHTS.color * p.colors.filter((c) => colors.has(c)).length;
        if (wantsMixed && p.colors.length >= 3) score += WEIGHTS.mixed; // "színes" kérés: kis bónusz a sokszínű képnek
        if (wanted.length) score += WEIGHTS.flower * Math.min(WEIGHTS.flowerMax, wanted.filter((x) => tags.includes(x)).length);
        if (shape && p.shape) score += p.shape === shape ? WEIGHTS.shape : -WEIGHTS.shape; // forma nélküli kép semleges
        if (cat && p.cat === cat) score += WEIGHTS.category;
        return { f, score, num: p.num };
      })
      .sort((a, b) => b.score - a.score || a.num - b.num || a.f.name.localeCompare(b.f.name, "hu"))
      .map((x) => x.f);

  const picked = new Set(listOf(offer.decor_points));
  const bridesmaids = String(offer.bridesmaids ?? "").replace(/\D/g, "");

  // a dokumentumban egy kép (fájl-azonosító) csak egyszer szerepelhet: a borító és az összes szekció közös "used" halmazt használ
  const used = new Set();
  const coverPool = ranked(BORITO_FOLDER);
  const cover = coverPool[0] || null;
  if (cover) used.add(cover.id);

  // Hangulatoldal(ak): a kézzel válogatott képekből a szín > kedvenc virág > forma pontozás szerinti legjobbak.
  // 1. oldal: egy nagy kép; 2. oldal: 3 képes kollázs, csak ha van elég kép (különben elmarad, helykitöltő nincs).
  const featuredFiles = [...new Set(KIEMELT_OLDALRA)].flatMap((item) => {
    const folder = item === "Borító" ? BORITO_FOLDER : ITEMS[item]?.folder;
    const name = KIEMELT[item];
    if (!folder || !name) return [];
    const f = images.find((x) => x.name === name && (x.parents || []).includes(folder));
    return f ? [f] : [];
  });
  const featuredRank = ranked([...new Set(featuredFiles.flatMap((f) => f.parents || []))]).filter((f) => featuredFiles.some((k) => k.id === f.id) && !used.has(f.id));
  const featured = [];
  for (const f of featuredRank) { if (featured.length >= 4) break; featured.push(f); used.add(f.id); }
  const mood = featured.length ? { hero: featured[0], collage: featured.length >= 4 ? featured.slice(1, 4) : [] } : null;

  const sections = SECTIONS.map((s) => {
    const names = (DECOR_GROUPS.find((g) => g.title === s.group)?.items || []).filter((i) => picked.has(i));
    if (!names.length) return null;
    const items = names.map((n) => {
      const def = ITEMS[n] || {};
      let sub = "";
      if (n === "Vendégasztalok") {
        const t = offer.guest_tables ? `${offer.guest_tables} ${norm(offer.table_layout).startsWith("kerek") ? "kerek " : ""}asztal` : "";
        sub = [t, offer.guests ? `kb. ${offer.guests} főre` : ""].filter(Boolean).join(", ");
      }
      if (n === "Főasztal" && offer.head_table) sub = `${offer.head_table} fős`;
      if (n === "Koszorúslányok / -fiúk díszei" && bridesmaids) sub = `${bridesmaids} db`;
      if (n === "Templomi dekoráció" && offer.church_address) sub = offer.church_address;
      return { name: def.label || n, sub, text: def.text || "A részleteket a konzultáción egyeztetjük.", pool: def.folder ? ranked([def.folder, ...(def.alsoFrom || [])]) : [] };
    });
    // képek elosztása a tételek között körbe-körbe, legfeljebb 4
    const imgs = [];
    for (let round = 0; imgs.length < PER_SECTION && round < PER_SECTION; round++) {
      for (const it of items) {
        if (imgs.length >= PER_SECTION) break;
        const next = it.pool.find((f) => !used.has(f.id));
        if (next) { used.add(next.id); imgs.push({ file: next, label: it.name }); }
      }
    }
    // üres helyekre arculati helykitöltő, hogy a sor teljes maradjon
    for (let i = 0; imgs.length < PER_SECTION; i++) imgs.push({ file: null, label: items[i % items.length].name });
    return { ...s, items: items.map(({ pool, ...rest }) => rest), images: imgs };
  }).filter(Boolean);

  // Upsell ("Egyéb ajánlat – külön megrendelésre"): 1 kiegészítő (csuklódísz / hajdísz / autódekoráció, amit nem kértek és van hozzá kép),
  // a szülőköszöntő, és a koszorúslány-dísz, ha nem kérték (különben egy második kiegészítő).
  // Változatosság: az ajánlat azonosítójából képzett magból (stabil: újragenerálásnál ugyanaz) forgatjuk a kiegészítőt és a képet a legjobb 3 közül.
  const seed = ([...String(offer.id || offer.name || "")].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261) >>> 8);
  const accessories = Object.values(UPSELL.accessory)
    .filter((u) => !(u.requested && picked.has(u.requested)))
    .map((u) => ({ ...u, pool: ranked(u.folder) }))
    .filter((u) => u.pool.length); // kép nélküli tétel nem kerül be (nincs helykitöltő)
  const pick = (i, n) => (Math.imul(seed + i * 7919, 2654435761) >>> 16) % n; // tételenként külön, egymástól független választás
  const rot = accessories.length ? pick(0, accessories.length) : 0;
  const accessoryPicks = accessories.map((_, i) => accessories[(rot + i) % accessories.length]);
  const bridesmaidsRequested = picked.has("Koszorúslányok / -fiúk díszei");
  const upItems = [
    ...accessoryPicks.slice(0, 1),
    { ...UPSELL.parents, pool: ranked(UPSELL.parents.folder) },
    ...(bridesmaidsRequested ? accessoryPicks.slice(1, 2) : [{ ...UPSELL.bridesmaids, pool: ranked(UPSELL.bridesmaids.folder) }]),
  ];
  const upImages = [];
  upItems.forEach((it, i) => {
    const cands = it.pool.filter((f) => !used.has(f.id)).slice(0, 3);
    const next = cands.length ? cands[pick(i + 1, cands.length)] : null;
    if (next) { used.add(next.id); upImages.push({ file: next, label: it.label }); }
  });
  // 3. kép: ha egy tételnek nincs képe, a többi tételből egy további
  for (let round = 0; upImages.length < 3 && round < 3; round++)
    for (const it of upItems) {
      if (upImages.length >= 3) break;
      const next = it.pool.find((f) => !used.has(f.id));
      if (next) { used.add(next.id); upImages.push({ file: next, label: it.label }); }
    }
  for (let i = 0; upImages.length < 3; i++) upImages.push({ file: null, label: upItems[i % upItems.length].label });
  const upsell = { items: upItems.map(({ pool, folder, requested, ...rest }) => rest), images: upImages };

  return { cover, sections, upsell, mood, veluma: pickVeluma(offer, images) };
}

// ---------- megjelenítés ----------

const FONT_DIR = path.join(process.cwd(), "app/api/ajanlat/fonts");
let fontCss = "";
function fonts() {
  if (!fontCss) {
    const b64 = (f) => readFileSync(path.join(FONT_DIR, f)).toString("base64");
    fontCss =
      `@font-face{font-family:Cinzel;src:url(data:font/ttf;base64,${b64("Cinzel.ttf")});font-weight:400 900}` +
      `@font-face{font-family:Jost;src:url(data:font/ttf;base64,${b64("Jost.ttf")});font-weight:100 900}`;
  }
  return fontCss;
}

const TONES = { m: "#cb8629", d: "#d9a35b", l: "#e6c28f" };
const markSvg = (mono) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}">${MARK.map(
    ([t, d]) => `<path d="${d}" fill="${mono || TONES[t]}" fill-rule="evenodd"/>`
  ).join("")}</svg>`;
const svgUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const MARK_URI = () => svgUri(markSvg());
const LOGO_FEHER_URI = () => svgUri(LOGO_FEHER_SVG);

/** Arculati helykitöltő (ha a képtárban még nincs kép az elemhez). */
function placeholder(label, wide = false) {
  const w = wide ? 1600 : 700, h = wide ? 720 : 700;
  const mark = markSvg("#d9b886").replace("<svg ", `<svg x="${w / 2 - (wide ? 70 : 75)}" y="${h / 2 - (wide ? 150 : 160)}" width="${wide ? 140 : 150}" height="${wide ? 200 : 215}" `);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6efe3"/><stop offset="1" stop-color="#efe4d2"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><rect x="18" y="18" width="${w - 36}" height="${h - 36}" fill="none" stroke="#e2cba6" stroke-width="1.5"/>
${mark}
<text x="${w / 2}" y="${h / 2 + (wide ? 105 : 110)}" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-size="${wide ? 40 : 30}" letter-spacing="4" fill="#a86d1f">${esc(label.toUpperCase())}</text></svg>`;
  return svgUri(svg);
}

const huLong = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return esc(iso || "");
  const months = ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"];
  return `${m[1]}. ${months[Number(m[2]) - 1]} ${Number(m[3])}.`;
};
const huShort = (iso) => (/^\d{4}-\d{2}-\d{2}$/.test(iso || "") ? `${iso.replace(/-/g, ". ")}.` : esc(iso || ""));
export const coupleName = (n) => String(n || "").replace(/\s*,\s*/g, " & ").trim();

// kitöltendő mező: ha üres, sárgás jelölő marad Babinak
const field = (v, ph) => (String(v ?? "").trim() ? esc(v) : `<span class="f">${esc(ph)}</span>`);

const ROMAN = ["I.", "II.", "III.", "IV.", "V.", "VI.", "VII."];

export function buildHtml({ offer, planned, imgs, prices = {}, validUntil }) {
  const img = (file, label, wide) => (file && imgs[file.id]) || placeholder(label, wide);
  const name = coupleName(offer.name);
  const facts = [
    ["Időpont", huLong(offer.event_date)],
    ["Helyszín", esc(offer.location)],
    ...(offer.church === "Igen" ? [["Templom", esc(offer.church_address)]] : []),
    ["Létszám", offer.guests ? `${esc(offer.guests)} fő` : ""],
    ["Asztalok", [offer.guest_tables ? `${esc(offer.guest_tables)} ${norm(offer.table_layout).startsWith("kerek") ? "kerek " : ""}asztal` : esc(offer.table_layout), offer.head_table ? `${esc(offer.head_table)} fős főasztal` : ""].filter(Boolean).join(", ")],
    ["Virágok", esc(offer.flower_category === SEASONAL ? "Szezonális, hazai virágokkal" : offer.flower_category)],
    ...(offer.premium_flowers ? [["Prémium virágok", esc(offer.premium_flowers)]] : []),
    ...(offer.favorite_flowers ? [["Kedvenc virágok", esc(`${offer.favorite_flowers} (az aktuális szezon kínálatától függően)`)]] : []),
    ["Színvilág", esc(offer.colors)],
    ["Zöld levelek", esc(norm(offer.greenery) === "igen" ? "igen" : offer.greenery)],
    ...(offer.avoid_flowers ? [["Kérésetek", esc(offer.avoid_flowers)]] : []),
    ["Helyszíni munka", "dekorálás és bontás"],
  ].filter(([, v]) => v);
  const factRows = [];
  for (let i = 0; i < facts.length; i += 2) {
    const [a, b] = [facts[i], facts[i + 1]];
    factRows.push(`<tr><td class="k">${a[0]}</td><td>${a[1]}</td>${b ? `<td class="k">${b[0]}</td><td>${b[1]}</td>` : "<td></td><td></td>"}</tr>`);
  }

  const secs = planned.sections.map((s, i) => ({ ...s, no: ROMAN[i] }));
  const workNo = ROMAN[secs.length];
  const priceBox = (v, ph) => `<div class="price">ÁRSÁV<b>${field(v, ph)}</b></div>`;

  const sumRows = [
    ...secs.map((s) => [`${s.no} ${s.title}`, prices[s.key]]),
    [`${workNo} Munkadíj és kiszállás`, prices.munkadij],
  ];

  const route = [huLong(offer.event_date), esc(offer.location), offer.guests ? `${esc(offer.guests)} fő` : ""].filter(Boolean).join(" &nbsp;·&nbsp; ");
  const runHead = `<div class="hd"><div class="l"><img src="${MARK_URI()}" alt="">BABSZEM VIRÁGMŰHELY</div><div class="r">${esc(name)} &nbsp;·&nbsp; ${huShort(offer.event_date)}</div></div>`;

  // szekció: teljes szélességű főkép (margó nélkül), alatta cím + ársáv, tételek, 3 kisebb kép
  const sectionPages = secs
    .map((s) => {
      const [hero, ...rest] = s.images;
      const heroH = s.items.length > 7 ? 78 : s.items.length > 4 ? 104 : 124;
      return `<section class="sp">
  <div class="vg"><img class="sp-hero" style="height:${heroH}mm" src="${img(hero.file, hero.label, true)}" alt=""></div>
  <div class="sp-body">
    <div class="sp-head"><div class="no">${s.no}</div><h2>${esc(s.title)}</h2>${priceBox(prices[s.key], "00 000 – 00 000 Ft")}</div>
    <table class="items">${s.items
      .map((it) => `<tr><td class="n">${esc(it.name)}${it.sub ? `<span>${esc(it.sub)}</span>` : ""}</td><td>${esc(it.text)}</td></tr>`)
      .join("")}</table>
    <div class="sp-row">${rest.map((x) => `<figure><img src="${img(x.file, x.label)}" alt=""><figcaption>${esc(x.label)}</figcaption></figure>`).join("")}</div>
  </div>
</section>`;
    })
    .join("\n");

  // Veluma-partneroldal (az ajánlat utolsó oldala): csak akkor jelenik meg, ha van hozzá kép (a Make Drive-listájában szerepel a Veluma mappa és a letöltés sikerült)
  const velImgs = (planned.veluma?.images || []).filter((x) => x.file && imgs[x.file.id]);
  const veluma = velImgs.length
    ? `<section class="flow veluma">
  ${runHead}
  <div class="eyebrow">${esc(VELUMA.eyebrow)}</div>
  <h2 class="vel-title">${esc(VELUMA.title)}</h2>
  <p class="lead">${esc(VELUMA.lead)}</p>
  <div class="vel-grid vel-n${velImgs.length}">${velImgs
    .map((x, i) => `<figure class="v${i + 1}"><img src="${imgs[x.file.id]}" alt=""><figcaption>${esc(x.label)}</figcaption></figure>`)
    .join("")}</div>
  <p class="vel-items">${VELUMA.items.map(esc).join(" &nbsp;·&nbsp; ")}</p>
  <div class="box"><p>${esc(VELUMA.note)}</p></div>
  <p class="vel-url">${esc(VELUMA.url)}</p>
</section>`
    : "";

  return `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>Ajánlat – ${esc(name)}</title>
<style>${fonts()}${CSS}</style></head><body>

<section class="cover">
  <div class="vg vg-cover"><img class="cover-img" src="${img(planned.cover, "Borítókép", true)}" alt=""></div>
  <div class="cover-logo"><img src="${LOGO_FEHER_URI()}" alt="Babszem Virágműhely"></div>
  <div class="cover-title">
    <div class="eyebrow">ESKÜVŐI DEKORÁCIÓS AJÁNLAT</div>
    <h1>${esc(name)}</h1>
    <div class="meta">${route}</div>
  </div>
</section>

<section class="flow letterpage">
  ${runHead}
  <div class="letter">
    <p class="salute">${esc(megszolitas(offer.name, offer.name_1, offer.name_2))}</p>
    ${TEXTS.intro.map((p) => `<p>${esc(p)}</p>`).join("")}
    <p class="note">${esc(TEXTS.disclaimer)}</p>
  </div>
  <div class="box"><h3>ONLINE KONZULTÁCIÓ</h3><p>${esc(TEXTS.consult)}</p></div>
  <h2 class="sec" style="margin-top:9mm">Az esküvőtök</h2>
  <table class="facts">${factRows.join("")}</table>
</section>

${
  planned.mood
    ? `<section class="mood"><div class="vg"><img class="mood-hero" src="${img(planned.mood.hero, "Hangulatkép", true)}" alt=""></div><div class="mood-cap">${esc(name)}</div></section>
${
  planned.mood.collage.length
    ? `<section class="mood"><div class="mood-grid"><div class="vg m1"><img src="${img(planned.mood.collage[0], "", true)}" alt=""></div><img class="m2" src="${img(planned.mood.collage[1], "")}" alt=""><img class="m3" src="${img(planned.mood.collage[2], "")}" alt=""></div></section>`
    : ""
}`
    : ""
}

${sectionPages}

<section class="flow">
  ${runHead}
  <div class="block">
    <div class="bh"><div class="no">${workNo}</div><div><h2>Munkadíj és kiszállás</h2></div>${priceBox(prices.munkadij, "000 000 – 000 000 Ft")}</div>
    <table class="items">${TEXTS.work.map(([k, v]) => `<tr><td class="n">${k}</td><td>${esc(v)}</td></tr>`).join("")}
      <tr><td class="n">Üzemanyagdíj</td><td>${esc(TEXTS.fuel)}: ${field(prices.uzemanyag, "00 000 Ft")}</td></tr></table>
  </div>
  <div class="keep">
    <h2 class="sec">Összesítés</h2>
    <table class="sum">${sumRows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="v">${field(v, "00 000 – 00 000 Ft")}</td></tr>`).join("")}
      <tr class="total"><td>Végösszeg</td><td class="v">${field(prices.vegosszeg, "000 000 – 000 000 Ft")}</td></tr></table>
    <p class="small">A végösszeg attól függ, melyik változatot választjátok. Az online konzultáció díja (5&nbsp;000&nbsp;Ft) megrendelés esetén a végső árból jóváírásra kerül.</p>
  </div>
</section>

<section class="flow upsell">
  ${runHead}
  <h2 class="sec">${esc(UPSELL.title)}</h2>
  <p class="lead">${esc(UPSELL.intro)}</p>
  <div class="tri">${planned.upsell.images
    .map((x, i) => {
      const it = planned.upsell.items.find((u) => u.label === x.label) || planned.upsell.items[i % planned.upsell.items.length];
      return `<figure><img src="${img(x.file, x.label)}" alt=""><figcaption>${esc(it.label)}</figcaption><p>${esc(it.text)}</p></figure>`;
    })
    .join("")}</div>
</section>

<section class="flow last">
  ${runHead}
  <div class="keep">
    <h2 class="sec">Amit tudni érdemes rólunk</h2>
    <ul class="dots">${TEXTS.about.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
  </div>
  <div class="box" style="margin-top:8mm"><h3>FONTOS TUDNIVALÓK</h3><p>${esc(TEXTS.important)}</p></div>
  <div class="keep" style="margin-top:8mm">
    <h2 class="sec" style="margin-bottom:2mm">Hogyan tovább?</h2>
    <p>${esc(TEXTS.next)}</p>
    <div class="sign">
      <img src="${MARK_URI()}" alt="">
      <p>Köszönjük, hogy minket kerestetek!</p>
      <div class="by">Babi</div>
      <div class="small">Babszem Virágműhely</div>
      <div class="contact">${CONTACT.phone} &nbsp;·&nbsp; ${CONTACT.email} &nbsp;·&nbsp; ${CONTACT.web} &nbsp;·&nbsp; ${CONTACT.ig}</div>
    </div>
  </div>
</section>
${veluma}
<script>
window.addEventListener("load",function(){
  var MM=96/25.4,Q=2.2;
  function tone(im){try{var c=document.createElement("canvas");c.width=c.height=16;var x=c.getContext("2d");x.drawImage(im,0,0,16,16);var d=x.getImageData(0,0,16,16).data,r=0,g=0,b=0,n=0;for(var i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}r/=n;g/=n;b/=n;var R=r/255,G=g/255,B=b/255,mx=Math.max(R,G,B),mn=Math.min(R,G,B),dl=mx-mn,h=0;if(dl>0){h=mx===R?((G-B)/dl)%6:mx===G?(B-R)/dl+2:(R-G)/dl+4;h*=60;if(h<0)h+=360}h=(h+180)%360;var s=Math.min(.32,Math.max(.14,dl*.6));return hsl(h,s,.12)}catch(e){return null}}
  function hsl(h,s,l){var a=s*Math.min(l,1-l);function f(n){var k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))}return[f(0),f(8),f(4)]}
  var cov=document.querySelector(".cover"),ci=document.querySelector(".cover-img"),dark=ci?tone(ci):null;
  if(dark&&cov)cov.style.setProperty("--cd","rgb("+dark.join(",")+")");
  var cd=dark||[42,33,24];
  document.querySelectorAll(".vg").forEach(function(box){try{
    var im=box.querySelector("img");if(!im||!im.naturalWidth)return;
    var r=im.getBoundingClientRect(),w=Math.round(r.width*Q),h=Math.round(r.height*Q);
    var c=document.createElement("canvas");c.width=w;c.height=h;var x=c.getContext("2d");
    var sc=Math.max(w/im.naturalWidth,h/im.naturalHeight),dw=im.naturalWidth*sc,dh=im.naturalHeight*sc;
    x.drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh);
    x.save();var fx=w*.5,fy=h*.52;x.translate(w*.5,h*.48);x.scale(fx*Math.SQRT2,fy*Math.SQRT2);
    var rg=x.createRadialGradient(0,0,0,0,0,1);rg.addColorStop(.58,"rgba(30,20,10,0)");rg.addColorStop(1,"rgba(30,20,10,.2)");
    x.fillStyle=rg;x.fillRect(-2,-2,4,4);x.restore();
    if(box.classList.contains("vg-cover")){var gh=92*MM*Q,lg=x.createLinearGradient(0,h-gh,0,h);
      lg.addColorStop(0,"rgba("+cd.join(",")+",0)");lg.addColorStop(1,"rgb("+cd.join(",")+")");x.fillStyle=lg;x.fillRect(0,h-gh,w,gh)}
    var url=c.toDataURL("image/jpeg",.92);
    im.style.objectFit="fill";im.src=url;box.classList.add("flat");
  }catch(e){}});
});
</script></body></html>`;
}

/** Lábléc a Chrome PDF-hez (minden oldalon): érvényesség + oldalszám. */
export function footerHtml(validUntil) {
  return `<div style="width:100%;margin:0 18mm;padding-top:2.5mm;border-top:.5pt solid #e4d9c7;font-family:Jost,Arial,sans-serif;font-size:7.5pt;color:#7a6a58;display:flex;justify-content:space-between">
<span>${CONTACT.web} &nbsp;·&nbsp; ${CONTACT.phone}${validUntil ? ` &nbsp;·&nbsp; érvényes: ${esc(validUntil)}-ig` : ""}</span>
<span style="letter-spacing:.1em"><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
}

const CSS = `
@page { size: A4; margin: 16mm 18mm 20mm; }
@page full { size: A4; margin: 0 0 20mm 0; }
@page cover { size: A4; margin: 0; }
:root { --gold:#cb8629; --gold-mid:#d9a35b; --gold-light:#e6c28f; --gold-deep:#a86d1f; --cream:#faf6ef; --line:#e4d9c7; --ink:#3a2c1e; --muted:#7a6a58; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Jost,Arial,sans-serif; font-weight:300; font-size:9.6pt; line-height:1.55; color:var(--ink); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.f { font-family:Jost,Arial,sans-serif; background:#fbf1df; color:var(--gold-deep); border-bottom:1px dotted var(--gold); padding:0 3px; white-space:nowrap; }
h1,h2,h3 { font-family:Cinzel,Georgia,serif; font-weight:400; }
.eyebrow { font-family:Cinzel,serif; font-size:8.5pt; letter-spacing:.34em; color:var(--gold-deep); }
.flow { break-after:page; }
.flow:last-of-type { break-after:auto; }

.vg { position:relative; width:210mm; overflow:hidden; }
.vg img { display:block; }
/* egységes vignetta: a kép szélén legfeljebb 20% sötétítés, középen semmi */
.vg::after { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 58%, rgba(30,20,10,.20) 100%); }
/* címlap: a kép alja lefelé egyenletesen sötétedik a háttérkép komplementer sötét tónusába, ami kitölti az oldal többi részét */
.vg.flat::before, .vg.flat::after { display:none; }
.vg-cover::before { content:""; position:absolute; left:0; right:0; bottom:0; height:92mm; z-index:1; pointer-events:none; background:linear-gradient(to bottom, rgba(0,0,0,0), var(--cd)); }
.mood-grid .m1 img { width:100%; height:160mm; object-fit:cover; }
.mood-grid .vg.m1 { width:100%; }
.cover { --cd:#2a2118; background:var(--cd); page:cover; height:297mm; break-after:page; overflow:hidden; text-align:center; }
.cover-img { display:block; width:210mm; height:150mm; object-fit:cover; }
.cover-logo { margin-top:14mm; }
.cover-logo img { width:40mm; height:auto; }
.cover-title { margin-top:12mm; }
.cover-title h1 { font-size:30pt; margin:5mm 0 3mm; letter-spacing:.04em; }
.cover .cover-title h1 { color:#f6efe2; }
.cover .cover-title .eyebrow { color:var(--gold-light); }
.cover-title .meta { font-size:9.6pt; color:#cdbfa9; letter-spacing:.14em; }

.letter { margin-top:2mm; }
.letter p, .flow p { margin-bottom:2.6mm; }
.letter .salute { font-family:Cinzel,serif; font-size:13pt; color:var(--gold-deep); margin-bottom:4mm; }
.note { color:var(--muted); font-style:italic; }
.box { background:var(--cream); border-left:2pt solid var(--gold); padding:4mm 5.5mm; margin-top:5mm; }
.box h3 { font-size:9.5pt; letter-spacing:.14em; color:var(--gold-deep); margin-bottom:1.4mm; }
.box p { margin:0; }

.hd { display:table; width:100%; border-bottom:.6pt solid var(--gold-light); padding-bottom:3mm; margin-bottom:9mm; }
.hd > div { display:table-cell; vertical-align:bottom; }
.hd .l { font-family:Cinzel,serif; font-size:7.6pt; letter-spacing:.28em; color:var(--gold-deep); }
.hd .l img { height:7.5mm; vertical-align:-2.2mm; margin-right:2.5mm; }
.hd .r { text-align:right; font-size:7.6pt; color:var(--muted); letter-spacing:.1em; }
h2.sec { font-size:13pt; letter-spacing:.1em; color:var(--gold-deep); }
.lead { margin:3mm 0 8mm; color:var(--muted); font-size:10.4pt; }
.facts { width:100%; border-collapse:collapse; margin:3mm 0 0; }
.facts td { padding:1.7mm 2.5mm; border-bottom:.5pt solid var(--line); vertical-align:top; width:33%; }
.facts td.k { color:var(--gold-deep); font-family:Cinzel,serif; font-size:7pt; letter-spacing:.14em; text-transform:uppercase; width:17%; padding-top:2.4mm; }

.mood { page:full; height:277mm; break-after:page; overflow:hidden; }
.mood-hero { display:block; width:210mm; height:240mm; object-fit:cover; }
.mood-cap { margin-top:9mm; text-align:center; font-family:Cinzel,serif; font-size:8pt; letter-spacing:.34em; color:var(--gold-deep); text-transform:uppercase; }
.mood-grid { display:grid; grid-template-columns:1fr 1fr; gap:3mm; width:210mm; }
.mood-grid img { display:block; width:100%; object-fit:cover; }
.mood-grid .m1 { grid-column:1 / 3; height:160mm; }
.mood-grid .m2, .mood-grid .m3 { height:114mm; }

.sp { page:full; break-after:page; }
.sp-hero { display:block; width:210mm; object-fit:cover; }
.sp-body { padding:9mm 18mm 0; }
.sp-head { display:table; width:100%; border-bottom:.8pt solid var(--gold); padding-bottom:2.4mm; margin-bottom:4mm; }
.sp-head > * { display:table-cell; vertical-align:bottom; }
.sp-head .no { font-family:Cinzel,serif; color:var(--gold-light); font-size:30pt; line-height:.9; width:20mm; }
.sp-head h2 { font-size:15pt; letter-spacing:.1em; }
.sp-row { display:grid; grid-template-columns:repeat(3,1fr); gap:3mm; margin-top:6mm; break-inside:avoid; }
.sp-row figure img { display:block; width:100%; aspect-ratio:1/1; object-fit:cover; }
figcaption { font-family:Cinzel,serif; font-size:6.4pt; letter-spacing:.22em; color:var(--gold-deep); text-transform:uppercase; margin-top:1.8mm; }

.price { text-align:right; white-space:nowrap; font-size:7pt; color:var(--muted); letter-spacing:.14em; font-family:Cinzel,serif; }
.price b { display:block; font-family:Jost,sans-serif; font-weight:500; font-size:10.5pt; color:var(--gold-deep); letter-spacing:0; }
.block, .keep { break-inside:avoid; }
.block { margin-bottom:8mm; }
.bh { display:table; width:100%; border-bottom:.8pt solid var(--gold); padding-bottom:1.8mm; margin-bottom:3mm; }
.bh > div { display:table-cell; vertical-align:bottom; }
.bh .no { font-family:Cinzel,serif; color:var(--gold-light); font-size:15pt; width:11mm; line-height:1; }
.bh h2 { font-size:13pt; letter-spacing:.1em; }
.items { width:100%; border-collapse:collapse; margin-bottom:3mm; }
.items td { padding:1.4mm 0; vertical-align:top; }
.items td.n { width:46mm; font-weight:500; padding-right:4mm; }
.items td.n > span { display:block; font-weight:400; font-size:8pt; color:var(--muted); }

.sum { width:100%; border-collapse:collapse; margin:3mm 0 2mm; }
.sum td { padding:2.2mm 2.5mm; border-bottom:.5pt solid var(--line); }
.sum td.v { text-align:right; white-space:nowrap; }
.sum tr.total td { border-bottom:none; border-top:1pt solid var(--gold); background:var(--cream); font-family:Cinzel,serif; font-size:11pt; color:var(--gold-deep); padding:3mm 2.5mm; }
.small { font-size:8.2pt; color:var(--muted); }

.tri { display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; }
.tri img { display:block; width:100%; height:128mm; object-fit:cover; }
.tri p { color:var(--muted); font-size:8.6pt; margin-top:1.5mm; }

.veluma .eyebrow { margin-top:2mm; }
.vel-title { font-size:20pt; letter-spacing:.08em; color:var(--gold-deep); margin:2mm 0 0; }
.vel-grid { display:grid; gap:3mm; margin:2mm 0 6mm; }
.vel-grid figure { margin:0; }
.vel-grid img { display:block; width:100%; height:100%; object-fit:cover; }
.vel-grid.vel-n3 { grid-template-columns:1.25fr 1fr; grid-template-rows:75mm 75mm; }
.vel-grid.vel-n3 .v1 { grid-row:1 / 3; }
.vel-grid.vel-n3 figure { display:flex; flex-direction:column; }
.vel-grid.vel-n3 img { flex:1; min-height:0; }
.vel-grid.vel-n2 { grid-template-columns:1fr 1fr; grid-template-rows:120mm; }
.vel-grid.vel-n1 { grid-template-columns:1fr; grid-template-rows:150mm; }
.vel-grid figure { display:flex; flex-direction:column; min-height:0; }
.vel-grid figure img { flex:1; min-height:0; }
.vel-items { font-family:Cinzel,serif; font-size:7.4pt; letter-spacing:.18em; color:var(--gold-deep); text-transform:uppercase; margin:0 0 5mm !important; }
.vel-url { font-family:Cinzel,serif; letter-spacing:.2em; font-size:9pt; color:var(--gold-deep); margin-top:4mm !important; }
ul.dots { list-style:none; columns:2; column-gap:8mm; margin-top:3mm; }
ul.dots li { padding-left:4mm; position:relative; margin-bottom:1.8mm; break-inside:avoid; }
ul.dots li::before { content:""; position:absolute; left:0; top:2.1mm; width:1.4mm; height:1.4mm; background:var(--gold-mid); transform:rotate(45deg); }
.sign { margin-top:9mm; text-align:center; }
.sign img { height:12mm; }
.sign p { margin:2mm 0 0 !important; }
.sign .by { font-family:Cinzel,serif; font-size:13pt; color:var(--gold-deep); margin:1.5mm 0 1mm; }
.contact { margin-top:3mm; font-size:8.5pt; color:var(--muted); letter-spacing:.03em; }
`;
