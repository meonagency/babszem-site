import { randomUUID } from "node:crypto";
import {
  PUBLIC_INTERESTS, TABLE_LAYOUTS, CHURCH, SILK, GREENERY, FLOWER_CATEGORIES, SEASONAL,
  PREMIUM_FLOWERS, RENTAL, GIFTS, DECOR_GROUPS, IMAGES, WEDDING,
  RENTAL_INTEREST, GIFT_INTEREST, GIFT_TYPES, BRIDESMAIDS,
} from "../../kapcsolat/fields";
import { docHtml, emailHtml, folderName } from "./doc";
import { formatPhone, formatMoney, moneyValue, EMAIL_RE, validFutureDate, inRange, LIMITS } from "../../kapcsolat/format";

// Tömb vagy vesszős szöveg → "a, b, c" (szabad bevitel is megengedett, rövidítve)
const tagList = (v, max = 300) => {
  const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  return arr
    .map((x) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim().slice(0, 40) : ""))
    .filter(Boolean)
    .slice(0, 20)
    .join(", ")
    .slice(0, max);
};

const clean = (v, max = 300) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
const cleanLong = (v, max = 3000) =>
  typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
const oneOf = (v, list) => (list.includes(v) ? v : "");
const manyOf = (v, list) =>
  Array.isArray(v) ? v.filter((x) => list.includes(x)).join(", ") : "";
const digits = (v) => clean(v, 6).replace(/[^\d]/g, "");
const url = (v) => {
  const s = clean(v, 500);
  return /^https?:\/\//i.test(s) ? s : s ? `https://${s}` : "";
};

// Dekorációs pontok csoportonként: "Szertartás: Boldogságkapu, Odavezető út | …"
const withCount = (item, count) => (item === BRIDESMAIDS && count ? `${item} (${count} db)` : item);

const decorList = (v, count) => {
  const picked = Array.isArray(v) ? v : [];
  return DECOR_GROUPS.map((g) => {
    const items = g.items.filter((i) => picked.includes(i)).map((i) => withCount(i, count));
    return items.length ? `${g.title}: ${items.join(", ")}` : "";
  })
    .filter(Boolean)
    .join(" | ");
};

const decorGroups = (v, count) => {
  const picked = Array.isArray(v) ? v : [];
  return DECOR_GROUPS.map((g) => ({ title: g.title, items: g.items.filter((i) => picked.includes(i)).map((i) => withCount(i, count)) })).filter(
    (g) => g.items.length
  );
};

