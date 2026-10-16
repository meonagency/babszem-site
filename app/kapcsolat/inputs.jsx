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

/* ---------- Képfeltöltés: kicsinyítés a böngészőben, base64 JPEG ---------- */
async function shrink(file, edge, quality) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    let q = quality;
    let data = canvas.toDataURL("image/jpeg", q);
    while (data.length > 900_000 && q > 0.45) {
      q -= 0.1;
      data = canvas.toDataURL("image/jpeg", q);
    }
    return { data, w, h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImageUpload({ value, onChange, limits, error }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const inputRef = useRef();

  const add = async (files) => {
    setNote("");
    const list = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    const room = limits.max - value.length;
    if (!list.length) return;
    if (list.length > room) setNote(`Legfeljebb ${limits.max} képet tölthettek fel.`);
    setBusy(true);
    const next = [...value];
    for (const file of list.slice(0, room)) {
      try {
        const { data } = await shrink(file, limits.edge, limits.quality);
        const total = next.reduce((s, x) => s + x.data.length, 0) + data.length;
        if (total > limits.totalBytes) {
          setNote("A képek együtt túl nagyok. Próbáljatok kevesebbet feltölteni.");
          break;
        }
        const base = file.name.replace(/\.[^.]+$/, "").replace(/[^\w\-áéíóöőúüűÁÉÍÓÖŐÚÜŰ ]/g, "").trim().slice(0, 40) || "kep";
        next.push({ name: `${base}.jpg`, data });
      } catch {
        setNote(`A(z) ${file.name} nem olvasható be. HEIC helyett JPG vagy PNG képet válasszatok.`);
      }
    }
    onChange(next);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="up">
      {value.length > 0 && (
        <ul className="up-list">
          {value.map((img, i) => (
            <li key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.data} alt="" />
              <button type="button" aria-label="Kép törlése" onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
            </li>
          ))}
        </ul>
      )}
      {value.length < limits.max && (
        <label className={`up-drop${busy ? " busy" : ""}`}>
          <input ref={inputRef} type="file" accept="image/*" multiple disabled={busy} onChange={(e) => add(e.target.files)} />
          <span>{busy ? "Képek előkészítése…" : `Képek kiválasztása (${value.length} / ${limits.max})`}</span>
        </label>
      )}
      {(note || error) && <span className="cf-error" role="alert">{error || note}</span>}
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
