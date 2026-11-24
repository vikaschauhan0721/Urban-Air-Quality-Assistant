import { ImageResponse } from "next/og";

export const alt = "Saans — Urban Air Quality Assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "#0f172a",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "#0f766e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            S
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#99f6e4" }}>
            SAANS · URBAN AIR ASSISTANT
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1.1 }}>
            Breathe easier, one choice at a time.
          </div>
          <div style={{ fontSize: "28px", color: "#cbd5e1" }}>
            Live India CPCB &amp; US AQI · Free &amp; Low-Cost Indoor Hacks · Deterministic Impact Math
          </div>
        </div>

        <div style={{ fontSize: "22px", color: "#94a3b8" }}>
          Built for families &amp; communities navigating severe winter smog
        </div>
      </div>
    ),
    size
  );
}
