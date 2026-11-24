// Ajánlatgenerátor törzsadatai: szekciók, tételleírások (szövegtár), képtár-mappák.
// A tételnevek egyeznek az űrlap DECOR_GROUPS / GIFTS értékeivel (app/kapcsolat/fields.js).
// A szövegek piszkozatok (v1, 2026-11), Babi saját szavai a minta-ajánlatból, ahol volt ilyen.

// Babi Drive: Weboldal / Ajánlat – Képtár
export const KEPTAR_ID = "1P4HyfDl_BCxEQLN9lRyEqzsS6ms-Wjw6";
export const BORITO_FOLDER = "1Rrlpl7HnFVEzxyWxSrogd2VWeFZyYAyH"; // 06 Ajánlat alapanyag / borító, bemutatkozó képek

// Az ajánlat szekciói, a megjelenés sorrendjében. key = a táblázat ársáv-oszlopának kulcsa.
export const SECTIONS = [
  { key: "kiegeszitok", title: "Virágos kiegészítők", group: "Virágos kiegészítők" },
  { key: "vacsora", title: "Vacsora helyszín", group: "Vacsora helyszín" },
  { key: "szertartas", title: "Szertartás", group: "Szertartás" },
  { key: "egyeb", title: "Egyéb dekorációs pontok", group: "Egyéb dekorációs pontok" },
];

/** Upsell blokk ("Egyéb ajánlat – külön megrendelésre"). A szövegek VÁZLATOK, a végleges szöveg később készül. */
export const UPSELL = {
  accessory: {
    csuklo: { label: "Csuklódísz", requested: "Csuklódísz", folder: "13GnSQ0WfCgoyuNMlmrVM-XAP00dKnYIE", text: "A menyasszonyi csokor virágaival készül." },
    haj: { label: "Hajdísz", folder: "1kWYv8Ut0qKedqHGEjfjwoY4RJhATeslb", text: "A menyasszonyi csokorhoz illő virágokból készül." },
    auto: { label: "Autódekoráció", folder: "1yC2S_GJnLUgLAGPa6cyJd1R55J_XXpAG", text: "Szalagok a visszapillantókra, speciális tartóba rögzített dísz a motorháztetőre.", requested: "Autódekoráció" },
  },
  parents: { label: "Szülőköszöntő", folder: "1GuCcOAQWyxoiMx2DmLUIjH4dDeMFfpZ-", text: "A formáját és a virágokat a konzultáción választjuk ki." },
  bridesmaids: { label: "Koszorúslányok, -fiúk díszei", folder: "1cK1QBo6orX_0B7IbGBPEKj4LELPHqfAO", text: "Koszorúslánycsokor, csuklódísz vagy fiolában készített kitűző." },
  title: "Egyéb ajánlat – külön megrendelésre",
  intro: "Ha a megrendelés mellé még szeretnétek, ezeket külön is elkészítjük.",
};


