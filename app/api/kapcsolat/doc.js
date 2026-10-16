// Esküvői adatlap HTML-ben: a Make ebből készít Google Dokumentumot (Drive konverzió),
// abból PDF-et, és ugyanebből megy a rövid e-mail törzs is.

const GOLD = "#a86d1f";
const INK = "#3a2c1e";
const MUTED = "#7a6a58";
const LINE = "#e4d9c7";

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const show = (v) => (v === "" || v == null ? `<span style="color:${MUTED}">–</span>` : esc(v).replace(/\n/g, "<br>"));

const huDate = (iso) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return iso || "";
  const [y, m, d] = iso.split("-");
  return `${y}. ${m}. ${d}.`;
};

const stamp = () =>
  new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date());

const h2 = (t) =>
  `<h2 style="font-family:Cinzel,Georgia,serif;font-size:14pt;font-weight:normal;color:${GOLD};letter-spacing:1px;margin:22pt 0 6pt">${esc(t)}</h2>`;

const table = (rows) =>
  `<table style="border-collapse:collapse;width:100%">${rows
    .map(
      ([k, v, raw]) =>
        `<tr><td style="width:34%;padding:5pt 8pt;border-bottom:1px solid ${LINE};color:${MUTED};vertical-align:top">${esc(k)}</td>` +
        `<td style="padding:5pt 8pt;border-bottom:1px solid ${LINE};color:${INK};vertical-align:top">${raw && v ? v : show(v)}</td></tr>`
    )
    .join("")}</table>`;

const link = (url) => (url ? `<a href="${esc(url)}" style="color:${GOLD}">${esc(url)}</a>` : "");

/** Mappanév a Drive-on: "Kiss Anna & Nagy Péter – 2027.06.12" */
export function folderName(d) {
  const name = (d.name || "Névtelen").replace(/[\\/:*?"<>|]/g, "").trim();
  const date = d.event_date ? ` – ${d.event_date.replace(/-/g, ".")}` : "";
  return `${name}${date}`.slice(0, 120);
}

export function docHtml(d, decorGroups) {
  const decor = decorGroups.length
    ? decorGroups
        .map(
          (g) =>
            `<p style="margin:8pt 0 2pt;color:${INK}"><b>${esc(g.title)}</b></p>` +
            `<ul style="margin:0 0 4pt 18pt;padding:0">${g.items.map((i) => `<li style="color:${INK}">${esc(i)}</li>`).join("")}</ul>`
        )
        .join("")
    : `<p style="color:${MUTED}">Nem jelöltek meg dekorációs pontot.</p>`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(folderName(d))}</title></head>
<body style="font-family:Jost,Arial,sans-serif;font-size:11pt;color:${INK}">
<p style="font-family:Cinzel,Georgia,serif;font-size:11pt;color:${GOLD};letter-spacing:3px;margin:0">BABSZEM VIRÁGMŰHELY</p>
<h1 style="font-family:Cinzel,Georgia,serif;font-size:22pt;font-weight:normal;color:${INK};margin:6pt 0 2pt">${esc(d.name)}</h1>
<p style="color:${MUTED};margin:0">Esküvői ajánlatkérés · beérkezett: ${esc(stamp())} · azonosító: ${esc(d.id)}</p>

${h2("Elérhetőség")}
${table([
  ["Név", d.name],
  ["E-mail", d.email],
  ["Telefon", d.phone],
])}

${h2("Az esküvő")}
${table([
  ["Időpont", huDate(d.event_date)],
  ["Helyszín", d.location],
  ["Létszám", d.guests ? `${d.guests} fő` : ""],
  ["Asztalok elrendezése", d.table_layout],
  ["Templomi esküvő", d.church],
  ...(d.church === "Igen" ? [["Templom", d.church_address]] : []),
  ["Gondolt keretösszeg", d.budget],
])}

${h2("Virágok")}
${table([
  ["Kategória", d.flower_category],
  ["Prémium virágok", d.premium_flowers],
  ["Színvilág", d.colors],
  ["Zöld levelek", d.greenery],
  ["Kerülendő virágok", d.avoid_flowers],
])}

${h2("Dekoráció")}
${decor}
<p style="margin:0">&nbsp;</p>
${table([
  ["Vendégasztalok száma", d.guest_tables ? `${d.guest_tables} db` : ""],
  ["Főasztal létszáma", d.head_table ? `${d.head_table} fő` : ""],
  ["Helyszíni munka", d.delivery],
  ["Köszönőajándék", d.gifts],
])}

${h2("Inspiráció")}
${table([
  ["Pinterest tábla", link(d.pinterest), true],
  ["Feltöltött képek", d.image_count ? `${d.image_count} db, ebben a mappában` : ""],
])}

${h2("Üzenet")}
<p style="color:${INK}">${show(d.message)}</p>

${h2("Konzultációs jegyzetek")}
<p style="color:${MUTED}">Ide jöhetnek az egyeztetés részletei (szalagozás, formák, méretek, díjak).</p>
<p>&nbsp;</p>
</body></html>`;
}

export function emailHtml(d) {
  const rows = [
    ["Időpont", huDate(d.event_date)],
    ["Helyszín", d.location],
    ["Létszám", d.guests ? `${d.guests} fő` : ""],
    ["Gondolt keret", d.budget],
    ["Virágkategória", d.flower_category],
    ["E-mail", d.email],
    ["Telefon", d.phone],
  ].filter(([, v]) => v);
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:${INK};line-height:1.5">
<p style="margin:0 0 4px;color:${GOLD};letter-spacing:2px;font-size:12px">BABSZEM VIRÁGMŰHELY</p>
<p style="margin:0 0 14px;font-size:18px">Új esküvői ajánlatkérés: <b>${esc(d.name)}</b></p>
<table style="border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:3px 14px 3px 0;color:${MUTED}">${esc(k)}</td><td style="padding:3px 0">${esc(v)}</td></tr>`)
    .join("")}</table>
<p style="margin:16px 0 0">A teljes adatlap PDF-ben csatolva. A szerkeszthető Google Dokumentum és a feltöltött képek a Drive mappában:</p>`;
}
