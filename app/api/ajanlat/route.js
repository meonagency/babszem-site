// Ajánlatgenerátor: a Make ide küldi az ajánlat adatait + a képtár Drive-listáját, PDF-et kap vissza.
// Hívás: POST /api/ajanlat  { token, offer, files, prices, prefer, skip, valid_until, format }
//  - token: ugyanaz a titok, mint a kapcsolat webhooknál (MAKE_WEBHOOK_TOKEN)
//  - offer: az űrlap offer_json mezője (objektum vagy JSON szöveg)
//  - files: Drive files.list eredmény (files tömb vagy a teljes válasz), mezők: id,name,parents,thumbnailLink
//  - prices: { kiegeszitok, vacsora, szertartas, egyeb, ajandek, munkadij, uzemanyag, vegosszeg } – szöveges ársávok
//    (űrlapnál ugyanezek a kulcsok külön mezőként)
//  - prefer / skip: fájlnevek (vesszővel vagy soronként) – kézi képcsere a táblázatból
//  - format: "pdf" (alap) vagy "html" (ellenőrzéshez)
import { timingSafeEqual } from "node:crypto";
import { plan, buildHtml, footerHtml, coupleName } from "./html";

export const runtime = "nodejs";
export const maxDuration = 60;

const parse = (v) => {
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return null; }
};

const tokenOk = (got) => {
  const want = process.env.MAKE_WEBHOOK_TOKEN || "";
  const a = Buffer.from(String(got || "")), b = Buffer.from(want);
  return want.length > 0 && a.length === b.length && timingSafeEqual(a, b);
};

const budapestPlusDays = (days) => {
  const d = new Date(Date.now() + days * 864e5);
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("hu-HU", { timeZone: "Europe/Budapest", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(d).map((x) => [x.type, x.value])
  );
  return `${p.year}. ${p.month}. ${p.day}`;
};

// Csak a Google képszerverei: a thumbnailLink a kérés része, ne lehessen vele más hosztot hívni.
function allowedThumbHost(src) {
  try {
    const u = new URL(src);
    return u.protocol === "https:" && (u.hostname === "googleusercontent.com" || u.hostname.endsWith(".googleusercontent.com"));
  } catch {
    return false;
  }
}

async function fetchThumb(file) {
  if (!file?.thumbnailLink) return null;
  const src = file.thumbnailLink.replace(/=s\d+(-[a-z]+)?$/i, "") + "=s1400";
  if (!allowedThumbHost(src)) return null;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(9000) });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) return null;
    return `data:${type.split(";")[0]};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

async function renderPdf(html, validUntil) {
  const puppeteer = (await import("puppeteer-core")).default;
  let executablePath = process.env.CHROME_PATH;
  let args = ["--no-sandbox"]; // helyi teszt (CHROME_PATH), rootként
  if (!executablePath) {
    const chromium = (await import("@sparticuz/chromium")).default;
    executablePath = await chromium.executablePath();
    args = chromium.args;
  }
  const browser = await puppeteer.launch({ executablePath, args, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: footerHtml(validUntil),
    });
  } finally {
    await browser.close();
  }
}

export async function POST(req) {
  // JSON vagy űrlap (application/x-www-form-urlencoded / multipart) – a Make az utóbbit küldi
  let body;
  try {
    const type = req.headers.get("content-type") || "";
    body = type.includes("form") ? Object.fromEntries(await req.formData()) : await req.json();
  } catch {
    return Response.json({ ok: false, error: "Hibás kérés." }, { status: 400 });
  }
  if (!tokenOk(body.token)) return Response.json({ ok: false, error: "Nincs jogosultság." }, { status: 401 });

  const offer = parse(body.offer);
  if (!offer || !offer.name) return Response.json({ ok: false, error: "Hiányzó ajánlatadat (offer)." }, { status: 422 });

  const filesIn = parse(body.files);
  const files = Array.isArray(filesIn) ? filesIn : Array.isArray(filesIn?.files) ? filesIn.files : [];
  const PRICE_KEYS = ["kiegeszitok", "vacsora", "szertartas", "egyeb", "ajandek", "munkadij", "uzemanyag", "vegosszeg"];
  const prices = parse(body.prices) || Object.fromEntries(PRICE_KEYS.map((k) => [k, String(body[k] ?? "").trim()]));
  const validUntil = String(body.valid_until || "").trim() || budapestPlusDays(14);

  const planned = plan(offer, files, { prefer: body.prefer, skip: body.skip });
  const wanted = [planned.cover, ...planned.sections.flatMap((s) => s.images.map((x) => x.file)), ...planned.upsell.images.map((x) => x.file), ...(planned.mood ? [planned.mood.hero, ...planned.mood.collage] : [])].filter(Boolean);
  const unique = [...new Map(wanted.map((f) => [f.id, f])).values()];
  const thumbs = await Promise.all(unique.map(fetchThumb));
  const imgs = Object.fromEntries(unique.map((f, i) => [f.id, thumbs[i]]).filter(([, v]) => v));

  const html = buildHtml({ offer, planned, imgs, prices, validUntil });
  const used = unique.filter((f) => imgs[f.id]).map((f) => f.name);

  if (body.format === "html") return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });

  try {
    const pdf = await renderPdf(html, validUntil);
    const file = `Ajánlat – ${coupleName(offer.name)}${body.version ? ` – v${body.version}` : ""}.pdf`.replace(/[\\/:*?"<>|]/g, "");
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file)}`,
        "X-Ajanlat-Fajlnev": encodeURIComponent(file),
        "X-Ajanlat-Kepek": encodeURIComponent(used.join(", ")),
        "X-Ajanlat-Ervenyes": encodeURIComponent(validUntil),
      },
    });
  } catch (err) {
    console.error("[ajanlat] PDF hiba", err);
    return Response.json({ ok: false, error: "A PDF elkészítése nem sikerült." }, { status: 500 });
  }
}
