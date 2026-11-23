// Megszólítás az ajánlat elején: két keresztnévnél "Kedves Eszter és Áron!" abban a sorrendben, ahogy a pár
// megadta (az űrlap két kötelező keresztnév-mezőt kér), egyébként "Kedves Jegyespár!".

/** Régebbi beküldésekhez: keresztnevek a közös névmezőből. A családnév elöl is állhat, ezért a tag utolsó szava. */
export function keresztnevek(nev) {
  const reszek = String(nev || "")
    .split(/\s*(?:,|&|\+|(?<!\p{L})és(?!\p{L}))\s*/iu)
    .map((r) => r.trim())
    .filter(Boolean);
  if (reszek.length !== 2) return [];
  return reszek.map((r) => r.split(/\s+/).pop().replace(/[^\p{L}-]/gu, ""));
}

export function megszolitas(nev, elso, masodik) {
  const a = String(elso || "").trim();
  const b = String(masodik || "").trim();
  if (a && b) return `Kedves ${a} és ${b}!`;
  const nevek = keresztnevek(nev);
  if (nevek.length === 2 && nevek.every(Boolean)) return `Kedves ${nevek[0]} és ${nevek[1]}!`;
  return "Kedves Jegyespár!";
}
