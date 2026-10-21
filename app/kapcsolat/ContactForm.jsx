"use client";

import { useEffect, useRef, useState } from "react";
import {
  PUBLIC_INTERESTS, TABLE_LAYOUTS, CHURCH, SILK, GREENERY, FLOWER_CATEGORIES, SEASONAL, PREMIUM,
  SEASONAL_EXAMPLES, PREMIUM_FLOWERS, RENTAL, GIFTS, DECOR_GROUPS, COLORS, IMAGES, WEDDING,
  RENTAL_INTEREST, GIFT_INTEREST, GIFT_TYPES, BRIDESMAIDS,
  PAPER_HELP, PAPER_ITEMS, INVITE_TYPES, INVITE_PAPERS, PAPER_NOTE_MAX,
} from "./fields";
import {
  formatPhone, formatMoney, moneyValue, emailSuggestion, EMAIL_RE,
  validFutureDate, todayISO, inRange, LIMITS,
} from "./format";
import { LocationInput, TagPicker, ImageUpload } from "./inputs";

const INITIAL = {
  interest: "",
  name: "", email: "", phone: "", event_date: "", location: "", message: "",
  consent: false, hp_x9: "",
  guests: "", table_layout: "", church: "", church_address: "", budget: "",
  flower_category: "", premium_flowers: [], silk_rental: "", colors: [], greenery: "",
  avoid_flowers: "", decor_points: [], guest_tables: "", head_table: "",
  rental: "", gifts: [], pinterest: "", images: [], gift_type: "", bridesmaids: "",
  paper_help: "", paper_items: [], invite_type: "", invite_paper: "", invite_qty: "", paper_note: "", veluma_consent: false,
};

const STORE_KEY = "babszem_kapcsolat_v1";

const WEDDING_STEPS = ["Alapok", "Virágok", "Dekoráció", "Elérhetőség"];
const WEDDING_STEPS_PAPER = ["Alapok", "Virágok", "Dekoráció", "Papíráru", "Elérhetőség"];
const MSG_MAX = 2000;
const onlyDigits = (v, max = 4) => v.replace(/\D/g, "").slice(0, max);

