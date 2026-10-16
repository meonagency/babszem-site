// Az űrlap opciói egy helyen – a szerver oldali ellenőrzés is ezt használja.

export const INTERESTS = [
  { value: "Esküvő", hint: "Virág- és esküvői dekoráció" },
  { value: "Csokor", hint: "Alkalmi és ajándékcsokrok" },
  { value: "Virágbox", hint: "Dobozos kompozíciók" },
  { value: "Koszorú", hint: "Ajtó-, adventi és gyászkoszorú" },
  { value: "Eszközbérlés", hint: "Dekorációs elemek bérlése" },
  { value: "Egyéb", hint: "Bármi más" },
];

export const TABLE_LAYOUTS = ["Kerek asztalok", "Hosszú asztalok", "Vegyes", "Még nem tudjuk"];
export const CHURCH = ["Igen", "Nem", "Még nem tudjuk"];
export const GREENERY = ["Igen", "Nem", "Mindegy"];
export const RENTAL = ["Igen", "Nem", "Még nem tudjuk"];
export const GIFTS = ["Szülőköszöntő", "Vendégajándék"];

// Alapból élő virággal dolgozunk; a selyem egy fix, bérelhető dekorációs csomag
export const SILK = ["Igen, érdekel", "Nem, élő virágot szeretnénk", "Még nem tudjuk"];

export const SEASONAL = "Szezonális (általános)";
export const PREMIUM = "Prémium";
export const FLOWER_CATEGORIES = [SEASONAL, PREMIUM, "Még nem tudjuk"];

// Csak inspiráció, nem választható – a virágkötő a szezon kínálatából dolgozik
export const SEASONAL_EXAMPLES = ["rózsa", "szegfű", "dália", "szellőrózsa", "gipszvirág", "rezgő", "tulipán", "eukaliptusz"];

// Ezeket meg kell rendelni, ezért itt van értelme a választásnak
export const PREMIUM_FLOWERS = ["peónia", "hortenzia", "orchidea", "liliom", "boglárka", "szarkaláb", "kála"];

export const DELIVERY = ["Kérjük a helyszíni dekorálást és a bontást", "Még nem tudjuk"];

// A részletek (szalagozás, forma, méret) a konzultáción
export const DECOR_GROUPS = [
  {
    title: "Virágos kiegészítők",
    items: ["Menyasszonyi csokor", "Dobócsokor", "Kitűző", "Csuklódísz", "Koszorúslányok / -fiúk díszei"],
  },
  {
    title: "Vacsora helyszín",
    items: ["Vendégasztalok", "Főasztal", "Háttérfal"],
  },
  {
    title: "Szertartás",
    items: ["Boldogságkapu", "Anyakönyvvezető asztala", "Odavezető út"],
  },
  {
    title: "Egyéb dekorációs pontok",
    items: [
      "Templomi dekoráció",
      "Mennyezet fényfüzérezés",
      "Tábla",
      "Tükör dekoráció (bérelhető elemekkel)",
      "Desszertasztal",
      "Megemlékező pont",
      "Autódekoráció",
      "Tortavirágok",
    ],
  },
];
export const DECOR_POINTS = DECOR_GROUPS.flatMap((g) => g.items);

export const COLORS = [
  "fehér", "ekrü", "púder", "rózsaszín", "barack", "terrakotta", "bordó",
  "levendula", "lila", "kék", "zsálya", "zöld", "sárga", "arany", "pasztell", "színes",
];

// Inspirációs képek feltöltése
export const IMAGES = { max: 5, edge: 1400, quality: 0.8, maxBytes: 900_000, totalBytes: 3_500_000 };

export const WEDDING = "Esküvő";
