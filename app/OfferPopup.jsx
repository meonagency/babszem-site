"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./consent.css";
import { CONSENT_EVENT, OFFER_CLOSED, readConsent } from "./consent";
import { photoProps } from "./fotok";
import { useModal } from "./useModal";

const SEEN = "babszem-offer-seen";
const CLOSED = "babszem-offer-closed";
const SKIP = ["/kapcsolat", "/adatkezeles"];
const DELAY = 10000;

/* Személyes ajánlatkérő ablak: a süti-döntés után 10 másodperccel jelenik meg,
   munkamenetenként egyszer. */
export default function OfferPopup() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(CLOSED, "1");
    } catch {}
    window.dispatchEvent(new Event(OFFER_CLOSED));
  };

  useEffect(() => {
    if (SKIP.some((p) => path.startsWith(p))) {
      setOpen(false);
      return;
    }
    let timer;
    const start = () => {
      try {
        if (sessionStorage.getItem(SEEN)) return;
      } catch {}
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          sessionStorage.setItem(SEEN, "1");
        } catch {}
        setOpen(true);
      }, DELAY);
    };
    if (readConsent()) start();
    window.addEventListener(CONSENT_EVENT, start);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, start);
    };
  }, [path]);

  useModal(open, box, close);

  if (!open) return null;
  const img = photoProps("9364", "(min-width: 720px) 300px, 100vw");

  return (
    <div data-overlay-root>
      <div className="op-backdrop" onClick={close}>
        <div
          ref={box}
          className="op-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="op-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="op-photo">
            <img {...img} alt="" loading="eager" decoding="async" />
          </div>
          <div className="op-body">
            <button type="button" className="op-x" aria-label="Bezárás" onClick={close}>×</button>
            <h2 id="op-title">Gratulálunk!</h2>
            <p className="op-lead">Egy gyönyörű nap előtt álltok.</p>
            <p>
              Minden ajánlatkérésre személyes katalógust készítünk nektek, hogy a közös munkát örömmel éljük át.
              Meséljetek az elképzeléseitekről, mi pedig szeretettel összeállítjuk a ti virágaitokat.
            </p>
            <Link href="/kapcsolat" className="op-cta" onClick={close}>Ajánlatot kérünk</Link>
            <button type="button" className="op-later" onClick={close}>Később</button>
          </div>
        </div>
      </div>
    </div>
  );
}