// tétel → { folder: képtár-mappa ID, label: megjelenő név, text: leírás }
export const ITEMS = {
  // 01 Virágos kiegészítők
  "Menyasszonyi csokor": {
    folder: "1GnXK12tXeK1QxnXnTwKikMrKEb0p_MhD",
    text: "A színvilághoz és a virágkategóriához igazítva készül. Ha van kedvenc képetek, küldjétek el, és ahhoz igazodunk.",
  },
  "Kitűző": { folder: "1KnD256D21kk5R53rY3qnjKp1BnYDzRWA", text: "A menyasszonyi csokorhoz illő virágokkal." },
  "Dobócsokor": { folder: "1pIC5BxRFTWz1xGSE9-bd8d3ML0dRdhig", text: "Kisebb csokor a menyasszonyi csokorhoz illően." },
  "Csuklódísz": { folder: "13GnSQ0WfCgoyuNMlmrVM-XAP00dKnYIE", text: "A menyasszonyi csokor virágaival." },
  "Koszorúslányok / -fiúk díszei": {
    folder: "1cK1QBo6orX_0B7IbGBPEKj4LELPHqfAO",
    label: "Koszorúslányok, -fiúk díszei",
    text: "Koszorúslánycsokor, csuklódísz vagy fiolában készített kitűző.",
  },
  // 02 Vacsora helyszín
  "Vendégasztalok": {
    folder: "1UbYOKhg17r3MJ9Ssjif54QojjgrkrOce",
    text: "Kis vázás, kaspós dekoráció, gyertyás díszítés (főként LED-gyertyával; valódi gyertya a helyszín engedélyétől függ), légies elrendezés, időtálló stílus.",
  },
  "Főasztal": {
    folder: "1W38x9egoTfF5BSyVI_Va-e24PnfOA0E2",
    text: "Gyertyával és dekorelemekkel. Változatok: szálas virágok kis vázákban két oldalt vagy végig az asztalon, tűzött díszek, földön álló díszek az asztal előtt.",
  },
  "Háttérfal": {
    folder: "1RU_GMMa3wH-Sg9zrHbN8Fbhb7oESBAE4",
    text: "Alap háttér legfeljebb 4 m szélességben és 2,5 m magasságban. Kiegészíthető karikával, selyem virágzuhataggal vagy élő zöld növénydekorációval.",
  },
  // 03 Szertartás
  "Boldogságkapu dekorációja": {
    folder: "1RmheHl_aefEHL2DY21iyG6JoWRbo_2VL",
    label: "Boldogságkapu",
    text: "Virágos kompozíció a kapun, kérésre textillel.",
  },
  "Anyakönyvvezető asztalának dekorációja": {
    folder: "1_e7pkq7WjYxvZNd8Au3wiBZV_FqOu4GK",
    label: "Anyakönyvvezető asztala",
    text: "Kis vázás virágdekoráció.",
  },
  "Odavezető út (szalagok a székek oldalán)": {
    folder: "1zfvy-Z0kULTl1aXEeEGZo4ahbq6oQ55H",
    label: "Odavezető út",
    text: "Szalagok a székek oldalán. Kérésre sziromszórt út vagy a széklábakhoz leszúrt virágok.",
  },
  "Kapu bérlése": { folder: "1RmheHl_aefEHL2DY21iyG6JoWRbo_2VL", text: "Több kaputípus közül választhattok." },
  "Székek dekorációja kis virágcsokorral": {
    folder: "1OVH5wasbfAOkBT7735HcrCTH44B0UAyM",
    // az Odavezető út képei a székdíszeknél is használhatók (dokumentumban egy kép csak egyszer szerepel, lásd plan())
    alsoFrom: ["1zfvy-Z0kULTl1aXEeEGZo4ahbq6oQ55H"],
    label: "Székek dekorációja",
    text: "Kis virágcsokor a főszékeken és az odavezető út székein.",
  },
  "Nagyobb virágos dekorációk (földön vagy állványon)": {
    folder: "1UGRdUecIiWI5890B-qMpOHyy6FOLwvle",
    label: "Nagyobb virágos dekorációk",
    text: "Földön vagy állványon, egyedi tervezéssel.",
  },
  "Egyéb szertartásdekoráció": {
    folder: "11ENMlYqkL7wMdlkT1m4dQamr7tfJS_Rv",
    text: "A részleteket a konzultáción egyeztetjük.",
  },
  // 04 Egyéb
  "Templomi dekoráció": {
    folder: "16qdWqdvs52qipFJIK3FfavoGdFUm9zpH",
    text: "A templom szabályaihoz igazított virágdekoráció. A díszítési pontokat a konzultáción egyeztetjük.",
  },
  "Mennyezet fényfüzérezés": { folder: "1aCyfQYPyH-nrdijQd8xHgkyIi1MHLOiu", text: "200 m meleg fényű fényfüzér. Az ár a helyszíntől és a felszerelés nehézségétől függ." },
  "Tábla és tábladekoráció": {
    folder: "17J-XMQkDNK9p3jrVrd0zPPQnieQa2PmR",
    text: "Virágdísszel. A tábla anyagát és szövegét a konzultáción egyeztetjük.",
  },
  "Tükör": { folder: "1V9LAGM--i6c5j1DnjJfQPbEelMEdsCX7", text: "Dekoráció a tükör lábánál, kis vázás dekorelemekkel." },
  "Tükör (virágdísszel)": { folder: "1ZxOnvdWzX5uujQU_gthCxeJ5e6-0Aano", label: "Tükör virágdísszel", text: "Tűzött virágdísz a tükrön vagy a lábánál." },
  "Desszertasztal": { folder: "1fNI2E2zAWl8aUhdCqdFyzUVSzC_TkxTU", text: "Dekorációs táblák és kis vázás dekoráció." },
  "Megemlékező pont": { folder: "1h1D1lctXfmbdI8H_8NjQ4OdemVSXNL9z", text: "Virágdekoráció az emlékezés helyéhez." },
  "Autódekoráció": { folder: "1yC2S_GJnLUgLAGPa6cyJd1R55J_XXpAG", text: "Szalagok a visszapillantókra, speciális tartóba rögzített dísz a motorháztetőre." },
  "Tortavirágok": { folder: "1oJe-Qeyp4GopR4sCeSarzZ4bMKssbd-l", text: "Alap virágos dekoráció. Jellemzően a cukrász biztosítja, ezt érdemes vele egyeztetni." },
  // 05 Köszönőajándék
  "Szülőköszöntő": { folder: "1GuCcOAQWyxoiMx2DmLUIjH4dDeMFfpZ-", text: "A formáját és a virágokat a konzultáción választjuk ki." },
  "Vendégajándék": { folder: "1gRCyHwd1viKl_cr3huRiY6QlxaIoxefe", text: "A formáját és a mennyiségét a konzultáción egyeztetjük." },
};

