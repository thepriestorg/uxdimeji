// Shared by the page-view route and the browser tracker so both record the same labels.
export const BOT_PATTERN = /bot|crawler|spider|preview|lighthouse|headless/i;

export function userAgentDetails(value: string) {
  const device = /tablet|ipad/i.test(value)
    ? "Tablet"
    : /mobile|iphone|android/i.test(value)
      ? "Mobile"
      : "Desktop";
  const browser = /edg\//i.test(value)
    ? "Edge"
    : /opr\/|opera/i.test(value)
      ? "Opera"
      : /chrome|crios/i.test(value)
        ? "Chrome"
        : /safari/i.test(value)
          ? "Safari"
          : /firefox|fxios/i.test(value)
            ? "Firefox"
            : "Other";
  const os = /windows/i.test(value)
    ? "Windows"
    : /iphone|ipad|ios/i.test(value)
      ? "iOS"
      : /android/i.test(value)
        ? "Android"
        : /mac os|macintosh/i.test(value)
          ? "macOS"
          : /linux/i.test(value)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}
