"use client";

import { useRef } from "react";
import { VELUMA_SLIDES, velumaImg } from "./veluma";

/* Vízszintes, húzható képsáv (scroll-snap), léptető gombokkal. Automata léptetés nincs. */
export default function PartnerCarousel() {
  const track = useRef(null);

  const step = (dir) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    const w = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * w, behavior: calm ? "auto" : "smooth" });
  };

  return (
    <div className="pc">
      <div className="pc-ctrl">
        <button type="button" className="pc-btn" aria-label="Előző képek" onClick={() => step(-1)}>‹</button>
        <button type="button" className="pc-btn" aria-label="Következő képek" onClick={() => step(1)}>›</button>
      </div>
      <ul className="pc-track" ref={track} tabIndex={0} aria-label="Veluma Wedding papírtermékek">
        {VELUMA_SLIDES.map((s) => (
          <li key={s.id} className="pc-card">
            <figure>
              <div className="pc-img">
                <img
                  {...velumaImg(s.id, "(min-width: 1100px) 26vw, (min-width: 720px) 38vw, 72vw")}
                  alt={s.name}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>
                <strong>{s.name}</strong>
                <span>{s.mat}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
