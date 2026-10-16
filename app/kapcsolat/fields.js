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
export const FLOWER_TYPES = ["Élő", "Száraz", "Selyem", "Vegyes", "Még nem tudjuk"];
export const GREENERY = ["Igen", "Nem", "Mindegy"];
export const FLOWER_CATEGORIES = ["Általános, szezonális", "Prémium", "Még nem tudjuk"];
export const RENTAL = ["Igen", "Nem", "Még nem tudjuk"];
export const DELIVERY = [
  "Elvisszük a műhelyből, magunk dekorálunk",
  "Kérjük a helyszíni dekorálást",
  "Kérjük a helyszíni dekorálást és a másnapi bontást",
  "Még nem tudjuk",
];
export const GIFTS = ["Szülőköszöntő", "Vendégajándék"];

// A félkövér pontok a kérdőívből – a részletek (szalagozás, forma stb.) a konzultáción
export const DECOR_POINTS = [
  "Menyasszonyi csokor",
  "Vőlegény kitűző",
  "Dobócsokor",
  "Vendégasztalok",
  "Főasztal",
  "Kiegészítők (örömszülők, tanúk, koszorúslányok)",
  "Háttérfal",
  "Szertartás helyszíne",
  "Boldogságkapu",
  "Ültető tábla",
  "Üdvözlő tábla",
  "Desszertasztal",
  "Megemlékező sarok",
  "Templom",
  "Autó",
  "Torta",
  "Lógatott díszek",
];

export const COLORS = [
  "fehér", "ekrü", "púder", "rózsaszín", "barack", "terrakotta", "bordó",
  "levendula", "lila", "kék", "zsálya", "zöld", "sárga", "arany", "pasztell", "színes",
];

export const FLOWERS = [
  "rózsa", "peónia", "hortenzia", "szegfű", "dália", "gipszvirág", "eukaliptusz",
  "tulipán", "liliom", "orchidea", "szarkaláb", "boglárka", "szellőrózsa",
  "levendula", "napraforgó", "rezgő", "pampafű",
];

export const WEDDING = "Esküvő";
