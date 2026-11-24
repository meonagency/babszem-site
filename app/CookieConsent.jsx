"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./consent.css";
import { announce, OPEN_EVENT, readConsent, saveConsent } from "./consent";
import { useModal } from "./useModal";

/* GDPR-hozzájárulás: középen, elmosott háttérrel, két egyenrangú gombbal.
   Választásig az oldal alatta tovább töltődik (a képek előre betöltődnek). */
export default function CookieConsent() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const box = useRef(null);
  const visible = open && path !== "/adatkezeles";

  useEffect(() => {
    const stored = readConsent();
    if (stored) announce(stored, false);
    else setOpen(true);
    setReady(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  useModal(visible, box);

  /* A döntésig a lusta képeket is elkezdjük letölteni, kis adagokban. */
  useEffect(() => {
    if (!visible) return;
    let timer;
    const start = () => {
      const imgs = [...document.querySelectorAll('img[loading="lazy"]')];
      let i = 0;
      timer = setInterval(() => {
        for (let k = 0; k < 4 && i < imgs.length; k++, i++) imgs[i].loading = "eager";
        if (i >= imgs.length) clearInterval(timer);
      }, 500);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      clearInterval(timer);
      window.removeEventListener("load", start);
    };
  }, [visible]);

  const choose = (choice) => {
    saveConsent(choice);
    setOpen(false);
  };

  if (!ready) return null;

  return (
    <div data-overlay-root>
      {visible && (
        <div className="cc-backdrop">
          <div
            ref={box}
            className="cc-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-title"
            aria-describedby="cc-desc"
            tabIndex={-1}
          >
            <h2 id="cc-title">Süti beállítások</h2>
            <p id="cc-desc">
              Weboldalunk sütiket használ a megfelelő működés biztosításához, valamint hozzájárulás esetén statisztikai
              és marketing célokra. A részleteket az{" "}
              <Link href="/adatkezeles" className="cc-link">Adatkezelési tájékoztatóban</Link> találjátok.
            </p>
            <div className="cc-actions">
              <button type="button" className="cc-btn" onClick={() => choose("all")}>
                Összes elfogadása
              </button>
              <button type="button" className="cc-btn cc-btn--alt" onClick={() => choose("necessary")}>
                Csak a szükségesek elfogadása
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Hivatkozás a láblécbe: újranyitja a beállításokat. */
export function CookieSettingsButton({ className }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Süti beállítások
    </button>
  );
}