export default function ContactForm() {
  const [f, setF] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const loaded = useRef(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  // Munkamenet-mentés: a kitöltött adatok a böngészőfül bezárásáig megmaradnak
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const ok = saved?.f && (!saved.f.interest || PUBLIC_INTERESTS.some((i) => i.value === saved.f.interest));
        if (ok) {
          setF({ ...INITIAL, ...saved.f, hp_x9: "" });
          if (Number.isInteger(saved.step)) setStep(saved.step);
          if (Number.isInteger(saved.reached)) setReached(saved.reached);
        }
      }
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const write = (value) => sessionStorage.setItem(STORE_KEY, JSON.stringify(value));
    try {
      if (status === "done") return sessionStorage.removeItem(STORE_KEY);
      try {
        write({ f, step, reached });
      } catch {
        write({ f: { ...f, images: [] }, step, reached }); // túl nagy képek nélkül
      }
    } catch {}
  }, [f, step, reached, status]);

  const isWedding = f.interest === WEDDING;
  const isRental = f.interest === RENTAL_INTEREST;
  const isGift = f.interest === GIFT_INTEREST;
  const paperOn = isWedding && f.paper_help === "Igen";
  const steps = isWedding ? (paperOn ? WEDDING_STEPS_PAPER : WEDDING_STEPS) : ["Részletek"];
  const lastStep = steps.length;

  const put = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };
  const set = (k, transform) => (e) => {
    const raw = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    put(k, transform ? transform(raw) : raw);
  };
  const pick = (k, v) => put(k, f[k] === v ? "" : v);
  const toggle = (k, v) => put(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  const choose = (v) => {
    setF((p) => ({ ...p, interest: v }));
    setStep(1);
    setReached((r) => Math.max(r, 1));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- Lépésenkénti ellenőrzés ----
  const check = (s) => {
    const e = {};
    const contactStep = isWedding ? steps.length : 1;
    if (s === 1) {
      if (!validFutureDate(f.event_date)) e.event_date = "Válassz mai vagy későbbi dátumot.";
    }
    if (isWedding && s === 1) {
      if (!f.event_date) e.event_date = "Kérjük, adjátok meg az esküvő dátumát.";
      if (!inRange(f.guests, ...LIMITS.guests)) e.guests = `1 és ${LIMITS.guests[1]} közötti számot adj meg.`;
      if (f.location.trim().length < 2) e.location = "Kérjük, adjátok meg az esküvő helyszínét.";
      if (f.church === "Igen" && f.church_address.trim().length < 2) e.church_address = "Kérjük, adjátok meg a templom helyszínét.";
      if (!f.budget) e.budget = "Kérjük, adjatok meg egy hozzávetőleges keretet.";
      else if (moneyValue(f.budget) < LIMITS.budget_min) e.budget = "A minimális keretösszeg 100 000 Ft. Ennél alacsonyabb összegből nem tudunk pontos esküvői ajánlatot adni.";
    }
    if (isGift && s === 1 && !f.gift_type) e.gift_type = "Válaszd ki, hogy csokorról vagy virágboxról van szó.";
    if (isWedding && s === 3) {
      if (!inRange(f.guest_tables, ...LIMITS.guest_tables)) e.guest_tables = "Adj meg egy valós asztalszámot.";
      if (!inRange(f.head_table, ...LIMITS.head_table)) e.head_table = "Adj meg egy valós létszámot.";
      if (f.decor_points.includes(BRIDESMAIDS) && !(Number(f.bridesmaids) >= 1)) e.bridesmaids = "Add meg, hány darabra lenne szükség.";
    }
    if (paperOn && s === 4) {
      if (!f.paper_items.length) e.paper_items = "Jelölj meg legalább egy papírárut.";
      if (!f.veluma_consent) e.veluma_consent = "A papíráru-segítséghez szükség van a hozzájárulásra.";
    }
    if (s === contactStep) {
      if (f.name.trim().length < 2) e.name = "Kérjük, add meg a neved.";
      if (!EMAIL_RE.test(f.email.trim())) e.email = "Kérjük, adj meg egy érvényes e-mail címet.";
      if (f.phone && formatPhone(f.phone) === null) e.phone = "Ellenőrizd a telefonszámot (pl. +36 30 123 4567).";
      if (!isWedding && f.location.trim().length < 2) e.location = "Kérjük, add meg a települést.";
      if (!isWedding && !f.message.trim()) e.message = "Írd le röviden, mire lenne szükséged.";
      if (f.images.length > IMAGES.max) e.images = `Legfeljebb ${IMAGES.max} képet tölthettek fel.`;
      if (f.pinterest && !/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(f.pinterest.trim()))
        e.pinterest = "Ez nem tűnik linknek. Másold be a teljes címet.";
      if (!f.consent) e.consent = "Az adatkezelés elfogadása nélkül nem tudunk válaszolni.";
    }
    return e;
  };

  const validate = (s) => {
    const e = check(s);
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector(".cf-field.err, .cf-consent.err")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return false;
    }
    return true;
  };

  const go = (to) => {
    setStep(to);
    setReached((r) => Math.max(r, to));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lépéslépcsőre kattintás: csak már elért lépésre lehet ugrani
  const jump = (to) => {
    if (to !== step && to <= Math.max(reached, step)) go(to);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate(step)) return;
    if (step < lastStep) return go(step + 1);
    for (let s = 1; s < lastStep; s++) {
      // Egy korábban kitöltött lépés közben érvénytelenné válhatott
      const prev = check(s);
      if (Object.keys(prev).length) {
        setStep(s);
        setErrors(prev);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    setStatus("sending");
    setServerError("");
    const qs = new URLSearchParams(window.location.search);
    try {
      const res = await fetch("/api/kapcsolat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          phone: f.phone ? formatPhone(f.phone) : "",
          budget: f.budget ? `${f.budget} Ft` : "",
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
      setServerError(data.error || "Valami nem stimmel. Ellenőrizd a megjelölt mezőket.");
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

  const suggestion = emailSuggestion(f.email);

  return (
    <form className="cf" onSubmit={submit} noValidate>
      <div className="hp" aria-hidden="true">
        <label>Ezt a mezőt hagyd üresen <input type="text" name="hp_x9" tabIndex={-1} autoComplete="new-password" data-lpignore="true" data-1p-ignore value={f.hp_x9} onChange={set("hp_x9")} /></label>
      </div>

      {step > 0 && (
        <div className="cf-progress">
          <button type="button" className="cf-back" onClick={() => go(step - 1)}>← Vissza</button>
          {steps.length > 1 && (
            <ol>
              {steps.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    className={i + 1 === step ? "on" : i + 1 < step ? "done" : ""}
                    aria-current={i + 1 === step ? "step" : undefined}
                    disabled={i + 1 > Math.max(reached, step)}
                    onClick={() => jump(i + 1)}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {step === 0 && (
        <fieldset>
          <legend>Miben segíthetünk?</legend>
          <div className="cf-cards">
            {PUBLIC_INTERESTS.map((i) => (
              <button type="button" key={i.value} className={`cf-card${f.interest === i.value ? " on" : ""}`} onClick={() => choose(i.value)}>
                <strong>{i.value}</strong>
                <span>{i.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* ---------- Nem esküvő ---------- */}
      {step === 1 && !isWedding && (
        <fieldset>
          <legend>{f.interest}</legend>
          {isGift && (
            <div className={`cf-field${errors.gift_type ? " err" : ""}`}>
              <Choice label="Mit szeretnétek?" options={GIFT_TYPES} value={f.gift_type} onPick={(v) => pick("gift_type", v)} />
              {errors.gift_type && <span className="cf-error" role="alert">{errors.gift_type}</span>}
            </div>
          )}
          {isRental && (
            <>
              <Choice
                label="Érdekel a bérelhető selyemvirágos dekoráció?"
                hint="Van egy fix, bérelhető selyemvirágos dekorációnk, kedvező áron. Élő virággal kombinálható."
                options={SILK} value={f.silk_rental} onPick={(v) => pick("silk_rental", v)} stacked
              />
              <Choice label="Bérelnétek dekorációs elemeket?" hint="pl. boldogságkapu, állványok, táblák, vázák" options={RENTAL} value={f.rental} onPick={(v) => pick("rental", v)} />
            </>
          )}
          <Field label="Mikorra lenne rá szükség?" hint="Ha van konkrét dátum." error={errors.event_date}>
            <input type="date" min={todayISO()} max={todayISO(4)} value={f.event_date} onChange={set("event_date")} />
          </Field>
          <Field label="Település" hint="Átvételhez vagy kiszállításhoz." error={errors.location} required>
            <LocationInput kind="city" value={f.location} onChange={(v) => put("location", v)} placeholder="pl. Ráckeve" autoComplete="address-level2" />
          </Field>
          <Field label="Miben segíthetünk?" error={errors.message} required counter={`${f.message.length} / ${MSG_MAX}`}>
            <textarea rows={5} maxLength={MSG_MAX} value={f.message} onChange={set("message")} />
          </Field>
          <Contact f={f} set={set} put={put} errors={errors} suggestion={suggestion} />
        </fieldset>
      )}

      {/* ---------- Esküvő 1: Alapok ---------- */}
      {step === 1 && isWedding && (
        <fieldset>
          <legend>Az esküvőtök</legend>
          <div className="cf-row">
            <Field label="Időpont" error={errors.event_date} required>
              <input type="date" min={todayISO()} max={todayISO(4)} value={f.event_date} onChange={set("event_date")} />
            </Field>
            <Field label="Létszám" hint="Kb. hány vendég?" error={errors.guests}>
              <Suffix unit="fő">
                <input inputMode="numeric" value={f.guests} onChange={set("guests", (v) => onlyDigits(v))} placeholder="pl. 80" />
              </Suffix>
            </Field>
          </div>
          <Field label="Helyszín" hint="Kezdd el gépelni a helyszín vagy a település nevét." error={errors.location} required>
            <LocationInput kind="venue" value={f.location} onChange={(v) => put("location", v)} placeholder="pl. Savoyai-kastély, Ráckeve" />
          </Field>
          <Choice label="Asztalok elrendezése" options={TABLE_LAYOUTS} value={f.table_layout} onPick={(v) => pick("table_layout", v)} />
          <Choice label="Lesz templomi esküvő?" options={CHURCH} value={f.church} onPick={(v) => pick("church", v)} />
          {f.church === "Igen" && (
            <Field label="A templom" error={errors.church_address} required>
              <LocationInput kind="venue" value={f.church_address} onChange={(v) => put("church_address", v)} placeholder="pl. Szent Mihály-templom, Ráckeve" />
            </Field>
          )}
          <Field
            label="Gondolt keretösszeg"
            hint="Az esküvői dekoráció nem sablonárakra épül. A keret abban segít, hogy pontosabb, a hozzátok illő ajánlatot tudjunk adni."
            error={errors.budget}
            required
          >
            <Suffix unit="Ft">
              <input inputMode="numeric" value={f.budget} onChange={set("budget", formatMoney)} placeholder="pl. 400 000" />
            </Suffix>
          </Field>
        </fieldset>
      )}

      {/* ---------- Esküvő 2: Virágok ---------- */}
      {step === 2 && isWedding && (
        <fieldset>
          <legend>Virágok és színek</legend>
          <p className="cf-note">Élő virággal dolgozunk, a szezon kínálatából. A szezonális dekorációnál hazai virágokat használunk: frissek, rövid úton érkeznek, és az évszakhoz illő, természetes hatást adnak.</p>
          <Choice
            label="Szezonális vagy prémium virágok?"
            hint="A pontos kategória az inspirációs képek és a személyes egyeztetés alapján dől el, ezért nyugodtan jelöljétek, ha még nem tudjátok."
            options={FLOWER_CATEGORIES} value={f.flower_category} onPick={(v) => pick("flower_category", v)}
          />
          {f.flower_category !== PREMIUM && (
            <div className="cf-field">
              <span className="cf-label">Jellemző szezonális virágok</span>
              <span className="cf-hint">Csak ízelítő: a hazai szezonális virágokból a virágműhelyünk az aktuális kínálatból válogat a színvilágotokhoz.</span>
              <div className="cf-inspo">
                {SEASONAL_EXAMPLES.map((x) => <span key={x}>{x}</span>)}
              </div>
            </div>
          )}
          {f.flower_category !== SEASONAL && (
            <div className="cf-field">
              <span className="cf-label">Prémium virágok</span>
              <span className="cf-hint">Ezeket külön rendeljük, ezért magasabb az áruk. Jelöljétek, amelyikhez ragaszkodnátok.</span>
              <div className="cf-checks">
                {PREMIUM_FLOWERS.map((x) => (
                  <label key={x} className={`cf-check${f.premium_flowers.includes(x) ? " on" : ""}`}>
                    <input type="checkbox" checked={f.premium_flowers.includes(x)} onChange={() => toggle("premium_flowers", x)} />
                    {x}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="cf-field">
            <span className="cf-label">Színvilág</span>
            <span className="cf-hint">Válasszatok egyet vagy többet, vagy írjátok be a sajátotokat.</span>
            <TagPicker options={COLORS} value={f.colors} onChange={(v) => put("colors", v)} placeholder="Egyéb szín, pl. mustár" />
          </div>
          <Choice label="Legyenek zöld levelek is a díszekben?" hint="A válaszotok befolyásolja a szükséges virágmennyiséget, így az árajánlatot is." options={GREENERY} value={f.greenery} onPick={(v) => pick("greenery", v)} />
          <Field label="Kerülendő virágok" hint="Pl. allergia vagy illat miatt.">
            <input value={f.avoid_flowers} onChange={set("avoid_flowers")} maxLength={200} placeholder="pl. liliom" />
          </Field>
        </fieldset>
      )}

      {/* ---------- Esküvő 3: Dekoráció ---------- */}
      {step === 3 && isWedding && (
        <fieldset>
          <legend>Mit díszítsünk?</legend>
          <p className="cf-note">Jelöljétek be, amire szükségetek lehet. A részleteket (forma, méret, szalagozás) a személyes egyeztetésen beszéljük át.</p>
          {DECOR_GROUPS.map((g) => (
            <div className="cf-group" key={g.title}>
              <h3>{g.title}</h3>
              <div className="cf-checks">
                {g.items.map((d) => (
                  <label key={d} className={`cf-check${f.decor_points.includes(d) ? " on" : ""}`}>
                    <input type="checkbox" checked={f.decor_points.includes(d)} onChange={() => toggle("decor_points", d)} />
                    {d}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {f.decor_points.includes(BRIDESMAIDS) && (
            <div className="cf-row">
              <Field label="Hány koszorúslány / -fiú díszére lenne szükség?" error={errors.bridesmaids} required>
                <Suffix unit="db">
                  <input inputMode="numeric" value={f.bridesmaids} onChange={set("bridesmaids", (v) => onlyDigits(v, 2))} />
                </Suffix>
              </Field>
            </div>
          )}
          {(f.decor_points.includes("Vendégasztalok") || f.decor_points.includes("Főasztal")) && (
            <div className="cf-row">
              {f.decor_points.includes("Vendégasztalok") && (
                <Field label="Hány vendégasztal lesz?" error={errors.guest_tables}>
                  <Suffix unit="db">
                    <input inputMode="numeric" value={f.guest_tables} onChange={set("guest_tables", (v) => onlyDigits(v, 3))} />
                  </Suffix>
                </Field>
              )}
              {f.decor_points.includes("Főasztal") && (
                <Field label="Hány fős a főasztal?" error={errors.head_table}>
                  <Suffix unit="fő">
                    <input inputMode="numeric" value={f.head_table} onChange={set("head_table", (v) => onlyDigits(v, 2))} />
                  </Suffix>
                </Field>
              )}
            </div>
          )}
          <p className="cf-note">A helyszíni dekorálást és a rendezvény utáni bontást mi végezzük.</p>
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
          <Choice
            label="Szeretnétek segítséget a meghívóhoz és a többi papíráruhoz?"
            hint="Ezt a Veluma Wedding partnerünk vállalja. Ha igent jelöltök, a következő lépésben pár kérdést teszünk fel."
            options={PAPER_HELP} value={f.paper_help} onPick={(v) => pick("paper_help", v)}
          />
        </fieldset>
      )}

      {/* ---------- Esküvő 4: Papíráru (csak ha kérik) ---------- */}
      {step === 4 && paperOn && (
        <fieldset>
          <legend>Papíráru és meghívó</legend>
          <p className="cf-note">A papíráruban a Veluma Wedding partnerünk segít. Jelöljétek, mire lenne szükségetek, a Veluma ezek alapján keres meg titeket.</p>
          <div className={`cf-field${errors.paper_items ? " err" : ""}`}>
            <span className="cf-label">Milyen papírárura lenne szükségetek?</span>
            <div className="cf-checks">
              {PAPER_ITEMS.map((x) => (
                <label key={x} className={`cf-check${f.paper_items.includes(x) ? " on" : ""}`}>
                  <input type="checkbox" checked={f.paper_items.includes(x)} onChange={() => toggle("paper_items", x)} />
                  {x}
                </label>
              ))}
            </div>
            {errors.paper_items && <span className="cf-error" role="alert">{errors.paper_items}</span>}
          </div>
          {f.paper_items.includes("Meghívó") && (
            <>
              <Choice
                label="Milyen meghívót szeretnétek?"
                hint="Letisztult: egylapos, elegáns meghívó borítékkal. Komplex: több elemből álló szett, külön visszajelző (RSVP) és részletező kártyával."
                options={INVITE_TYPES} value={f.invite_type} onPick={(v) => pick("invite_type", v)}
              />
              <Choice label="Milyen papírra?" options={INVITE_PAPERS} value={f.invite_paper} onPick={(v) => pick("invite_paper", v)} stacked />
              <Field label="Hány meghívóra lenne szükség?" hint="Kb. mennyi, ha még nem biztos, hagyd üresen.">
                <Suffix unit="db">
                  <input inputMode="numeric" value={f.invite_qty} onChange={set("invite_qty", (v) => onlyDigits(v, 3))} />
                </Suffix>
              </Field>
            </>
          )}
          <Field label="Megjegyzés" hint="Bármi, amit a Velumának érdemes tudnia a papíráruról." counter={`${f.paper_note.length} / ${PAPER_NOTE_MAX}`}>
            <textarea rows={3} maxLength={PAPER_NOTE_MAX} value={f.paper_note} onChange={set("paper_note")} />
          </Field>
          <label className={`cf-consent${errors.veluma_consent ? " err" : ""}`}>
            <input type="checkbox" checked={f.veluma_consent} onChange={set("veluma_consent")} />
            <span>
              Hozzájárulok, hogy a nevemet, e-mail címemet, az esküvőm dátumát és a papíráruval kapcsolatos válaszaimat a Babszem
              Virágműhely a Veluma Wedding (Szőke Simeon Károly e.v.) részére továbbítsa, hogy a Veluma ajánlatot adhasson a
              papírárukra. A részleteket az <a href="/adatkezeles" target="_blank">adatkezelési tájékoztató</a> tartalmazza.
            </span>
          </label>
          {errors.veluma_consent && <p className="cf-error">{errors.veluma_consent}</p>}
        </fieldset>
      )}

      {/* ---------- Esküvő 4/5: Elérhetőség ---------- */}
      {step === steps.length && isWedding && (
        <fieldset>
          <legend>Hol érünk el titeket?</legend>
          <Field label="Pinterest tábla" hint="Ha gyűjtöttetek képeket, másoljátok be a tábla linkjét." error={errors.pinterest}>
            <input type="url" inputMode="url" value={f.pinterest} onChange={set("pinterest")} placeholder="https://pinterest.com/..." />
          </Field>
          <div className="cf-field">
            <span className="cf-label">Vagy töltsetek fel képeket</span>
            <span className="cf-hint">Legfeljebb {IMAGES.max} inspirációs kép (JPG, PNG).</span>
            <ImageUpload value={f.images} onChange={(v) => put("images", v)} limits={IMAGES} error={errors.images} />
          </div>
          <Field label="Üzenet" hint="Bármi, amit még fontosnak tartotok." counter={`${f.message.length} / ${MSG_MAX}`}>
            <textarea rows={4} maxLength={MSG_MAX} value={f.message} onChange={set("message")} />
          </Field>
          <Contact f={f} set={set} put={put} errors={errors} suggestion={suggestion} wedding />
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

function Contact({ f, set, put, errors, suggestion, wedding }) {
  return (
    <>
      <Field label={wedding ? "Nevetek" : "Neved"} error={errors.name} required>
        <input value={f.name} onChange={set("name")} autoComplete="name" maxLength={120} />
      </Field>
      <div className="cf-row">
        <Field label="E-mail" error={errors.email} required>
          <input type="email" inputMode="email" value={f.email} onChange={set("email", (v) => v.trim())} autoComplete="email" maxLength={160} />
          {suggestion && !errors.email && (
            <button type="button" className="cf-suggest" onClick={() => put("email", suggestion)}>
              Erre gondoltál: <strong>{suggestion}</strong>?
            </button>
          )}
        </Field>
        <Field label="Telefon" hint="pl. +36 30 123 4567" error={errors.phone}>
          <input
            type="tel" inputMode="tel" autoComplete="tel" value={f.phone} maxLength={20}
            onChange={set("phone", (v) => v.replace(/[^\d+\s()-]/g, ""))}
            onBlur={() => { const p = formatPhone(f.phone); if (p) put("phone", p); }}
          />
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

function Field({ label, hint, error, required, counter, children }) {
  return (
    <div className={`cf-field${error ? " err" : ""}`}>
      <label className="cf-labelwrap">
        <span className="cf-label">
          {label}
          {required && <em aria-hidden="true"> *</em>}
          {counter && <small className="cf-counter">{counter}</small>}
        </span>
        {hint && <span className="cf-hint">{hint}</span>}
        {children}
      </label>
      {error && <span className="cf-error" role="alert">{error}</span>}
    </div>
  );
}

function Suffix({ unit, children }) {
  return (
    <span className="cf-suffix">
      {children}
      <span aria-hidden="true">{unit}</span>
    </span>
  );
}

function Choice({ label, hint, options, value, onPick, stacked }) {
  return (
    <div className="cf-field">
      <span className="cf-label">{label}</span>
      {hint && <span className="cf-hint">{hint}</span>}
      <div className={`cf-chips${stacked ? " stacked" : ""}`} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button type="button" key={o} role="radio" aria-checked={value === o} className={`cf-chip${value === o ? " on" : ""}`} onClick={() => onPick(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
