// Megszólítás az ajánlat elején: két keresztnévnél "Kedves Eszter és Áron!" (nő elöl, férfi hátul),
// egyébként "Kedves Jegyespár!". A névsorrend az űrlapon vegyes (családnév elöl is lehet), ezért a keresztnév
// a tag utolsó szava. Ismeretlen vagy azonos nemű nevek esetén a megadott sorrend marad.

const NOK = new Set(
  `ágnes ágota adrienn alexandra andrea anett anna anikó barbara beatrix beáta bernadett bettina bianka blanka boglárka borbála brigitta cecília cintia csenge csilla dalma diána dominika dóra dorina dorka dorottya edina edit emese emőke enikő erika eszter eszti éva evelin fanni flóra fruzsina gabriella gréta gyöngyi györgyi hajnalka hanna henrietta ibolya ildikó ilona imola irén janka jázmin johanna jolán judit júlia kamilla karina kata katalin kinga kitti klára klaudia kriszta krisztina larissa laura lea lenke lili lilla lívia lola luca lujza margit mária marianna martina melinda mercédesz mirjam mónika nelli niki nikolett nina noémi nóra olga orsolya panna patrícia petra piroska rebeka renáta réka rita róza rozália sára szabina szandra szilvia szimonetta szonja tamara tekla teréz tímea tünde vanda vera veronika viktória viola virág vivien zita zoé zora zsanett zsófia zsuzsa zsuzsanna`.split(" ")
);
const FERFIAK = new Set(
  `ádám ákos álmos árpád áron albert andris andrás armand attila balázs bálint barnabás béla bence bendegúz benedek benjámin bertalan botond csaba csanád csongor dániel dávid dénes dezső dominik domonkos dorián ede elemér endre erik ferenc feri fülöp gábor gellért gergely gergő géza györgy gyula gyuri hunor huba imre iván istván jakab jános józsef kálmán károly kende kevin koppány kornél kristóf krisztián laci lajos lászló lázár leó levente lőrinc marcell márk márton máté mátyás mihály miklós milán mór nándor nimród noel norbert olivér oszkár ottó pál patrik péter peti pisti radó rajmund richárd ricsi róbert roland sándor sebastian simon soma szabolcs szilárd tamás teodor tibor tódor tomi tomás vilmos viktor zalán zétény zoltán zsigmond zsolt zsombor`.split(" ")
);

const kisbetu = (s) => s.toLocaleLowerCase("hu-HU");

/** Keresztnevek a megadott névből; legfeljebb kettő, egyébként üres lista. */
export function keresztnevek(nev) {
  const reszek = String(nev || "")
    .split(/\s*(?:,|&|\+|(?<!\p{L})és(?!\p{L}))\s*/iu)
    .map((r) => r.trim())
    .filter(Boolean);
  if (reszek.length !== 2) return [];
  return reszek.map((r) => r.split(/\s+/).pop().replace(/[^\p{L}-]/gu, ""));
}

export function megszolitas(nev) {
  const nevek = keresztnevek(nev);
  if (nevek.length !== 2 || nevek.some((n) => !n)) return "Kedves Jegyespár!";
  let [a, b] = nevek;
  const nok = nevek.map((n) => NOK.has(kisbetu(n)));
  const ferfiak = nevek.map((n) => FERFIAK.has(kisbetu(n)));
  // férfi elöl, nő hátul: csak akkor cserélünk, ha az első férfi (vagy nem nő), a második nő (vagy nem férfi)
  const elsoFerfi = ferfiak[0] || (!nok[0] && nok[1]);
  const masodikNo = nok[1] || (!ferfiak[1] && ferfiak[0]);
  if (elsoFerfi && masodikNo && !(nok[0] && !ferfiak[0])) [a, b] = [b, a];
  return `Kedves ${a} és ${b}!`;
}
