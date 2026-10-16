// Az űrlap opciói egy helyen – a szerver oldali ellenőrzés is ezt használja.

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

// Csak inspiráció, nem választható – a virágműhelyünk a szezon kínálatából dolgozik
export const SEASONAL_EXAMPLES = ["rózsa", "szegfű", "dália", "szellőrózsa", "rezgő", "tulipán", "eukaliptusz"];

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
    items: ["Boldogságkapu", "Anyakönyvvezető asztala", "Odavezető út", "Egyéb dekoráció"],
  },
  {
    title: "Egyéb dekorációs pontok",
    items: [
      "Templomi dekoráció",
      "Mennyezet fényfüzérezés",
      "Tábla",
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

export const COLORS = [
  "fehér", "ekrü", "púder", "rózsaszín", "barack", "terrakotta", "bordó",
  "levendula", "lila", "kék", "zsálya", "zöld", "sárga", "arany", "pasztell", "színes",
];

// Inspirációs képek feltöltése
export const IMAGES = { max: 5, edge: 1400, quality: 0.8, maxBytes: 900_000, totalBytes: 3_500_000 };

export const WEDDING = "Esküvő";
export const BRIDESMAIDS = "Koszorúslányok / -fiúk díszei";
