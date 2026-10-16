"use client";

import { useState } from "react";
import {
  INTERESTS, TABLE_LAYOUTS, CHURCH, FLOWER_TYPES, GREENERY, FLOWER_CATEGORIES,
  RENTAL, DELIVERY, GIFTS, DECOR_POINTS, WEDDING,
} from "./fields";

const INITIAL = {
  interest: "",
  name: "", email: "", phone: "", event_date: "", location: "", message: "",
  consent: false, hp_x9: "",
  guests: "", table_layout: "", church: "", church_address: "", budget: "",
  flower_type: "", colors: "", greenery: "", favorite_flowers: "", avoid_flowers: "",
  flower_category: "", decor_points: [], guest_tables: "", head_table: "",
  rental: "", delivery: "", gifts: [], pinterest: "",
};

const WEDDING_STEPS = ["Alapok", "Virágok", "Dekoráció", "Elérhetőség"];

export default function ContactForm() {
  const [f, setF] = useState(INITIAL);
  const [step, setStep] = useState(0); // 0 = érdeklődés választása
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [serverError, setServerError] = useState("");

  const isWedding = f.interest === WEDDING;
  const steps = isWedding ? WEDDING_STEPS : ["Részletek"];
  const lastStep = steps.length;

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };
  const pick = (k, v) => setF((p) => ({ ...p, [k]: p[k] === v ? "" : v }));
  const toggle = (k, v) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const choose = (v) => {
    setF((p) => ({ ...p, interest: v }));
    setStep(1);
    setErrors({});
  };

  const validateContact = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Kérjük, add meg a neved.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Kérjük, adj meg egy érvényes e-mail címet.";
    if (!isWedding && !f.message.trim()) e.message = "Írd le röviden, mire lenne szükséged.";
    if (!f.consent) e.consent = "Az adatkezelés elfogadása nélkül nem tudunk válaszolni.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (isWedding && step === 1 && !f.budget.trim()) {
      setErrors((p) => ({ ...p, budget: "Kérjük, adjatok meg egy hozzávetőleges keretet." }));
      return;
    }
    setStep((s) => Math.min(s + 1, lastStep));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (step < lastStep) return next();
    if (!validateContact()) return;
    setStatus("sending");
    setServerError("");
    const qs = new URLSearchParams(window.location.search);
    try {
      const res = await fetch("/api/kapcsolat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          page: window.location.pathname,
          utm_source: qs.get("utm_source") || "",
          utm_campaign: qs.get("utm_campaign") || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (data.errors) setErrors(data.errors);
      setServerError(data.error || "Valami hiba történt. Ellenőrizd a mezőket.");
      setStatus("error");
    } catch {
      setServerError("Nem sikerült elküldeni. Próbáld újra, vagy írj nekünk e-mailben.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="form-done" role="status">
        <h2>{isWedding ? "Köszönjük, és gratulálunk!" : "Köszönjük az üzeneted!"}</h2>
        <p>
          Megkaptuk, hamarosan személyesen jelentkezünk.
          {isWedding && " Ha közben inspirációs képeket gyűjtötök, azokat is szívesen látjuk."}
        </p>
      </div>
    );
  }

  return (
    <form className="cf" onSubmit={submit} noValidate>
      {/* Honeypot */}
      <div className="hp" aria-hidden="true">
        <label>Ezt a mezőt hagyd üresen <input type="text" name="hp_x9" tabIndex={-1} autoComplete="new-password" data-lpignore="true" data-1p-ignore value={f.hp_x9} onChange={set("hp_x9")} /></label>
      </div>

      {step > 0 && (
        <div className="cf-progress">
          <button type="button" className="cf-back" onClick={back}>← Vissza</button>
          {steps.length > 1 && (
            <ol>
              {steps.map((s, i) => (
                <li key={s} className={i + 1 === step ? "on" : i + 1 < step ? "done" : ""}>{s}</li>
              ))}
            </ol>
          )}
        </div>
      )}

      {step === 0 && (
        <fieldset>
          <legend>Miben segíthetünk?</legend>
          <div className="cf-cards">
            {INTERESTS.map((i) => (
              <button
                type="button"
                key={i.value}
                className={`cf-card${f.interest === i.value ? " on" : ""}`}
                onClick={() => choose(i.value)}
              >
                <strong>{i.value}</strong>
                <span>{i.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* ---------- Nem esküvő: egy lépés ---------- */}
      {step === 1 && !isWedding && (
        <fieldset>
          <legend>{f.interest}</legend>
          <Field label="Mikorra lenne rá szükség?" hint="Ha van konkrét dátum.">
            <input type="date" value={f.event_date} onChange={set("event_date")} />
          </Field>
          <Field label="Település" hint="Átvételhez vagy kiszállításhoz.">
            <input value={f.location} onChange={set("location")} autoComplete="address-level2" />
          </Field>
          <Field label="Miben segíthetünk?" error={errors.message} required>
            <textarea rows={5} value={f.message} onChange={set("message")} />
          </Field>
          <Contact f={f} set={set} errors={errors} />
        </fieldset>
      )}

      {/* ---------- Esküvő: 1. Alapok ---------- */}
      {step === 1 && isWedding && (
        <fieldset>
          <legend>Az esküvőtök</legend>
          <div className="cf-row">
            <Field label="Időpont">
              <input type="date" value={f.event_date} onChange={set("event_date")} />
            </Field>
            <Field label="Létszám" hint="Kb. hány vendég?">
              <input inputMode="numeric" value={f.guests} onChange={set("guests")} />
            </Field>
          </div>
          <Field label="Helyszín" hint="Település és a helyszín neve.">
            <input value={f.location} onChange={set("location")} />
          </Field>
          <Choice label="Asztalok elrendezése" options={TABLE_LAYOUTS} value={f.table_layout} onPick={(v) => pick("table_layout", v)} />
          <Choice label="Lesz templomi esküvő?" options={CHURCH} value={f.church} onPick={(v) => pick("church", v)} />
          {f.church === "Igen" && (
            <Field label="A templom címe">
              <input value={f.church_address} onChange={set("church_address")} />
            </Field>
          )}
          <Field
            label="Gondolt keretösszeg"
            hint="Az esküvői dekoráció nem sablonárakra épül; a keret abban segít, hogy ár-érték arányban a hozzátok illő ajánlatot állítsuk össze."
            error={errors.budget}
            required
          >
            <input value={f.budget} onChange={set("budget")} placeholder="pl. 300 000 Ft körül" />
          </Field>
        </fieldset>
      )}

      {/* ---------- Esküvő: 2. Virágok ---------- */}
      {step === 2 && isWedding && (
        <fieldset>
          <legend>Virágok és színek</legend>
          <Choice
            label="Milyen virágokból készüljön a dekoráció?"
            hint="Főként élő és száraz virággal dolgozunk, kérésre minőségi selyemvirággal is."
            options={FLOWER_TYPES} value={f.flower_type} onPick={(v) => pick("flower_type", v)}
          />
          <Field label="Színvilág" hint="pl. púder, ekrü, zsálya">
            <input value={f.colors} onChange={set("colors")} />
          </Field>
          <Choice label="Legyenek zöld levelek is a díszekben?" options={GREENERY} value={f.greenery} onPick={(v) => pick("greenery", v)} />
          <div className="cf-row">
            <Field label="Kedvenc virágok">
              <input value={f.favorite_flowers} onChange={set("favorite_flowers")} placeholder="pl. rózsa, hortenzia" />
            </Field>
            <Field label="Kerülendő virágok">
              <input value={f.avoid_flowers} onChange={set("avoid_flowers")} />
            </Field>
          </div>
          <Choice
            label="Általános vagy prémium virágok?"
            hint="A prémium virágok (pl. hortenzia, peónia, orchidea, szarkaláb és a kék árnyalatú virágok) többnyire importból érkeznek, ezért drágábbak. Importtal a szezonon kívüli fajták is megoldhatók."
            options={FLOWER_CATEGORIES} value={f.flower_category} onPick={(v) => pick("flower_category", v)}
          />
        </fieldset>
      )}

      {/* ---------- Esküvő: 3. Dekoráció ---------- */}
      {step === 3 && isWedding && (
        <fieldset>
          <legend>Mit díszítsünk?</legend>
          <p className="cf-note">Jelöljétek be, amire szükségetek lehet. A részleteket (forma, méret, szalagozás) a személyes egyeztetésen beszéljük át.</p>
          <div className="cf-checks">
            {DECOR_POINTS.map((d) => (
              <label key={d} className={`cf-check${f.decor_points.includes(d) ? " on" : ""}`}>
                <input type="checkbox" checked={f.decor_points.includes(d)} onChange={() => toggle("decor_points", d)} />
                {d}
              </label>
            ))}
          </div>
          {(f.decor_points.includes("Vendégasztalok") || f.decor_points.includes("Főasztal")) && (
            <div className="cf-row">
              {f.decor_points.includes("Vendégasztalok") && (
                <Field label="Hány vendégasztal lesz?">
                  <input inputMode="numeric" value={f.guest_tables} onChange={set("guest_tables")} />
                </Field>
              )}
              {f.decor_points.includes("Főasztal") && (
                <Field label="Hány fős a főasztal?">
                  <input inputMode="numeric" value={f.head_table} onChange={set("head_table")} />
                </Field>
              )}
            </div>
          )}
          <Choice label="Bérelnétek dekorációs elemeket?" hint="pl. boldogságkapu, állványok, táblák, vázák" options={RENTAL} value={f.rental} onPick={(v) => pick("rental", v)} />
          <Choice label="Helyszíni dekorálás" options={DELIVERY} value={f.delivery} onPick={(v) => pick("delivery", v)} stacked />
          <div className="cf-field">
            <span className="cf-label">Érdekelnek köszönőajándékok?</span>
            <div className="cf-checks">
              {GIFTS.map((g) => (
                <label key={g} className={`cf-check${f.gifts.includes(g) ? " on" : ""}`}>
                  <input type="checkbox" checked={f.gifts.includes(g)} onChange={() => toggle("gifts", g)} />
                  {g}
                </label>
              ))}
            </div>
          </div>
        </fieldset>
      )}

      {/* ---------- Esküvő: 4. Elérhetőség ---------- */}
      {step === 4 && isWedding && (
        <fieldset>
          <legend>Hol érünk el titeket?</legend>
          <Field label="Pinterest tábla vagy inspiráció" hint="Ha gyűjtöttetek képeket, másoljátok be a linket.">
            <input type="url" value={f.pinterest} onChange={set("pinterest")} placeholder="https://pinterest.com/..." />
          </Field>
          <Field label="Üzenet" hint="Bármi, amit még fontosnak tartotok.">
            <textarea rows={4} value={f.message} onChange={set("message")} />
          </Field>
          <Contact f={f} set={set} errors={errors} wedding />
        </fieldset>
      )}

      {step > 0 && (
        <div className="cf-actions">
          {serverError && <p className="cf-error" role="alert">{serverError}</p>}
          <button type="submit" className="cf-submit" disabled={status === "sending"}>
            {step < lastStep ? "Tovább" : status === "sending" ? "Küldés…" : "Elküldöm"}
          </button>
        </div>
      )}
    </form>
  );
}

function Contact({ f, set, errors, wedding }) {
  return (
    <>
      <Field label={wedding ? "Nevetek" : "Neved"} error={errors.name} required>
        <input value={f.name} onChange={set("name")} autoComplete="name" />
      </Field>
      <div className="cf-row">
        <Field label="E-mail" error={errors.email} required>
          <input type="email" value={f.email} onChange={set("email")} autoComplete="email" />
        </Field>
        <Field label="Telefon">
          <input type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
        </Field>
      </div>
      <label className={`cf-consent${errors.consent ? " err" : ""}`}>
        <input type="checkbox" checked={f.consent} onChange={set("consent")} />
        <span>
          Elfogadom az <a href="/adatkezeles" target="_blank">adatkezelési tájékoztatót</a>, és hozzájárulok, hogy a
          megadott adatokat a megkeresésem megválaszolásához kezeljétek.
        </span>
      </label>
      {errors.consent && <p className="cf-error">{errors.consent}</p>}
    </>
  );
}

function Field({ label, hint, error, required, children }) {
  return (
    <label className={`cf-field${error ? " err" : ""}`}>
      <span className="cf-label">
        {label}
        {required && <em aria-hidden="true"> *</em>}
      </span>
      {hint && <span className="cf-hint">{hint}</span>}
      {children}
      {error && <span className="cf-error">{error}</span>}
    </label>
  );
}

function Choice({ label, hint, options, value, onPick, stacked }) {
  return (
    <div className="cf-field">
      <span className="cf-label">{label}</span>
      {hint && <span className="cf-hint">{hint}</span>}
      <div className={`cf-chips${stacked ? " stacked" : ""}`} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            type="button"
            key={o}
            role="radio"
            aria-checked={value === o}
            className={`cf-chip${value === o ? " on" : ""}`}
            onClick={() => onPick(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
