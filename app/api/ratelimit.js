// Egyszerű, IP-alapú sebességkorlát (csúszó ablak, memóriában).
// Szerverless környezetben példányonként számol, ezért csak a naiv botok és a véletlen
// túlterhelés ellen véd; az erős védelem a Vercel tűzfal szabálya vagy a Turnstile.

const buckets = new Map();

export function clientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "ismeretlen";
}

// true, ha a kérés még belefér a keretbe
export function allow(req, name, limit, windowMs) {
  const now = Date.now();
  const key = `${name}:${clientIp(req)}`;
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}
