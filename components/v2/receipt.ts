// Shared by the footer's visit ledger, the receipt printer and the share image.

export type ReceiptLine = { label: string; sub: boolean; ms: number };
export type Receipt = { order: string; date: string; time: string; lines: ReceiptLine[]; total: number };

export const RECEIPT_EMAIL = "oladimejiuiux@gmail.com";

export const clock = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const lineValue = (line: ReceiptLine) => (line.ms < 1000 ? "skipped" : clock(line.ms));

// Barcode bars derived from the email address, so it is stable and unique to it.
export const BARS = Array.from(RECEIPT_EMAIL)
  .flatMap((char, i) => {
    const code = char.charCodeAt(0);
    return [
      { w: (code % 3) + 1, gap: ((code >> 2) % 3) + 1 },
      { w: ((code + i) % 2) + 1, gap: 1 },
    ];
  })
  .reduce<{ x: number; w: number }[]>((bars, { w, gap }) => {
    const prev = bars[bars.length - 1];
    return [...bars, { x: prev ? prev.x + prev.w + gap : 0, w }];
  }, []);

export const BARCODE_WIDTH = BARS[BARS.length - 1].x + BARS[BARS.length - 1].w;
