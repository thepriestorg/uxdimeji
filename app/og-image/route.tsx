import { ImageResponse } from "next/og";

export const runtime = "edge";

const CREAM = "#f6f1ea";
const INK = "#151413";
const MUTED = "#7a7268";
const CORAL = "#e2734d";

// Satori needs TTF/OTF, not the site's WOFF2 files, so pull the fonts from Google Fonts.
async function googleFont(family: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`;
  const css = await (await fetch(url, { headers: { "User-Agent": "curl/8" } })).text();
  const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!src) throw new Error(`Font not found: ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

// Satori sets commas and full stops a little loose at this size, so pull each one in.
function Tight({ text }: { text: string }) {
  return (
    <div style={{ display: "flex" }}>
      {text.split(/([,.])/).filter(Boolean).map((part, index) =>
        part === "," || part === "." ? (
          <span key={index} style={{ marginLeft: -7 }}>{part}</span>
        ) : (
          <span key={index} style={{ whiteSpace: "pre" }}>{part}</span>
        ),
      )}
    </div>
  );
}

export async function GET(request: Request) {
  const photo = `${new URL(request.url).origin}/images/oladimeji.jpg`;
  const [bold, medium, mono, hand] = await Promise.all([
    googleFont("Plus Jakarta Sans", 700),
    googleFont("Plus Jakarta Sans", 500),
    googleFont("Space Mono", 400),
    googleFont("Just Me Again Down Here", 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: "60px 72px 54px",
          background: CREAM,
          color: INK,
          fontFamily: "Jakarta",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Mono", fontSize: 16, letterSpacing: "0.06em" }}>
          <div style={{ display: "flex", padding: "9px 16px", borderRadius: 99, background: INK, color: CREAM }}>UXDIMEJI.COM</div>
          <span style={{ color: MUTED }}>PRODUCT DESIGN PORTFOLIO</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 64,
            fontSize: 70,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.05em",
          }}
        >
          <Tight text="Products that look good," />
          <Tight text="feel great, and" />
          <div style={{ display: "flex", color: CORAL }}>
            <Tight text="actually ship." />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto", fontSize: 24, fontWeight: 700 }}>
          Oladimeji Abubakar
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
              fill="#0099ff"
            />
            <path d="M7.5 12.3l3 3 6-6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontWeight: 500, color: MUTED }}>· Designer who builds, Nigeria</span>
        </div>

        {/* Photo sticker with a handwritten hello */}
        <div
          style={{
            position: "absolute",
            right: 76,
            top: 168,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: "rotate(6deg)",
          }}
        >
          <div style={{ display: "flex", padding: 10, background: "#ffffff", borderRadius: 22, boxShadow: "0 18px 40px rgba(80,50,20,0.18)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} width={196} height={196} alt="" style={{ borderRadius: 14, objectFit: "cover" }} />
          </div>
          <span style={{ fontFamily: "Hand", fontSize: 40, color: CORAL, marginTop: 10 }}>hi, I&apos;m Dimeji</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Jakarta", data: bold, weight: 700, style: "normal" },
        { name: "Jakarta", data: medium, weight: 500, style: "normal" },
        { name: "Mono", data: mono, weight: 400, style: "normal" },
        { name: "Hand", data: hand, weight: 400, style: "normal" },
      ],
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
