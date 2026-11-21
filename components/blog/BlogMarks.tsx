/* Small marks shared by the Writing index and the article page. */

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" role="img" aria-label="Verified">
      <path
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
        fill="#0099ff"
      />
      <path d="M10.2 16.2L6 12l1.4-1.4 2.8 2.8 6.4-6.4 1.4 1.4-7.8 7.8z" fill="#ffffff" />
    </svg>
  );
}

/* Two loose pen strokes under handwritten text. Uses currentColor so it reads on any background. */
export function UnderlineSketch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 8" fill="none" aria-hidden="true">
      <path d="M2 3C22 1.5 48 2 68 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 6.5C26 5 44 5.5 62 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
