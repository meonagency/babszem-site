// Ajánlat: képválogatás a képtárból + HTML az elfogadott sablon (v1) szerint.
import { readFileSync } from "node:fs";
import path from "node:path";
import { MARK, MARK_VIEWBOX } from "../../mark";
import { SECTIONS, ITEMS, GIFT_ITEMS, UPSELL, BORITO_FOLDER, TEXTS, CONTACT } from "./katalogus";
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
  const gifts = new Set(listOf(offer.gifts));
  const bridesmaids = String(offer.bridesmaids ?? "").replace(/\D/g, "");

  // a dokumentumban egy kép (fájl-azonosító) csak egyszer szerepelhet: a borító és az összes szekció közös "used" halmazt használ
  const used = new Set();
  const coverPool = ranked(BORITO_FOLDER);
  const cover = coverPool[0] || null;
  if (cover) used.add(cover.id);

  const sections = SECTIONS.map((s) => {
    const names =
      s.key === "ajandek"
        ? GIFT_ITEMS.filter((g) => gifts.has(g))
        : (DECOR_GROUPS.find((g) => g.title === s.group)?.items || []).filter((i) => picked.has(i));
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

  // Upsell: mindig kiegészítő (csuklódísz, ha nem kérték, különben hajdísz) + szülőköszöntő; koszorúslány-dísz csak ha nem kérték.
  // Pontosan 3 kép: tételenként körbe-körbe, a közös "used" halmazzal.
  const wantsWrist = picked.has("Csuklódísz");
  const upItems = [
    wantsWrist ? UPSELL.accessory.haj : UPSELL.accessory.csuklo,
    UPSELL.parents,
    ...(picked.has("Koszorúslányok / -fiúk díszei") ? [] : [UPSELL.bridesmaids]),
  ].map((u) => ({ ...u, pool: ranked(u.folder) }));
  const upImages = [];
  for (let round = 0; upImages.length < 3 && round < 3; round++)
    for (const it of upItems) {
      if (upImages.length >= 3) break;
      const next = it.pool.find((f) => !used.has(f.id));
      if (next) { used.add(next.id); upImages.push({ file: next, label: it.label }); }
    }
  for (let i = 0; upImages.length < 3; i++) upImages.push({ file: null, label: upItems[i % upItems.length].label });
  const upsell = { items: upItems.map(({ pool, folder, ...rest }) => rest), images: upImages };

  return { cover, sections, upsell };
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

  const sectionHtml = secs
    .map(
      (s) => `<div class="block">
  <div class="bh"><div class="no">${s.no}</div><div><h2>${esc(s.title)}</h2></div>${priceBox(prices[s.key], "00 000 – 00 000 Ft")}</div>
  <table class="items">${s.items
    .map((it) => `<tr><td class="n">${esc(it.name)}${it.sub ? `<span>${esc(it.sub)}</span>` : ""}</td><td>${esc(it.text)}</td></tr>`)
    .join("")}</table>
  ${s.key === "vacsora" ? `<p class="gift"><b>AJÁNDÉK TÉTEL:</b> ${esc(TEXTS.vacsoraGift)}</p>` : ""}
  <table class="gallery"><tr>${s.images.map((x) => `<td><img src="${img(x.file, x.label)}" alt=""></td>`).join("")}</tr></table>
</div>`
    )
    .join("\n");

  const sumRows = [
    ...secs.map((s) => [`${s.no} ${s.title}`, prices[s.key]]),
    [`${workNo} Munkadíj és kiszállás`, prices.munkadij],
  ];

  return `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>Ajánlat – ${esc(name)}</title>
<style>${fonts()}${CSS}</style></head><body>

<section class="cover">
  <div class="cover-logo"><img src="${MARK_URI()}" alt=""><div class="w1">BABSZEM</div><div class="w2">VIRÁGMŰHELY</div></div>
  <div class="cover-title">
    <div class="eyebrow">ESKÜVŐI DEKORÁCIÓS AJÁNLAT</div>
    <h1>${esc(name)}</h1>
    <div class="meta">${[huLong(offer.event_date), esc(offer.location), offer.guests ? `${esc(offer.guests)} fő` : ""].filter(Boolean).join(" &nbsp;·&nbsp; ")}</div>
  </div>
  <div class="orn">✦ ✦ ✦</div>
  <img class="cover-img" src="${img(planned.cover, "Borítókép", true)}" alt="">
  <div class="letter">
    <p class="salute">Kedves Jegyesek!</p>
    ${TEXTS.intro.map((p) => `<p>${esc(p)}</p>`).join("")}
    <p class="note">${esc(TEXTS.disclaimer)}</p>
  </div>
  <div class="box"><h3>ONLINE KONZULTÁCIÓ</h3><p>${esc(TEXTS.consult)}</p></div>
</section>

<section class="body">
  <div class="hd"><div class="l"><img src="${MARK_URI()}" alt="">BABSZEM VIRÁGMŰHELY</div><div class="r">${esc(name)} &nbsp;·&nbsp; ${huShort(offer.event_date)}</div></div>
  <h2 class="sec">Az esküvőtök</h2>
  <table class="facts">${factRows.join("")}</table>

  ${sectionHtml}

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

  <div class="keep">
    <h2 class="sec" style="margin-top:7mm">Amit tudni érdemes rólunk</h2>
    <ul class="dots">${TEXTS.about.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
  </div>

  <div class="upsell">
    <h2 class="sec">${esc(UPSELL.title)}</h2>
    <p style="margin:2mm 0 4mm">${esc(UPSELL.intro)}</p>
    <table class="items">${planned.upsell.items.map((it) => `<tr><td class="n">${esc(it.label)}</td><td>${esc(it.text)}</td></tr>`).join("")}</table>
    <table class="gallery up">${`<tr>${planned.upsell.images.map((x) => `<td><img src="${img(x.file, x.label)}" alt=""></td>`).join("")}</tr>`}</table>
  </div>

  <div class="last">
  <div class="box" style="margin-top:0"><h3>FONTOS TUDNIVALÓK</h3><p>${esc(TEXTS.important)}</p></div>

  <div class="keep" style="margin-top:6mm">
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
  </div>
</section>
</body></html>`;
}

/** Lábléc a Chrome PDF-hez (minden oldalon): érvényesség + oldalszám. */
export function footerHtml(validUntil) {
  return `<div style="width:100%;margin:0 18mm;padding-top:2.5mm;border-top:.5pt solid #e4d9c7;font-family:Jost,Arial,sans-serif;font-size:7.5pt;color:#7a6a58;display:flex;justify-content:space-between">
<span>${CONTACT.web} &nbsp;·&nbsp; ${CONTACT.phone}${validUntil ? ` &nbsp;·&nbsp; érvényes: ${esc(validUntil)}-ig` : ""}</span>
<span style="letter-spacing:.1em"><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
}

const CSS = `
@page { size: A4; margin: 16mm 18mm 20mm; }
:root { --gold:#cb8629; --gold-mid:#d9a35b; --gold-light:#e6c28f; --gold-deep:#a86d1f; --cream:#faf6ef; --line:#e4d9c7; --ink:#3a2c1e; --muted:#7a6a58; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Jost,Arial,sans-serif; font-size:9.6pt; line-height:1.5; color:var(--ink); -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.f { font-family:Jost,Arial,sans-serif; background:#fbf1df; color:var(--gold-deep); border-bottom:1px dotted var(--gold); padding:0 3px; white-space:nowrap; }
h1,h2,h3 { font-family:Cinzel,Georgia,serif; font-weight:400; }
.eyebrow { font-family:Cinzel,serif; font-size:8.5pt; letter-spacing:.32em; color:var(--gold-deep); }
.cover { break-after:page; }
.upsell { break-before:page; break-inside:avoid; }
.last { break-before:page; break-inside:avoid; }
.gallery.up img { aspect-ratio:4/5; }
.cover-logo { text-align:center; }
.cover-logo img { height:21mm; }
.cover-logo .w1 { font-family:Cinzel,serif; font-size:15pt; letter-spacing:.3em; color:var(--gold); margin-top:2.5mm; }
.cover-logo .w2 { font-family:Cinzel,serif; font-size:7.5pt; letter-spacing:.52em; color:var(--gold-mid); margin-top:.5mm; }
.cover-title { text-align:center; margin-top:7mm; }
.cover-title h1 { font-size:21pt; margin:2.5mm 0 1.5mm; letter-spacing:.02em; }
.cover-title .meta { font-size:10pt; color:var(--muted); letter-spacing:.04em; }
.orn { text-align:center; margin:4mm 0 5mm; color:var(--gold-light); font-size:9pt; letter-spacing:.6em; }
.cover-img { width:100%; height:74mm; display:block; object-fit:cover; }
.letter { margin-top:6mm; }
.letter p, .body p { margin-bottom:2.4mm; }
.letter .salute { font-family:Cinzel,serif; font-size:12pt; color:var(--gold-deep); margin-bottom:3mm; }
.note { color:var(--muted); font-style:italic; }
.box { background:var(--cream); border-left:2pt solid var(--gold); padding:3.5mm 5mm; margin-top:4mm; }
.box h3 { font-size:9.5pt; letter-spacing:.14em; color:var(--gold-deep); margin-bottom:1.2mm; }
.box p { margin:0; }
.hd { display:table; width:100%; border-bottom:.6pt solid var(--gold-light); padding-bottom:3mm; margin-bottom:7mm; }
.hd > div { display:table-cell; vertical-align:bottom; }
.hd .l { font-family:Cinzel,serif; font-size:8pt; letter-spacing:.28em; color:var(--gold-deep); }
.hd .l img { height:7.5mm; vertical-align:-2.2mm; margin-right:2.5mm; }
.hd .r { text-align:right; font-size:8pt; color:var(--muted); }
h2.sec { font-size:12.5pt; letter-spacing:.1em; color:var(--gold-deep); }
.facts { width:100%; border-collapse:collapse; margin:2mm 0 6mm; }
.facts td { padding:1.4mm 2.5mm; border-bottom:.5pt solid var(--line); vertical-align:top; width:33%; }
.facts td.k { color:var(--muted); font-size:8.5pt; width:17%; }
.block, .keep { break-inside:avoid; }
.block { margin-bottom:7mm; }
.bh { display:table; width:100%; border-bottom:.8pt solid var(--gold); padding-bottom:1.6mm; margin-bottom:2.6mm; }
.bh > div { display:table-cell; vertical-align:bottom; }
.bh .no { font-family:Cinzel,serif; color:var(--gold-light); font-size:15pt; width:11mm; line-height:1; }
.bh h2 { font-size:12.5pt; letter-spacing:.1em; }
.bh .price { text-align:right; white-space:nowrap; font-size:8pt; color:var(--muted); letter-spacing:.06em; }
.bh .price b { display:block; font-family:Jost,sans-serif; font-weight:500; font-size:10.5pt; color:var(--gold-deep); letter-spacing:0; }
.items { width:100%; border-collapse:collapse; margin-bottom:3mm; }
.items td { padding:1.3mm 0; vertical-align:top; }
.items td.n { width:46mm; font-weight:500; padding-right:4mm; }
.items td.n > span { display:block; font-weight:400; font-size:8pt; color:var(--muted); }
.gift { font-size:8.5pt; color:var(--gold-deep); margin:-1mm 0 3mm !important; }
.gift b { font-weight:500; letter-spacing:.08em; }
.gallery { border-collapse:separate; border-spacing:3.2mm 0; margin:0 -3.2mm; width:calc(100% + 6.4mm); table-layout:fixed; }
.gallery img { width:100%; aspect-ratio:1/1; object-fit:cover; display:block; }
.sum { width:100%; border-collapse:collapse; margin:3mm 0 2mm; }
.sum td { padding:2mm 2.5mm; border-bottom:.5pt solid var(--line); }
.sum td.v { text-align:right; white-space:nowrap; }
.sum tr.total td { border-bottom:none; border-top:1pt solid var(--gold); background:var(--cream); font-family:Cinzel,serif; font-size:11pt; color:var(--gold-deep); padding:3mm 2.5mm; }
.small { font-size:8.2pt; color:var(--muted); }
ul.dots { list-style:none; columns:2; column-gap:8mm; margin-top:2mm; }
ul.dots li { padding-left:4mm; position:relative; margin-bottom:1.6mm; break-inside:avoid; }
ul.dots li::before { content:""; position:absolute; left:0; top:2.1mm; width:1.4mm; height:1.4mm; background:var(--gold-mid); transform:rotate(45deg); }
.sign { margin-top:7mm; text-align:center; }
.sign img { height:12mm; }
.sign p { margin:2mm 0 0 !important; }
.sign .by { font-family:Cinzel,serif; font-size:13pt; color:var(--gold-deep); margin:1.5mm 0 1mm; }
.contact { margin-top:3mm; font-size:8.5pt; color:var(--muted); letter-spacing:.03em; }
`;
