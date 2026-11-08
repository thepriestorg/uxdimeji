// Project summaries are short rich text: bold, italic, underline, links, paragraphs.
// Older summaries are plain text, so both forms are handled.

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const ALLOWED = new Set(["p", "br", "strong", "b", "em", "i", "u", "a"]);

const safeHref = (raw: string) => {
  const href = raw.replace(/&amp;/g, "&").trim();
  return /^(https?:|mailto:)/i.test(href) ? href : null;
};

/** Keeps only the allowed tags and a safe href on links; drops every other tag and attribute. */
export function sanitizeSummary(input: string | null | undefined): string {
  if (!input) return "";
  if (!/<[a-z/]/i.test(input)) {
    return input
      .split(/\n{2,}/)
      .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  // Drop script/style blocks entirely, then rebuild each remaining tag from scratch.
  const cleaned = input.replace(/<(script|style|iframe|object)[\s\S]*?<\/\1\s*>/gi, "");
  return cleaned.replace(/<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi, (_, close: string, name: string, attrs: string) => {
    const tag = name.toLowerCase();
    if (!ALLOWED.has(tag)) return "";
    if (close) return tag === "br" ? "" : `</${tag}>`;
    if (tag === "a") {
      const match = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
      const href = match ? safeHref(match[2] ?? match[3] ?? "") : null;
      return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">` : "<a>";
    }
    return `<${tag}>`;
  });
}

/** Cuts plain text at a word boundary, adding an ellipsis when it was shortened. */
export function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`;
}

/** Plain text version, for meta descriptions and empty checks. */
export function summaryText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
