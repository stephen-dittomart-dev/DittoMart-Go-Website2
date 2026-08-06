import { ImageResponse } from "next/og";
import { providers } from "@/lib/providers";
import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = `${site.name} — nine delivery networks, one integration`;
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
          background: "#ffffff",
          padding: "68px",
          position: "relative",
        }}
      >
        {/* warm brand wash */}
        <div
          style={{
            position: "absolute",
            top: -280,
            right: -160,
            width: 900,
            height: 620,
            background:
              "radial-gradient(closest-side, rgba(244,102,31,0.30), rgba(255,255,255,0))",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            left: -180,
            width: 760,
            height: 560,
            background:
              "radial-gradient(closest-side, rgba(212,32,39,0.18), rgba(255,255,255,0))",
            display: "flex",
          }}
        />

        {/* mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              background: "linear-gradient(135deg, #fb8038, #e04e0f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                background: "#ffffff",
                display: "flex",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ color: "#7e1b20" }}>DITTO</span>
              <span style={{ color: "#e04e0f" }}>MART</span>
              <span style={{ color: "#1b1715", marginLeft: 8 }}>Go</span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 13,
                letterSpacing: "0.22em",
                color: "#e04e0f",
                marginTop: 4,
              }}
            >
              WE ARE ON YOUR ROUTE
            </div>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              color: "#1b1715",
              letterSpacing: "-0.04em",
              lineHeight: 1.04,
              maxWidth: 940,
            }}
          >
            Nine delivery networks. One integration.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#5d554d",
              maxWidth: 880,
              lineHeight: 1.4,
            }}
          >
            Routing, tracking, wallet, billing and settlement — handled
            automatically.
          </div>
        </div>

        {/* partner strip */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            borderTop: "1px solid #e8e2da",
            paddingTop: 26,
          }}
        >
          {providers.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                fontSize: 19,
                color: "#453e39",
                border: "1px solid #e8e2da",
                borderRadius: 999,
                padding: "7px 16px",
              }}
            >
              {p.short}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
