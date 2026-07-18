import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "62px 68px 56px",
          color: "#161616",
          background: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 24,
            borderBottom: "1px solid #d8d8d5",
            fontSize: 14,
            fontWeight: 650,
            letterSpacing: ".12em",
            textTransform: "uppercase",
          }}
        >
          <span>Independent product designer</span>
          <span style={{ color: "#696965" }}>Portfolio / 2026</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 70,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 86,
              fontWeight: 560,
              lineHeight: .92,
              letterSpacing: "-.055em",
            }}
          >
            <span>Oladimeji</span>
            <span>Abubakar</span>
          </div>

          <div
            style={{
              width: 350,
              display: "flex",
              flexDirection: "column",
              paddingBottom: 7,
            }}
          >
            <span
              style={{
                marginBottom: 18,
                fontSize: 26,
                fontWeight: 620,
                letterSpacing: "-.025em",
              }}
            >
              Product Designer
            </span>
            <span
              style={{
                color: "#696965",
                fontSize: 19,
                fontWeight: 430,
                lineHeight: 1.45,
              }}
            >
              I design how digital products think, move, and work.
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 22,
            borderTop: "1px solid #161616",
            fontSize: 13,
            fontWeight: 620,
            letterSpacing: ".09em",
            textTransform: "uppercase",
          }}
        >
          <span>Kwara, Nigeria / Working worldwide</span>
          <span>uxdimeji.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
}