// Képek: legfeljebb 5 db base64 JPEG/PNG/WebP, méretkorláttal
const DATA_URL = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/;
const imageList = (v) => {
  if (!Array.isArray(v)) return { images: [] };
  if (v.length > IMAGES.max) return { error: `Legfeljebb ${IMAGES.max} képet tölthettek fel.` };
  const images = [];
  let total = 0;
  for (const [i, img] of v.entries()) {
    const m = typeof img?.data === "string" ? img.data.match(DATA_URL) : null;
    if (!m) return { error: "Az egyik kép formátuma nem megfelelő." };
    if (m[2].length > IMAGES.maxBytes) return { error: "Az egyik kép túl nagy." };
    total += m[2].length;
    const ext = m[1] === "jpeg" ? "jpg" : m[1];
    const base = clean(img.name, 60).replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]/g, "") || "kep";
    images.push({ name: `${i + 1}-${base}.${ext}`, data: m[2] });
  }
  if (total > IMAGES.totalBytes) return { error: "A képek együtt túl nagyok." };
  return { images };
};

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Hibás kérés." }, { status: 400 });
  }

  // Honeypot: emberek nem töltik ki
  if (clean(body.hp_x9)) {
    console.warn("[kapcsolat] honeypot – beküldés eldobva");
    return Response.json({ ok: true });
  }

  const baseInterest = oneOf(body.interest, PUBLIC_INTERESTS.map((i) => i.value));
  const isWedding = baseInterest === WEDDING;
  const giftType = baseInterest === GIFT_INTEREST ? oneOf(body.gift_type, GIFT_TYPES) : "";
  const interest = giftType ? `${GIFT_INTEREST} – ${giftType}` : baseInterest;

  const message = cleanLong(body.message);

  const data = {
    interest,
    name: clean(body.name, 120),
    email: clean(body.email, 160).toLowerCase(),
    phone: clean(body.phone, 40) ? formatPhone(clean(body.phone, 40)) : "",
    event_date: clean(body.event_date, 10),
    location: clean(body.location, 200),
    message,
    consent: body.consent === true,
    page: clean(body.page, 200),
    utm_source: clean(body.utm_source, 100),
    utm_campaign: clean(body.utm_campaign, 100),
  };

  const errors = {};
  if (!interest) errors.interest = "Válaszd ki, miben segíthetünk.";
  if (data.phone === null) errors.phone = "Ellenőrizd a telefonszámot (pl. +36 30 123 4567).";
  if (!validFutureDate(data.event_date)) errors.event_date = "Válassz mai vagy későbbi dátumot.";
  if (data.name.length < 2) errors.name = "Kérjük, add meg a neved.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Kérjük, adj meg egy érvényes e-mail címet.";
  if (baseInterest === GIFT_INTEREST && !giftType) errors.gift_type = "Válaszd ki, hogy csokorról vagy virágboxról van szó.";
  if (!isWedding && !data.message) errors.message = "Írd le röviden, mire lenne szükséged.";
  if (isWedding) {
    if (data.location.length < 2) errors.location = "Kérjük, adjátok meg az esküvő helyszínét.";
    if (body.church === "Igen" && clean(body.church_address, 200).length < 2) errors.church_address = "Kérjük, adjátok meg a templom helyszínét.";
    if (moneyValue(body.budget) < LIMITS.budget_min) errors.budget = "A minimális keretösszeg 100 000 Ft.";
    if (!inRange(digits(body.guests), ...LIMITS.guests)) errors.guests = "Ellenőrizd a létszámot.";
    if (!inRange(digits(body.guest_tables), ...LIMITS.guest_tables)) errors.guest_tables = "Ellenőrizd az asztalszámot.";
    if (!inRange(digits(body.head_table), ...LIMITS.head_table)) errors.head_table = "Ellenőrizd a főasztal létszámát.";
  }
  const { images, error: imageError } = isWedding ? imageList(body.images) : { images: [] };
  if (imageError) errors.images = imageError;
  if (!data.consent) errors.consent = "Az adatkezelés elfogadása nélkül nem tudunk válaszolni.";
  if (Object.keys(errors).length) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  const wedding = isWedding
    ? {
        guests: digits(body.guests),
        table_layout: oneOf(body.table_layout, TABLE_LAYOUTS),
        church: oneOf(body.church, CHURCH),
        church_address: body.church === "Igen" ? clean(body.church_address, 200) : "",
        budget: `${formatMoney(body.budget)} Ft`,
        colors: tagList(body.colors, 200),
        greenery: oneOf(body.greenery, GREENERY),
        premium_flowers:
          body.flower_category === SEASONAL ? "" : manyOf(body.premium_flowers, PREMIUM_FLOWERS),
        avoid_flowers: clean(body.avoid_flowers, 200),
        flower_category: oneOf(body.flower_category, FLOWER_CATEGORIES),
        decor_points: decorList(body.decor_points, digits(body.bridesmaids)),
        decor_groups: decorGroups(body.decor_points, digits(body.bridesmaids)),
        guest_tables: digits(body.guest_tables),
        head_table: digits(body.head_table),
        delivery: "Helyszíni dekorálás + bontás",
        gifts: manyOf(body.gifts, GIFTS),
        pinterest: url(body.pinterest),
        image_count: images.length,
        images,
      }
    : {};

  const webhook = process.env.MAKE_WEBHOOK_URL;
  const token = process.env.MAKE_WEBHOOK_TOKEN;
  if (!webhook || !token) {
    console.error("[kapcsolat] Hiányzó MAKE_WEBHOOK_URL vagy MAKE_WEBHOOK_TOKEN");
    return Response.json(
      { ok: false, error: "Az üzenetküldés most nem elérhető. Írj nekünk e-mailben." },
      { status: 500 }
    );
  }

  const { decor_groups, ...weddingFields } = wedding;
  // Eszközbérlésnél két külön mező: a napló U és AD oszlopába kerül
  if (baseInterest === RENTAL_INTEREST) {
    weddingFields.silk_rental = oneOf(body.silk_rental, SILK);
    weddingFields.rental = oneOf(body.rental, RENTAL);
  }
  const payload = {
    event: "contact",
    token,
    id: randomUUID().slice(0, 8).toUpperCase(),
    submitted_at: new Date().toISOString(),
    ...data,
    image_count: 0,
    images: [],
    ...weddingFields,
  };
  if (isWedding) {
    payload.folder_name = folderName(payload);
    payload.doc_html = docHtml(payload, decor_groups);
    payload.email_html = emailHtml(payload);
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Make webhook ${res.status}`);
  } catch (err) {
    console.error("[kapcsolat]", err);
    return Response.json(
      { ok: false, error: "Nem sikerült elküldeni. Próbáld újra, vagy írj nekünk e-mailben." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
