import { ImageResponse } from "next/og";
import { MARK, MARK_VIEWBOX } from "./mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf6ef" }}>
        <svg width="128" height="128" viewBox={MARK_VIEWBOX}>
          {MARK.map(([, d], i) => (
            <path key={i} d={d} fill="#cb8629" fillRule="evenodd" stroke="#cb8629" strokeWidth="14" strokeLinejoin="round" />
          ))}
        </svg>
      </div>
    ),
    size
  );
}
