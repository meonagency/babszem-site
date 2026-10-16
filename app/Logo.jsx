import { MARK, MARK_VIEWBOX } from "./mark";

const TONES = { m: "var(--gold)", d: "var(--gold-mid)", l: "var(--gold-light)" };

export function BrandMark({ className, title }) {
  return (
    <svg
      className={className}
      viewBox={MARK_VIEWBOX}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {MARK.map(([tone, d], i) => (
        <path key={i} d={d} fill={TONES[tone]} fillRule="evenodd" />
      ))}
    </svg>
  );
}

/* Álló logó: ikon + Cinzel felirat, a logó v1 arányaival */
export function LogoStacked() {
  return (
    <div className="logo-stacked" role="img" aria-label="Babszem Virágműhely">
      <BrandMark className="logo-mark" />
      <span className="logo-l1" aria-hidden="true">BABSZEM</span>
      <span className="logo-l2" aria-hidden="true">VIRÁGMŰHELY</span>
    </div>
  );
}
