// Formázók és ellenőrzők – a kliens és a szerver is ezt használja.

/** Magyar telefonszám egységes alakra: +36 30 123 4567 / +36 1 234 5678. Érvénytelennél null. */
export function formatPhone(raw) {
  if (!raw) return "";
  let d = String(raw).replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("06")) d = "36" + d.slice(2);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (/^(20|30|31|50|70|1)\d+$/.test(d) && d.length <= 9) d = "36" + d;
  d = d.replace(/\D/g, "");

  if (d.startsWith("36")) {
    const n = d.slice(2);
    if (/^1\d{7}$/.test(n)) return `+36 1 ${n.slice(1, 4)} ${n.slice(4)}`;
    if (/^\d{8,9}$/.test(n)) {
      const area = n.slice(0, 2);
      const rest = n.slice(2);
      return rest.length === 7
        ? `+36 ${area} ${rest.slice(0, 3)} ${rest.slice(3)}`
        : `+36 ${area} ${rest.slice(0, 3)} ${rest.slice(3)}`;
    }
    return null;
  }
  // Külföldi szám: + és 8–15 számjegy
  if (/^\d{8,15}$/.test(d)) return `+${d}`;
  return null;
}

/** 500000 → "500 000" */
export function formatMoney(raw) {
  const d = String(raw || "").replace(/\D/g, "").replace(/^0+/, "").slice(0, 9);
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
export const moneyValue = (formatted) => Number(String(formatted || "").replace(/\D/g, "")) || 0;

const DOMAINS = ["gmail.com", "freemail.hu", "citromail.hu", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "t-online.hu", "upcmail.hu"];

function distance(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return m[a.length][b.length];
}

/** Gépelési hiba gyanú: "anna@gmial.com" → "anna@gmail.com" */
export function emailSuggestion(email) {
  const [user, domain] = String(email || "").toLowerCase().trim().split("@");
  if (!user || !domain || DOMAINS.includes(domain)) return null;
  let best = null;
  for (const d of DOMAINS) {
    const dist = distance(domain, d);
    if (dist > 0 && dist <= 2 && (!best || dist < best.dist)) best = { d, dist };
  }
  return best ? `${user}@${best.d}` : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** YYYY-MM-DD, ma vagy később, legfeljebb 4 év múlva */
export function validFutureDate(v) {
  if (!v) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + "T12:00:00");
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setFullYear(max.getFullYear() + 4);
  return d >= today && d <= max;
}

export function todayISO(offsetYears = 0) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + offsetYears);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const inRange = (v, min, max) => {
  if (v === "" || v == null) return true;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max;
};

export const LIMITS = {
  guests: [1, 1000],
  guest_tables: [1, 200],
  head_table: [1, 80],
  budget_min: 10000,
};
