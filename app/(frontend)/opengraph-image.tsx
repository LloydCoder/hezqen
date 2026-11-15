import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = "HEZQEN — Global Technology & Business Intelligence";
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
          backgroundColor: "#0B1B33",
          color: "#FFFFFF",
          padding: "66px 76px 54px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img
            src={`${site.url}/brand/hezqen-horizontal-reversed.svg`}
            width="520"
            height="112"
            style={{ objectFit: "contain", objectPosition: "left center" }}
          />
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "#F5A623",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ width: 112, height: 7, backgroundColor: "#F5A623" }} />
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.8 }}>
            Global Technology
          </div>
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.8 }}>
            &amp; Business Intelligence
          </div>
          <div style={{ fontSize: 28, color: "#F4F5F7", letterSpacing: 0.2 }}>
            Research. Intelligence. Perspective.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(244,245,247,0.24)",
            paddingTop: 22,
            color: "#F4F5F7",
            fontSize: 16,
            letterSpacing: 1.4,
          }}
        >
          <span>AI &amp; TECHNOLOGY</span>
          <span>CYBERSECURITY</span>
          <span>CLOUD &amp; ENGINEERING</span>
          <span>BUSINESS &amp; STARTUPS</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
