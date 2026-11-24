"use client";

import { useEffect } from "react";

/* A látványos belépés célja a sorrend: a lap alatti elemek a görgetéssel
   lágyan jönnek elő. Csökkentett mozgásnál semmi nem rejtődik el. */
export default function RevealInit() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.dataset.rv = "1";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) return;
      el.dataset.rv = "0";
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return null;
}
