/* Süti-hozzájárulás: állapot és események. A választás a böngésző helyi
   tárolójában marad tizenkét hónapig, utána újra megkérdezzük. */
export const CONSENT_KEY = "babszem-consent-v1";
export const CONSENT_EVENT = "babszem:consent";
export const OPEN_EVENT = "babszem:open-consent";
const MAX_AGE = 365 * 24 * 60 * 60 * 1000;

export function readConsent() {
  try {
    const raw = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
    if (!raw || !["all", "necessary"].includes(raw.choice)) return null;
    if (Date.now() - raw.ts > MAX_AGE) return null;
    return raw;
  } catch {
    return null;
  }
}

/* Értesíti az oldalt (és egy későbbi Google Tag Managert, Consent Mode v2) a döntésről. */
export function announce(record, fresh) {
  const granted = record.choice === "all" ? "granted" : "denied";
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push([
      "consent",
      "update",
      { ad_storage: granted, analytics_storage: granted, ad_user_data: granted, ad_personalization: granted },
    ]);
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { ...record, fresh } }));
}

export function saveConsent(choice) {
  const record = { v: 1, choice, ts: Date.now() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  } catch {
    /* privát mód: a döntés csak az oldal bezárásáig él */
  }
  announce(record, true);
  return record;
}

/* Az első (ajánlatkérő) ablak bezárásakor ez az esemény indítja a Veluma ablak időzítőjét */
export const OFFER_CLOSED = "babszem:offer-closed";
