"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./consent.css";
import { CONSENT_EVENT, OFFER_CLOSED, readConsent } from "./consent";
import { VELUMA_URL, velumaImg } from "./veluma";
import { useModal } from "./useModal";

const SEEN = "babszem-partner-seen";
const CLOSED = "babszem-offer-closed";
const SKIP = ["/adatkezeles"];
const AFTER_OFFER = 6000; // az ajánlatkérő ablak bezárása után
const AFTER_CONSENT = 10000; // a kapcsolat oldalon az első ablak helyett

/* Veluma ablak: a főoldalon az ajánlatkérő ablak bezárása után 6 másodperccel,
   a kapcsolat oldalon annak helyett, a süti-döntés után 10 másodperccel. Munkamenetenként egyszer. */
export default function PartnerPopup() {
  const path = usePathname();
  const onContact = path.startsWith("/kapcsolat");
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (SKIP.some((p) => path.startsWith(p))) {
      setOpen(false);
      return;
    }
    let timer;
    const seen = () => {
      try {
        return !!sessionStorage.getItem(SEEN);
      } catch {
        return false;
      }
    };
    const arm = (ms) => {
      if (seen()) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          sessionStorage.setItem(SEEN, "1");
        } catch {}
        setOpen(true);
      }, ms);
    };
    const eventName = onContact ? CONSENT_EVENT : OFFER_CLOSED;
    const ms = onContact ? AFTER_CONSENT : AFTER_OFFER;
    const onEvent = () => arm(ms);
    let offerClosed = false;
    try {
      offerClosed = !!sessionStorage.getItem(CLOSED);
    } catch {}
    if (readConsent() && (onContact || offerClosed)) arm(ms);
    window.addEventListener(eventName, onEvent);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(eventName, onEvent);
    };
  }, [path, onContact]);

  useModal(open, box, close);

  if (!open) return null;
  const img = velumaImg("valogatott-meghivok", "(min-width: 720px) 300px, 100vw");

  return (
    <div data-overlay-root>
      <div className="op-backdrop" onClick={close}>
        <div
          ref={box}
          className="op-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pp-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="op-photo">
            <img {...img} alt="Veluma Wedding meghívók és borítékok" loading="eager" decoding="async" />
          </div>
          <div className="op-body">
            <button type="button" className="op-x" aria-label="Bezárás" onClick={close}>×</button>
            <span className="vl pp-logo" role="img" aria-label="Veluma Wedding" />
            <h2 id="pp-title">Készül már a meghívótok?</h2>
            <p>
              Ha a meghívó és a papírdekor még nincs kész, egy színvilágban kezdhetjük. A Babszem Virágműhely és a
              Veluma Wedding együtt dolgoznak, és minden közös esküvőhöz egyedi elemek készülnek.
            </p>
            {onContact ? (
              <a href={VELUMA_URL} className="op-cta" target="_blank" rel="noopener" onClick={close}>
                Veluma megtekintése
              </a>
            ) : (
              <Link href="/kapcsolat" className="op-cta" onClick={close}>Ajánlatot kérünk</Link>
            )}
            <button type="button" className="op-later" onClick={close}>Később</button>
          </div>
        </div>
      </div>
    </div>
  );
}
