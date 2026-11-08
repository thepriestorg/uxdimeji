// Small inline marks used in the profile copy: verified tick, flag, Figma and code.

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Verified Designer"
    >
      <path
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
        fill="#0099ff"
      />
      <path
        d="M10.2 16.2L6 12l1.4-1.4 2.8 2.8 6.4-6.4 1.4 1.4-7.8 7.8z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function NigeriaFlag({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 30 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Nigeria Flag"
    >
      <rect width="30" height="20" rx="2.5" fill="#ffffff" />
      <rect width="10" height="20" rx="2.5" fill="#008751" />
      <rect x="20" width="10" height="20" rx="2.5" fill="#008751" />
      <rect
        x="0.5"
        y="0.5"
        width="29"
        height="19"
        rx="2"
        stroke="rgba(0,0,0,0.12)"
      />
    </svg>
  );
}

export function InlineFigmaBadge({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 38 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Figma"
    >
      <path
        d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
        fill="#1ABCFE"
      />
      <path
        d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
        fill="#0ACF83"
      />
      <path
        d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
        fill="#FF7262"
      />
      <path
        d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
        fill="#F24E1E"
      />
      <path
        d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
        fill="#A259FF"
      />
    </svg>
  );
}

export function InlineCodeBadge({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Code"
    >
      <rect width="22" height="22" rx="6" fill="#181816" />
      <rect
        x="0.5"
        y="0.5"
        width="21"
        height="21"
        rx="5.5"
        stroke="rgba(255,255,255,0.12)"
      />
      <path
        d="M7 8L4.5 11L7 14M15 8L17.5 11L15 14M12.5 6.5L9.5 15.5"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

