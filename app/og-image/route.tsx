import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#181816",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 190,
            left: 426,
            width: 348,
            height: 240,
            borderRadius: 180,
            background: "rgba(255,255,255,0.035)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 650,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Oladimeji Abubakar / Product designer
          </div>
          <div
            style={{
              width: 150,
              height: 1,
              marginTop: 18,
              background: "rgba(255,255,255,0.52)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 58,
            left: 72,
            height: 1,
            background: "rgba(255,255,255,0.42)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 80,
            color: "rgba(255,255,255,0.44)",
            fontSize: 14,
            fontWeight: 650,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Portfolio / Interface archive
        </div>
        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 80,
            color: "rgba(255,255,255,0.44)",
            fontSize: 14,
            fontWeight: 650,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          uxdimeji.com
        </div>
      </div>
    ),
    size
  );
}
