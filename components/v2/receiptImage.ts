import { BARS, BARCODE_WIDTH, RECEIPT_EMAIL, clock, lineValue, type Receipt } from "./receipt";

// Draws the receipt as a 1080×1350 share card (the portrait size most feeds use).
const CARD_W = 1080;
const CARD_H = 1350;
const PAPER_W = 380;
const PAD = 20;
const LINE = 20;
const INK = "#1c1b19";

type Op =
  | { kind: "center"; text: string; size: number; bold?: boolean; muted?: boolean }
  | { kind: "row"; label: string; value: string; sub?: boolean }
  | { kind: "hr" }
  | { kind: "barcode" };

const height = (op: Op) => (op.kind === "hr" ? 25 : op.kind === "barcode" ? 62 : LINE);

export async function renderReceiptImage(receipt: Receipt, font: string, site: string): Promise<Blob> {
  await document.fonts.ready;
  const ops: Op[] = [
    { kind: "center", text: "OLADIMEJI ABUBAKAR", size: 15, bold: true },
    { kind: "center", text: "PRODUCT DESIGNER WHO SHIPS", size: 11, muted: true },
    { kind: "center", text: "KWARA, NIGERIA · WAT", size: 11, muted: true },
    { kind: "hr" },
    { kind: "row", label: `ORDER #${receipt.order}`, value: receipt.date },
    { kind: "row", label: "VISITOR: YOU", value: receipt.time.toUpperCase() },
    { kind: "hr" },
    { kind: "row", label: "ITEM", value: "TIME" },
    ...receipt.lines.map<Op>((line) => ({
      kind: "row",
      label: line.sub ? `└ ${line.label.toUpperCase()}` : line.label.toUpperCase(),
      value: lineValue(line).toUpperCase(),
      sub: line.sub,
    })),
    { kind: "hr" },
    { kind: "row", label: "TOTAL ATTENTION", value: clock(receipt.total) },
    { kind: "row", label: "PAID WITH", value: "CURIOSITY" },
    { kind: "row", label: "STATUS", value: "SHIPPED" },
    { kind: "hr" },
    { kind: "center", text: "QUESTIONS ABOUT YOUR ORDER?", size: 12.5 },
    { kind: "center", text: RECEIPT_EMAIL, size: 12.5, bold: true },
    { kind: "hr" },
    { kind: "barcode" },
    { kind: "center", text: "THANK YOU FOR SCROLLING", size: 12.5 },
    { kind: "center", text: "NO REFUNDS. IDEAS: ALWAYS.", size: 12.5 },
  ];
  const paperH = 26 + ops.reduce((sum, op) => sum + height(op), 0) + 34;
  const scale = Math.min(2.1, (CARD_H - 280) / paperH, (CARD_W - 200) / PAPER_W);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#101011";
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = "#a1a1aa";
  ctx.font = `400 26px ${font}`;
  ctx.textAlign = "center";
  ctx.fillText(site.toUpperCase(), CARD_W / 2, CARD_H - 70);

  // Paper, slightly askew, with torn edges top and bottom.
  ctx.save();
  ctx.translate(CARD_W / 2, (CARD_H - 120) / 2);
  ctx.rotate((-2 * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.translate(-PAPER_W / 2, -paperH / 2);
  const tooth = 8;
  ctx.beginPath();
  ctx.moveTo(0, tooth);
  for (let x = 0; x < PAPER_W; x += tooth * 2) {
    ctx.lineTo(x + tooth, 0);
    ctx.lineTo(Math.min(PAPER_W, x + tooth * 2), tooth);
  }
  ctx.lineTo(PAPER_W, paperH - tooth);
  for (let x = PAPER_W; x > 0; x -= tooth * 2) {
    ctx.lineTo(x - tooth, paperH);
    ctx.lineTo(Math.max(0, x - tooth * 2), paperH - tooth);
  }
  ctx.closePath();
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#f1eee5";
  ctx.fill();
  ctx.shadowColor = "transparent";

  let y = 26;
  let barcodeY = 0;
  const inner = PAPER_W - PAD * 2;
  for (const op of ops) {
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    if (op.kind === "center") {
      ctx.font = `${op.bold ? 700 : 400} ${op.size}px ${font}`;
      ctx.textAlign = "center";
      ctx.globalAlpha = op.muted ? 0.75 : 1;
      ctx.fillText(op.text, PAPER_W / 2, y + 15);
      ctx.globalAlpha = 1;
    } else if (op.kind === "row") {
      ctx.font = `400 ${op.sub ? 11.5 : 12.5}px ${font}`;
      ctx.globalAlpha = op.sub ? 0.7 : 1;
      let label = op.label;
      while (ctx.measureText(label).width > inner * 0.64 && label.length > 4) label = `${label.slice(0, -2)}…`;
      ctx.textAlign = "left";
      ctx.fillText(label, PAD, y + 15);
      ctx.textAlign = "right";
      ctx.fillText(op.value, PAPER_W - PAD, y + 15);
      const from = PAD + ctx.measureText(label).width + 6;
      const to = PAPER_W - PAD - ctx.measureText(op.value).width - 6;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([1, 2]);
      ctx.beginPath();
      ctx.moveTo(from, y + 12);
      ctx.lineTo(to, y + 12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    } else if (op.kind === "hr") {
      ctx.globalAlpha = 0.45;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(PAD, y + 12.5);
      ctx.lineTo(PAPER_W - PAD, y + 12.5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    } else {
      barcodeY = y + 4;
      const k = inner / BARCODE_WIDTH;
      BARS.forEach((bar) => ctx.fillRect(PAD + bar.x * k, barcodeY, bar.w * k, 46));
    }
    y += height(op);
  }

  // The SHIPPED stamp over the barcode.
  ctx.translate(PAPER_W - 92, barcodeY + 23);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "#c8452a";
  ctx.fillStyle = "#c8452a";
  ctx.lineWidth = 3;
  ctx.font = `700 22px ${font}`;
  ctx.textAlign = "center";
  ctx.beginPath();
  ctx.roundRect(-66, -18, 132, 36, 6);
  ctx.stroke();
  ctx.fillText("SHIPPED", 0, 8);
  ctx.restore();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not render receipt"))), "image/png"),
  );
}
