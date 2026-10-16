"use client";

import { useEffect, useId, useRef, useState } from "react";

/* ---------- Helykereső mező (Google Places, kulcs nélkül sima mező) ---------- */
export function LocationInput({ value, onChange, kind = "venue", placeholder, autoComplete = "off" }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [enabled, setEnabled] = useState(true);
  const session = useRef("");
  const timer = useRef();
  const listId = useId();

  const newSession = () => {
    session.current =
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const query = (q) => {
    clearTimeout(timer.current);
    if (!enabled || q.trim().length < 3) {
      setItems([]);
      setOpen(false);
      return;
    }
    if (!session.current) newSession();
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places?kind=${kind}&s=${session.current}&q=${encodeURIComponent(q)}`
        );
        if (res.status === 204) return setEnabled(false); // nincs kulcs
        const data = await res.json();
        setItems(data.items || []);
        setOpen((data.items || []).length > 0);
        setActive(-1);
      } catch {
        setItems([]);
      }
    }, 300);
  };

  const choose = (item) => {
    onChange(item.value);
    setOpen(false);
    setItems([]);
    session.current = ""; // a kiválasztás lezárja a munkamenetet
  };

  const onKey = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="loc">
      <input
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(e) => {
          onChange(e.target.value);
          query(e.target.value);
        }}
        onKeyDown={onKey}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => items.length && setOpen(true)}
      />
      {open && (
        <ul className="loc-list" id={listId} role="listbox">
          {items.map((it, i) => (
            <li
              key={it.id}
              role="option"
              aria-selected={i === active}
              className={i === active ? "on" : ""}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(it);
              }}
            >
              <strong>{it.main}</strong>
              {it.secondary && <span>{it.secondary}</span>}
            </li>
          ))}
          <li className="loc-credit" aria-hidden="true">Google</li>
        </ul>
      )}
    </div>
  );
}

/* ---------- Címke-választó: javasolt elemek + saját ---------- */
export function TagPicker({ options, value, onChange, placeholder = "Egyéb, vesszővel elválasztva" }) {
  const [extra, setExtra] = useState("");
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  const addExtra = () => {
    const parts = extra
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .filter((s) => !value.includes(s));
    if (parts.length) onChange([...value, ...parts]);
    setExtra("");
  };
  const custom = value.filter((v) => !options.includes(v));
  return (
    <div className="tags">
      <div className="cf-checks">
        {[...options, ...custom].map((o) => (
          <button
            type="button"
            key={o}
            className={`cf-chip${value.includes(o) ? " on" : ""}`}
            aria-pressed={value.includes(o)}
            onClick={() => toggle(o)}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="tags-add">
        <input
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addExtra();
            }
          }}
          onBlur={addExtra}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
