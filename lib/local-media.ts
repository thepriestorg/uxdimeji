// Existing portfolio media is copied into /public/media so it's served by Vercel
// instead of using Cloudinary's bandwidth quota. Anything uploaded later isn't in
// these lists and keeps loading from Cloudinary.
const LOCAL_VIDEOS = new Set([
  "qjdq6vz2rj7gdn7cu0hx",
  "jf2qraqma6htjygvoqpk",
  "ct9hih1cufk8q7tnuxhj",
  "adxsbwv8sokvxcqjhkby",
  "xjfme6olatf04lxc467t",
  "ibkekrleb1pctjax7cif",
  "pqepuhe86foq9mwihijy",
  "cv45tcixlolpwvbad8fy",
  "qmb8rxdsnktw9zdyit6u",
]);
const LOCAL_GIFS = new Set(["bbqfnao8uwwpn5odssub"]);

export type LocalVideoWidth = 720 | 1280 | 1600;

const getPublicId = (url: string) =>
  url.includes("res.cloudinary.com") ? url.match(/\/([^/.?]+)\.[a-z0-9]+(?:\?.*)?$/i)?.[1] : undefined;

export function getLocalVideo(url: string, width: LocalVideoWidth) {
  const id = getPublicId(url);
  return id && LOCAL_VIDEOS.has(id) ? `/media/${id}-${width}.mp4` : undefined;
}

export function getLocalPoster(url: string) {
  const id = getPublicId(url);
  return id && LOCAL_VIDEOS.has(id) ? `/media/${id}-poster.jpg` : undefined;
}

export function getLocalGif(url: string) {
  const id = getPublicId(url);
  return id && LOCAL_GIFS.has(id) ? `/media/${id}.gif` : undefined;
}
