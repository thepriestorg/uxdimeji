"use client";

import { useEffect, useLayoutEffect, useRef, useState, type Ref } from "react";
import { BARS, BARCODE_WIDTH, RECEIPT_EMAIL, clock, lineValue, type Receipt } from "./receipt";
import { renderReceiptImage } from "./receiptImage";
import { playFeed, playTear } from "./printerSound";
import styles from "./ReceiptPrinter.module.css";

type Phase = "idle" | "printing" | "done" | "torn";
type Job = { id: number; sound: boolean };

// Paper advanced per motor step, in px (one printed line).
const STEP = 20;
// How far the mouse has to pull the receipt down before it tears.
const TEAR_PULL = 70;

function Barcode({ ref }: { ref?: Ref<SVGSVGElement> }) {
  return (
    <svg
      ref={ref}
      className={styles.barcode}
      viewBox={`0 0 ${BARCODE_WIDTH} 40`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {BARS.map((bar, i) => (
        <rect key={i} x={bar.x} width={bar.w} height="40" />
      ))}
    </svg>
  );
}

function Row({ label, value, sub = false }: { label: string; value: string; sub?: boolean }) {
  return (
    <p className={`${styles.row} ${sub ? styles.sub : ""}`}>
      <span>{sub ? `└ ${label}` : label}</span>
      <i aria-hidden="true" />
      <span>{value}</span>
    </p>
  );
}

/**
 * A thermal printer that feeds out a receipt of the visit when it comes into view. The
 * paper advances line by line while the body hums; once printed it can be torn off (button,
 * or a mouse pull), reprinted, and shared as an image.
 */
export default function ReceiptPrinter({ snapshot }: { snapshot: () => Receipt }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const snapshotRef = useRef(snapshot);
  const animations = useRef<Animation[]>([]);
  const image = useRef<Promise<Blob> | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [job, setJob] = useState<Job | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    snapshotRef.current = snapshot;
  });

  const stopAnimations = () => {
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
  };

  const print = (sound: boolean) => {
    image.current = null;
    setReceipt(snapshotRef.current());
    if (!document.documentElement.hasAttribute("data-build-animate")) {
      setPhase("done");
      return;
    }
    setPhase("printing");
    setJob({ id: Date.now(), sound });
  };
  const printRef = useRef(print);
  useEffect(() => {
    printRef.current = print;
  });

  // Prints once, the first time the printer comes into view.
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        printRef.current(false);
      },
      { threshold: 0.2 },
    );
    observer.observe(feed);
    return () => {
      observer.disconnect();
      stopAnimations();
    };
  }, []);

  // Feeds the freshly laid-out receipt out of the slot one line at a time: a quick advance,
  // a short dwell while the head prints, slower through the barcode, and the odd hesitation.
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    const body = bodyRef.current;
    if (!job || !sheet || !body) return;
    stopAnimations();
    const height = sheet.offsetHeight;
    const barcode = barcodeRef.current;
    const barTop = barcode ? barcode.getBoundingClientRect().top - sheet.getBoundingClientRect().top : -1;
    const barBottom = barTop + (barcode?.getBoundingClientRect().height ?? 0);
    const frames: Keyframe[] = [{ translate: `0 ${-height}px` }];
    const offsets = [0];
    const steps: number[] = [];
    let time = 0;
    for (let shown = STEP; shown < height + STEP; shown += STEP) {
      // The line at the print head right now, measured from the top of the receipt.
      const head = height - shown;
      const graphic = head <= barBottom && head + STEP >= barTop;
      const y = -Math.max(0, height - shown);
      steps.push(time);
      time += (graphic ? 70 : 38) * (0.85 + Math.random() * 0.3);
      frames.push({ translate: `0 ${y}px`, easing: "linear" });
      offsets.push(time);
      time += (graphic ? 45 : 22) + (Math.random() < 0.05 ? 260 : 0);
      frames.push({ translate: `0 ${y}px`, easing: "cubic-bezier(.3,.7,.4,1)" });
      offsets.push(time);
    }
    frames.forEach((frame, i) => (frame.offset = offsets[i] / time));
    const feed = sheet.animate(frames, { duration: time, fill: "forwards" });
    const hum = body.animate(
      [{ translate: "0 0" }, { translate: "0.5px -0.4px" }, { translate: "-0.4px 0.3px" }, { translate: "0 0" }],
      { duration: 80, iterations: Infinity },
    );
    animations.current = [feed, hum];
    if (job.sound) playFeed(steps, time);
    feed.finished
      .then(() => {
        hum.cancel();
        setPhase("done");
      })
      .catch(() => {});
  }, [job]);

  const tear = (sound: boolean) => {
    const sheet = sheetRef.current;
    if (phase !== "done" || !sheet) return;
    stopAnimations();
    sheet.style.translate = "";
    if (sound) playTear();
    setPhase("torn");
    animations.current = [
      sheet.animate(
        [
          { translate: "0 0", rotate: "0deg" },
          { translate: "0 14px", rotate: "0.5deg", offset: 0.2 },
          { translate: "0 36px", rotate: "-4deg" },
        ],
        { duration: 700, easing: "cubic-bezier(.3,1.35,.5,1)", fill: "forwards" },
      ),
    ];
  };

  const printAnother = () => {
    const sheet = sheetRef.current;
    if (!sheet || !document.documentElement.hasAttribute("data-build-animate")) return print(true);
    stopAnimations();
    const out = sheet.animate(
      [
        { translate: "0 36px", rotate: "-4deg", opacity: 1 },
        { translate: "0 120px", rotate: "-9deg", opacity: 0 },
      ],
      { duration: 320, easing: "ease-in", fill: "forwards" },
    );
    animations.current = [out];
    out.finished.then(() => print(true)).catch(() => {});
  };

  // A mouse can pull the printed receipt down against the blade until it tears.
  const onPointerDown = (event: React.PointerEvent) => {
    const sheet = sheetRef.current;
    if (phase !== "done" || event.pointerType !== "mouse" || !sheet || (event.target as Element).closest("a")) return;
    const start = event.clientY;
    let torn = false;
    stopAnimations();
    const move = (e: PointerEvent) => {
      const pull = Math.max(0, e.clientY - start);
      sheet.style.translate = `0 ${Math.min(pull * 0.35, 26).toFixed(1)}px`;
      if (pull > TEAR_PULL && !torn) {
        torn = true;
        done();
        tear(true);
      }
    };
    const done = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", done);
      if (torn) return;
      const from = sheet.style.translate || "0 0";
      sheet.style.translate = "";
      sheet.animate([{ translate: from }, { translate: "0 0" }], {
        duration: 380,
        easing: "cubic-bezier(.3,1.6,.5,1)",
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", done);
  };

  const share = async () => {
    if (!receipt || !paperRef.current) return;
    const font = getComputedStyle(paperRef.current).fontFamily;
    image.current ??= renderReceiptImage(receipt, font, location.host);
    const text = `I spent ${clock(receipt.total)} on Oladimeji Abubakar's portfolio. Status: shipped.`;
    const url = location.origin;
    try {
      const file = new File([await image.current], "oladimeji-receipt.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My visit receipt", text, url });
        setNote("Shared ✓");
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      await navigator.clipboard?.writeText(`${text} ${url}`).catch(() => {});
      setNote("Image saved · link copied");
    } catch (error) {
      if ((error as Error).name !== "AbortError") setNote("Couldn't share, try again");
    }
  };

  // Have the share image ready by the time someone reaches for the button.
  useEffect(() => {
    if ((phase !== "done" && phase !== "torn") || !receipt || !paperRef.current || image.current) return;
    image.current = renderReceiptImage(receipt, getComputedStyle(paperRef.current).fontFamily, location.host);
    image.current.catch(() => (image.current = null));
  }, [phase, receipt]);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => setNote(""), 2600);
    return () => clearTimeout(timer);
  }, [note]);

  const ready = phase === "done" || phase === "torn";

  return (
    <div className={styles.printer} data-phase={phase}>
      <div ref={bodyRef} className={styles.body}>
        <div className={styles.face}>
          <i className={styles.led} aria-hidden="true" />
          <span className={styles.model} aria-hidden="true">
            RCPT-01
          </span>
          <div className={styles.controls}>
            {phase === "torn" ? (
              <button type="button" onClick={printAnother}>
                Print another
              </button>
            ) : (
              <button type="button" onClick={() => tear(true)} disabled={phase !== "done"}>
                Tear off
              </button>
            )}
            <button type="button" onClick={share} disabled={!ready}>
              Share
            </button>
          </div>
        </div>
        <i className={styles.blade} aria-hidden="true" />
      </div>
      <p className={styles.note} aria-live="polite">
        {note}
      </p>

      <div ref={feedRef} className={styles.feed}>
        <div ref={sheetRef} className={styles.sheet}>
          <div ref={paperRef} className={styles.paper} onPointerDown={onPointerDown}>
            <div className={styles.head}>
              <strong>Oladimeji Abubakar</strong>
              <span>Product designer who ships</span>
              <span>Kwara, Nigeria · WAT</span>
            </div>
            <hr />
            <Row label={`Order #${receipt?.order ?? "----"}`} value={receipt?.date ?? "--"} />
            <Row label="Visitor: you" value={receipt?.time ?? "--:--"} />
            <hr />
            <Row label="Item" value="Time" />
            {receipt ? (
              receipt.lines.map((line, i) => <Row key={i} label={line.label} sub={line.sub} value={lineValue(line)} />)
            ) : (
              <Row label="Your visit" value="--:--" />
            )}
            <hr />
            <Row label="Total attention" value={receipt ? clock(receipt.total) : "--:--"} />
            <Row label="Paid with" value="Curiosity" />
            <Row label="Status" value="Shipped" />
            <hr />
            <p className={styles.center}>Questions about your order?</p>
            <a className={styles.reply} href={`mailto:${RECEIPT_EMAIL}`}>
              {RECEIPT_EMAIL}
            </a>
            <hr />
            <Barcode ref={barcodeRef} />
            <p className={styles.center}>
              Thank you for scrolling
              <br />
              No refunds. Ideas: always.
            </p>
            <span className={styles.stamp} aria-hidden="true">
              Shipped
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