// Az összes képtár-mappa, amelyet a Make egy Drive API hívással listáz (q: '<id>' in parents or …)
/** Kézzel válogatott, vizuálisan kiemelkedő képek (tétel → fájlnév a tétel mappájában): a "hangulatoldal" készletei.
 *  A kulcs a tétel neve (ITEMS), "Borító" a borító mappa, "Hajdísz" az upsell mappa. */
export const KIEMELT = {
  "Menyasszonyi csokor": "szezonalis_feher-krem-zold_modern_07.jpg",
  "Dobócsokor": "szezonalis_narancs-terrakotta_modern_02.heic",
  "Koszorúslányok / -fiúk díszei": "altalanos_rozsaszin-barack-krem_kerekded_21.jpg",
  "Kitűző": "altalanos_krem-puder-feher_02.jpg",
  "Csuklódísz": "altalanos_bordo-krem-feher_01.jpg",
  "Hajdísz": "altalanos_rozsaszin-barack-lila_31.jpg",
  "Vendégasztalok": "szezonalis_bordo-puder-feher_03.jpg",
  "Főasztal": "szezonalis_bordo-zold-krem_04.jpg",
  "Háttérfal": "szezonalis_feher-rozsaszin-bordo_01.jpg",
  "Boldogságkapu dekorációja": "szezonalis_rozsaszin-lila-feher-barack_09.jpg",
  "Odavezető út (szalagok a székek oldalán)": "altalanos_piros-feher-zold_01.jpg",
  "Székek dekorációja kis virágcsokorral": "altalanos_piros-feher-bordo_04.jpg",
  "Nagyobb virágos dekorációk (földön vagy állványon)": "szezonalis_kek-rozsaszin-feher_23.jpg",
  "Egyéb szertartásdekoráció": "szezonalis_rozsaszin-kek-lila-barack_23.heic",
  "Templomi dekoráció": "altalanos_feher-zold_01.jpg",
  "Tábla és tábladekoráció": "altalanos_barna-feher-zold_01.jpg",
  "Megemlékező pont": "altalanos_feher_01.heic",
  "Tükör": "altalanos_arany-feher-barna_01.jpg",
  "Tükör (virágdísszel)": "altalanos_feher-zold_21.jpg",
  "Autódekoráció": "altalanos_puder-feher-zold_01.jpg",
  "Vendégajándék": "altalanos_zold_21.jpg",
  "Szülőköszöntő": "altalanos_feher-sarga_01.jpg",
  "Borító": "szezonalis_rozsaszin-narancs_05.jpg",
};
/** Teljes oldalra csak ezek a tételek alkalmasak (a kisebb tárgyak, pl. kitűző, tükör, megemlékező pont nem). */
export const KIEMELT_OLDALRA = [
  "Menyasszonyi csokor", "Dobócsokor", "Koszorúslányok / -fiúk díszei", "Vendégasztalok", "Főasztal", "Háttérfal",
  "Boldogságkapu dekorációja", "Odavezető út (szalagok a székek oldalán)", "Nagyobb virágos dekorációk (földön vagy állványon)",
  "Egyéb szertartásdekoráció", "Templomi dekoráció", "Borító",
];

