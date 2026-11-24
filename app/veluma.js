export const VELUMA_URL =
  "https://veluma.hu/?utm_source=babszem-viragmuhely&utm_medium=referral&utm_campaign=partner-2026&utm_content=weboldal";

/* Veluma papírtermékek: a képek a public/veluma mappában, 480 és 960 px széles változatban */
export const VELUMA_SLIDES = [
  { id: "piros-boritek", name: "Bordó boríték, citromfa bélés", mat: "Bordó boríték · citromfa mintás borítéklap" },
  { id: "narancs-csipke", name: "Narancs formavágott menetrendkártya", mat: "Formavágott csipke · terrakotta · selyemzsinór" },
  { id: "valogatott-meghivok", name: "Válogatott kollekciók", mat: "Több arculat · különböző borítékok és formák" },
  { id: "menu-papir", name: "Mediterrán terítés", mat: "Papír menü · formavágott citrom ültetőkártya" },
  { id: "textil-welcome-sign", name: "Textil üdvözlőtábla", mat: "Ekrü vászon · selyemszalag" },
  { id: "csipke-ulteto", name: "Formavágott csipke ültetőkártya", mat: "Fehér formavágott keret · arany kalligráfia" },
];

export function velumaImg(id, sizes) {
  return {
    src: `/veluma/${id}-960.webp`,
    srcSet: `/veluma/${id}-480.webp 480w, /veluma/${id}-960.webp 960w`,
    sizes,
    width: 960,
    height: 1200,
  };
}
