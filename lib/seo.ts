import type { Metadata } from "next";

export const SITE_URL = "https://uxdimeji.com";
export const SITE_NAME = "Oladimeji Abubakar";

// Every page credits the same Person node defined in the root layout, so search
// engines tie all case studies and articles back to one name.
export const authorRef = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: SITE_NAME,
  url: SITE_URL,
};

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

export function jsonLdScript(data: object) {
  // Escape "<" so content from the CMS cannot close the script tag.
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

// A page's own openGraph replaces the root layout's wholesale, and without one it inherits
// the homepage's title and URL. Use this on any indexable page without a custom share card.
export function socialMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url: path,
      locale: "en_US",
      siteName: SITE_NAME,
      images: [{ url: "/og-image", width: 1200, height: 630, alt: `${SITE_NAME} — Product Designer portfolio` }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      creator: "@uxdimeji",
      images: ["/og-image"],
    },
  };
}

// The first real paragraph of a TipTap case study, skipping "Role: …" style metadata lines.
export function getProjectSummary(contentJsonString?: string | null): string {
  if (!contentJsonString) return "";
  try {
    const doc = JSON.parse(contentJsonString);
    if (!doc || !Array.isArray(doc.content)) return "";

    for (const node of doc.content) {
      if (node.type !== "paragraph" || !Array.isArray(node.content)) continue;
      const text = node.content
        .map((child: { type?: string; text?: string }) => (child.type === "text" && child.text ? child.text : ""))
        .join("")
        .trim();
      if (text && !/^(role|timeline|platform|tools|client|impact):/i.test(text)) return text;
    }
  } catch {
    return contentJsonString;
  }
  return "";
}

// Cut on a word boundary so the snippet Google shows never ends mid-word.
export function truncateDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:.—-]+$/, "")}…`;
}
