export const SITE_URL = "https://uxdimeji.com";

// Every page credits the same Person node defined in the root layout, so search
// engines tie all case studies and articles back to one name.
export const authorRef = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Oladimeji Abubakar",
  url: SITE_URL,
};

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

export function jsonLdScript(data: object) {
  // Escape "<" so content from the CMS cannot close the script tag.
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
