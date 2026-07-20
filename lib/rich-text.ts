type RichMark = { type?: string; attrs?: Record<string, unknown> };
type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: RichMark[];
  content?: RichNode[];
};

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const attr = (node: RichNode, name: string) => {
  const value = node.attrs?.[name];
  return typeof value === "string" ? escapeHtml(value) : "";
};

function renderChildren(node: RichNode) {
  return (node.content ?? []).map(renderNode).join("");
}

function renderText(node: RichNode) {
  let output = escapeHtml(node.text ?? "");
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") output = `<strong>${output}</strong>`;
    if (mark.type === "italic") output = `<em>${output}</em>`;
    if (mark.type === "underline") output = `<u>${output}</u>`;
    if (mark.type === "strike") output = `<s>${output}</s>`;
    if (mark.type === "code") output = `<code>${output}</code>`;
    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? escapeHtml(mark.attrs.href) : "#";
      output = `<a href="${href}" target="_blank" rel="noopener noreferrer">${output}</a>`;
    }
  }
  return output;
}

function renderNode(node: RichNode): string {
  if (node.type === "text") return renderText(node);
  const children = renderChildren(node);
  if (node.type === "doc") return children;
  if (node.type === "paragraph") return `<p>${children}</p>`;
  if (node.type === "heading") {
    const rawLevel = Number(node.attrs?.level ?? 2);
    const level = Math.min(3, Math.max(1, rawLevel));
    return `<h${level}>${children}</h${level}>`;
  }
  if (node.type === "bulletList") return `<ul>${children}</ul>`;
  if (node.type === "orderedList") return `<ol>${children}</ol>`;
  if (node.type === "listItem") return `<li>${children}</li>`;
  if (node.type === "blockquote") return `<blockquote>${children}</blockquote>`;
  if (node.type === "codeBlock") return `<pre><code>${children}</code></pre>`;
  if (node.type === "horizontalRule") return "<hr>";
  if (node.type === "hardBreak") return "<br>";
  if (node.type === "image") return `<img src="${attr(node, "src")}" alt="${attr(node, "alt")}">`;
  if (node.type === "figure") {
    const caption = attr(node, "caption") || children;
    return `<figure class="cs-figure"><img class="cs-figure__img" src="${attr(node, "src")}" alt="${attr(node, "alt")}">${caption ? `<figcaption class="cs-figure__caption">${caption}</figcaption>` : ""}</figure>`;
  }
  if (node.type === "youtube") return `<div class="article-video"><iframe src="${attr(node, "src")}" title="Embedded video" allowfullscreen></iframe></div>`;
  return children;
}

export function richTextToHtml(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("<")) return trimmed;
  try {
    const document = JSON.parse(trimmed) as RichNode;
    if (document.type === "doc") return renderNode(document);
  } catch {
    // Older plain-text entries are rendered as a paragraph below.
  }
  return `<p>${escapeHtml(trimmed)}</p>`;
}

export function richTextToPlainText(content: string) {
  const trimmed = content.trim();
  try {
    const document = JSON.parse(trimmed) as RichNode;
    const collect = (node: RichNode): string => [node.text ?? "", ...(node.content ?? []).map(collect)].join(" ");
    if (document.type === "doc") return collect(document).replace(/\s+/g, " ").trim();
  } catch {
    // HTML is stripped below.
  }
  return trimmed.replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "and").replace(/\s+/g, " ").trim();
}
