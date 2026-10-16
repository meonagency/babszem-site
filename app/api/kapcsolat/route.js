import { randomUUID } from "node:crypto";
import {
  INTERESTS, TABLE_LAYOUTS, CHURCH, FLOWER_TYPES, GREENERY, FLOWER_CATEGORIES,
  RENTAL, DELIVERY, GIFTS, DECOR_POINTS, WEDDING,
} from "../../kapcsolat/fields";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  const interest = oneOf(body.interest, INTERESTS.map((i) => i.value));
  const isWedding = interest === WEDDING;

  const data = {
    interest,
    name: clean(body.name, 120),
    email: clean(body.email, 160).toLowerCase(),
    phone: clean(body.phone, 40),
    event_date: clean(body.event_date, 20),
    location: clean(body.location, 200),
    message: cleanLong(body.message),
    consent: body.consent === true,
    page: clean(body.page, 200),
    utm_source: clean(body.utm_source, 100),
    utm_campaign: clean(body.utm_campaign, 100),
  };

  const errors = {};
  if (!interest) errors.interest = "Válaszd ki, miben segíthetünk.";
  if (!data.name) errors.name = "Kérjük, add meg a neved.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Kérjük, adj meg egy érvényes e-mail címet.";
  if (!isWedding && !data.message) errors.message = "Írd le röviden, mire lenne szükséged.";
  if (isWedding && !clean(body.budget)) errors.budget = "Kérjük, adjatok meg egy hozzávetőleges keretet.";
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
        budget: clean(body.budget, 60),
        flower_type: oneOf(body.flower_type, FLOWER_TYPES),
        colors: clean(body.colors, 200),
        greenery: oneOf(body.greenery, GREENERY),
        favorite_flowers: clean(body.favorite_flowers, 300),
        avoid_flowers: clean(body.avoid_flowers, 300),
        flower_category: oneOf(body.flower_category, FLOWER_CATEGORIES),
        decor_points: manyOf(body.decor_points, DECOR_POINTS),
        guest_tables: digits(body.guest_tables),
        head_table: digits(body.head_table),
        rental: oneOf(body.rental, RENTAL),
        delivery: oneOf(body.delivery, DELIVERY),
        gifts: manyOf(body.gifts, GIFTS),
        pinterest: url(body.pinterest),
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

  const payload = {
    event: "contact",
    token,
    id: randomUUID().slice(0, 8).toUpperCase(),
    submitted_at: new Date().toISOString(),
    ...data,
    ...wedding,
  };

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
