// Az űrlap opciói egy helyen – a szerver oldali ellenőrzés is ezt használja.
import { COLOR_CHIPS } from "../szinek";

export const RENTAL_INTEREST = "Eszközbérlés";
export const GIFT_INTEREST = "Ajándék";
export const GIFT_TYPES = ["Csokor", "Virágbox"];

export const INTERESTS = [
  { value: "Esküvő", hint: "Virág- és esküvői dekoráció" },
  // Fejlesztés alatt: addig nem jelenik meg és nem fogadjuk el (hidden: true)
  { value: RENTAL_INTEREST, hint: "Dekorációs elemek és selyemvirágos dekoráció bérlése", hidden: true },
  { value: GIFT_INTEREST, hint: "Csokor vagy virágbox" },
  { value: "Koszorú", hint: "Ajtó-, adventi és gyászkoszorú" },
  { value: "Egyéb", hint: "Bármi más" },
];

export const PUBLIC_INTERESTS = INTERESTS.filter((i) => !i.hidden);

export const TABLE_LAYOUTS = ["Kerek asztalok", "Hosszú asztalok", "Vegyes", "Még nem tudjuk"];
export const CHURCH = ["Igen", "Nem", "Még nem tudjuk"];
export const GREENERY = ["Igen", "Nem", "Mindegy"];
export const RENTAL = ["Igen", "Nem", "Még nem tudjuk"];
export const GIFTS = ["Szülőköszöntő", "Vendégajándék"];

// Alapból élő virággal dolgozunk; a selyem egy fix, bérelhető dekorációs csomag
export const SILK = ["Igen, érdekel", "Nem, élő virágot szeretnénk", "Még nem tudjuk"];

export const SEASONAL = "Szezonális (hazai virágokkal)";
export const PREMIUM = "Prémium";
export const FLOWER_CATEGORIES = [SEASONAL, PREMIUM, "Még nem tudjuk"];

// Kedvenc virágok a szezonális kategóriához. Nem kötelező és nem kötelezettség: az aktuális szezon kínálatától függ,
// hogy melyik érhető el. A lista a Képtár képein ténylegesen látható virágokra épül.
export const FAVORITE_FLOWERS = ["rózsa", "dália", "szegfű", "liziantusz", "szarkaláb", "hortenzia", "gerbera"];

// Ezeket meg kell rendelni, ezért itt van értelme a választásnak
export const PREMIUM_FLOWERS = ["peónia", "hortenzia", "orchidea", "liliom", "boglárka", "szarkaláb", "kála"];

export const DELIVERY = ["Kérjük a helyszíni dekorálást és a bontást", "Még nem tudjuk"];

// A részletek (szalagozás, forma, méret) a konzultáción
export const DECOR_GROUPS = [
  {
    title: "Virágos kiegészítők",
    items: ["Menyasszonyi csokor", "Kitűző", "Dobócsokor", "Csuklódísz", "Koszorúslányok / -fiúk díszei"],
  },
  {
    title: "Vacsora helyszín",
    items: ["Vendégasztalok", "Főasztal", "Háttérfal"],
  },
  {
    title: "Szertartás",
    items: [
      "Boldogságkapu dekorációja",
      "Anyakönyvvezető asztalának dekorációja",
      "Odavezető út (szalagok a székek oldalán)",
      "Kapu bérlése",
      "Székek dekorációja kis virágcsokorral",
      "Nagyobb virágos dekorációk (földön vagy állványon)",
      "Egyéb szertartásdekoráció",
    ],
  },
  {
    title: "Egyéb dekorációs pontok",
    items: [
      "Templomi dekoráció",
      "Mennyezet fényfüzérezés",
      "Tábla és tábladekoráció",
      "Tükör",
      "Tükör (virágdísszel)",
      "Desszertasztal",
      "Megemlékező pont",
      "Autódekoráció",
      "Tortavirágok",
    ],
  },
];
export const DECOR_POINTS = DECOR_GROUPS.flatMap((g) => g.items);

// A színek a közös színtáblából jönnek (app/szinek.js), így a kérdőív és a képtár fájlnevei nem csúszhatnak szét.
export const COLORS = COLOR_CHIPS;

// Inspirációs képek feltöltése
export const IMAGES = { max: 5, edge: 1400, quality: 0.8, maxBytes: 900_000, totalBytes: 3_500_000 };

export const WEDDING = "Esküvő";

// Papíráru: a Veluma Wedding vállalja (partner). Csak azt kínáljuk, amit a Veluma ténylegesen csinál.
export const PAPER_HELP = ["Igen", "Nem", "Még nem tudjuk"];
export const PAPER_ITEMS = [
  "Meghívó",
  "Ültetési rend",
  "Ültetőkártya",
  "Menükártya",
  "Asztalszám",
  "Információs lap / welcome sign",
];
export const INVITE_TYPES = ["Letisztult", "Komplex", "Még nem tudjuk"];
export const INVITE_PAPERS = ["300 g (prémium akvarellpapír)", "200 g (légiesebb)", "Még nem tudjuk"];
export const PAPER_NOTE_MAX = 600;
export const DIGITAL_INTEREST = ["Igen", "Nem", "Még nem tudjuk"];
export const VELUMA_DIGITAL_URL = "https://veluma.hu/digitalis/signature";
export const BRIDESMAIDS = "Koszorúslányok / -fiúk díszei";

// Csokor formája: az ajánlatgenerátor a képtár fájlnevében szereplő forma-jelölés (kerekded / modern) alapján válogat
export const BOUQUET_ITEMS = ["Menyasszonyi csokor", "Dobócsokor", BRIDESMAIDS];
export const BOUQUET_SHAPES = ["Kerekded", "Modern"];
