"use client";

import { useEffect } from "react";

export default function QuoteTools() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>(".article-body blockquote").forEach((quote) => {
      if (quote.querySelector(".quote-copy")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quote-copy";
      button.textContent = "Copy quote";
      button.setAttribute("aria-label", "Copy quote to clipboard");
      const copy = async () => {
        const text = quote.innerText.replace(/Copy quote|Copied/g, "").trim();
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = "Copy quote"; }, 1600);
      };
      button.addEventListener("click", copy);
      quote.appendChild(button);
      cleanups.push(() => {
        button.removeEventListener("click", copy);
        button.remove();
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
