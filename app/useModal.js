"use client";

import { useEffect } from "react";

/* Felugró ablakok közös viselkedése: görgetészár, a háttér inaktív, fókuszcsapda,
   Esc (ha engedélyezett), a fókusz visszaadása bezáráskor. */
export function useModal(active, ref, onEscape) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const prevFocus = document.activeElement;

    const marked = [];
    for (const el of document.body.children) {
      if (el.hasAttribute("data-overlay-root") || el.tagName === "SCRIPT") continue;
      if (!el.inert) {
        el.inert = true;
        marked.push(el);
      }
    }
    ref.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      const box = ref.current;
      if (!box) return;
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [...box.querySelectorAll('a[href], button:not([disabled])')];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const here = document.activeElement;
      if (e.shiftKey && (here === first || here === box)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && here === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
      marked.forEach((el) => (el.inert = false));
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
}
