import { ImageResponse } from "next/og";

// Default share preview for Facebook, WhatsApp, LinkedIn, X… (pages can override it)
export const alt = "Himalayan Green Energy Expo 2027 — 17–19 January 2027, Bhrikutimandap, Kathmandu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #04281E 0%, #0B4A35 60%, #007A5E 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#34D399", textTransform: "uppercase" }}>
          5th Edition · South Asia&apos;s Clean Energy Expo
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>Himalayan Green</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>Energy Expo 2027</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 32 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700 }}>17–19 January 2027</span>
            <span style={{ color: "#A7F3D0" }}>Bhrikutimandap, Kathmandu, Nepal</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "14px 28px",
              borderRadius: 14,
              background: "#34D399",
              color: "#04281E",
              fontWeight: 800,
              fontSize: 28,
            }}
          >
            Register free
          </div>
        </div>
      </div>
    ),
    size
  );
}
