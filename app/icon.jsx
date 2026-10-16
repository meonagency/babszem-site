import { ImageResponse } from "next/og";
import { MARK, MARK_VIEWBOX } from "./mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/* Favicon: egyszínű, vastagított kontúr, hogy kis méretben is látszódjon */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="60" height="60" viewBox={MARK_VIEWBOX}>
          {MARK.map(([, d], i) => (
            <path key={i} d={d} fill="#cb8629" fillRule="evenodd" stroke="#cb8629" strokeWidth="26" strokeLinejoin="round" />
          ))}
        </svg>
      </div>
    ),
    size
  );
}