// Veluma Wedding (partner): papíráru-fotók az ajánlat utolsó oldalán.
// Drive: Képtár / 90 Veluma partner (papíráru). Fájlnév: veluma_{tétel}_{színek}_{sorszám}.jpg (a színek a közös színtábla kulcsai).
// A Make Drive-lekérdezésében ennek a mappának is szerepelnie kell, különben a blokk elmarad (kép nélkül nem jelenik meg).
export const VELUMA = {
  folder: "1K3GwRboyXLYtY_XDm34KLDK2pR_18QS3",
  url: "veluma.hu",
  eyebrow: "EGYÜTTMŰKÖDŐ PARTNERÜNK",
  title: "Veluma Wedding",
  lead: "A Veluma Wedding esküvői papíráru-stúdió. Meghívót, ültetőkártyát, menükártyát, asztalszámot és üdvözlőtáblát készít egyedi tervezéssel.",
  items: ["Meghívó", "Ültetési rend", "Ültetőkártya", "Menükártya", "Asztalszám", "Üdvözlőtábla"],
  note: "Az ajánlatunk a dekorációt tartalmazza, a papíráru nem része. Ha papírárut is szeretnétek, a veluma.hu oldalon megnézhetitek a munkáikat, és közvetlenül is megkereshetitek őket.",
  // fájlnév-tétel → képfelirat
  labels: { meghivo: "Meghívó", szett: "Papíráru-szett", ultetokartya: "Ültetőkártya", menukartya: "Menükártya", asztalszam: "Asztalszám", welcome: "Üdvözlőtábla", ultetesrend: "Ültetési rend" },
};

export const ALL_FOLDERS = [...new Set([BORITO_FOLDER, VELUMA.folder, ...Object.values(ITEMS).map((i) => i.folder)])];

export const TEXTS = {
  intro: [
    "Mindenekelőtt szívből gratulálunk nektek!",
    "Az ajánlatban minden tétel szerepel, amelyet az ajánlatkérésben kiválasztottatok, így körülbelüli képet kaptok a költségekről. A tételeknél ársávot adunk meg, a végleges ár a részletek egyeztetése után alakul ki. Az ajánlat bővíthető és alakítható: ha virágosabb díszítést szeretnétek, szívesen tervezünk tovább, de már az alapdekorációnk is felöltözteti a helyszínt és a dekorációs pontokat.",
  ],
  disclaimer: "Ez az ajánlat a megadott adataitok alapján, egyedileg készült, és díjmentes. Az ajánlat nem jelenti az időpont foglalását.",
  consult:
    "Dekorációs ajánlatunk elfogadása után online találkozunk, és egyeztetjük a részleteket. Ezt a dokumentumot közösen töltjük meg képekkel és pontos információkkal. A konzultáció legalább egy óra, díja 5 000 Ft, amelyet megrendelés esetén a végső árból jóváírunk.",
  about: [
    "A megállapodás után fix árral dolgozunk, utólag nem merül fel rejtett költség.",
    "Csapatban dolgozunk, így a dekoráció akkor is elkészül, ha valamelyikünk váratlanul kiesik.",
    "Szerződést kötünk, így mindkét fél elköteleződik az adott napra.",
    "Rugalmasak vagyunk: a megbeszélteken bizonyos kereteken belül később is lehet módosítani.",
    "Mindig 10%-kal több virággal dolgozunk, mint amennyit megbeszéltünk.",
    "A hajnali bontásért nem számolunk fel felárat.",
  ],
  important:
    "A 2027/2028-as esküvői szezonra vonatkozóan kiadott ajánlatok nem jelentik az időpont foglalását. A szabad időpontok száma véges, ezért ha velünk szeretnétek dolgozni, kérjük, minél előbb jelezzetek vissza. Az ajánlatban szereplő ársávok a megküldéstől számított 2 hétig érvényesek. Az ajánlat elkészítése díjmentes, és mindig egyedileg, a megadott információk alapján történik.",
  next:
    "Kérjük, döntésetekről minél előbb tájékoztassatok minket, és akkor is jelezzetek vissza, ha másképp döntötök. Az ajánlat minden esetben rátok szabva készül, így egy rövid válasz nekünk is sokat segít. A folyamatos foglalások miatt előfordulhat, hogy időközben mi is keresünk titeket.",
  work: [
    ["Előkészítés", "A dekoráció és a virágok elkészítése."],
    ["Az esküvő napján", "Helyszíni rakodás, dekorálás, installáció (kb. 5–7 óra, csapattal)."],
    ["Másnap", "Rakodás, bontás, elpakolás (kb. 4–5 óra)."],
  ],
  fuel: "Ráckevéről, két nap oda-vissza, 150 Ft/km",
};

export const CONTACT = {
  phone: "+36 20 775 8226",
  email: "info@babszemviragmuhely.com",
  web: "babszemviragmuhely.com",
  ig: "@babszemviragmuhely",
};
