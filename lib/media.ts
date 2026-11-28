export const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");
export const isGifUrl = (url: string) => /\.gif(\?|$)/i.test(url) || /[?&,]f_gif(?:[,&]|$)/i.test(url);

export const getOptimizedImageUrl = (url: string, width = 1200) =>
  url.includes("cloudinary.com") ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},dpr_auto/`) : url;

// Cap delivered width: the source files are full-resolution screen recordings.
export const getOptimizedVideoUrl = (url: string, width: 720 | 1280 | 1600 = 1280) =>
  (url.includes("cloudinary.com") && url.includes("/video/upload/")
    ? url.replace("/video/upload/", `/video/upload/f_auto,q_auto:eco,c_limit,w_${width}/`)
    : url);

// Posters are a plain attribute, so they cannot be responsive. Send a card-sized WebP/AVIF instead of the full JPEG.
export const getVideoPoster = (url: string, width = 828) => {
  if (!url.includes("cloudinary.com") || !url.includes("/video/upload/")) return undefined;
  return url
    .replace("/video/upload/", `/video/upload/so_0,f_auto,q_auto,w_${width}/`)
    .replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg$2");
};

export const displayDomain = (url: string | null) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
