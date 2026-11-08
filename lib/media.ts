import { getLocalPoster, getLocalVideo, type LocalVideoWidth } from "@/lib/local-media";

export const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");
export const isGifUrl = (url: string) => /\.gif(\?|$)/i.test(url) || /[?&,]f_gif(?:[,&]|$)/i.test(url);

export const getOptimizedImageUrl = (url: string, width = 1200) =>
  url.includes("cloudinary.com") ? url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},dpr_auto/`) : url;

// Cap delivered width: the source files are full-resolution screen recordings.
export const getOptimizedVideoUrl = (url: string, width: LocalVideoWidth = 1280) =>
  getLocalVideo(url, width) ??
  (url.includes("cloudinary.com") && url.includes("/video/upload/")
    ? url.replace("/video/upload/", `/video/upload/f_auto,q_auto:eco,c_limit,w_${width}/`)
    : url);

export const getVideoPoster = (url: string) => {
  const localPoster = getLocalPoster(url);
  if (localPoster) return localPoster;
  if (!url.includes("cloudinary.com") || !url.includes("/video/upload/")) return undefined;
  return url
    .replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto,w_1200/")
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
