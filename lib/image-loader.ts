// Resizes Cloudinary images on Cloudinary itself, which is free and never runs on the
// hosting platform. Used by components/Img.tsx for Cloudinary sources only.
type LoaderProps = { src: string; width: number; quality?: number };

export const isCloudinaryImage = (src: string) =>
  src.includes("res.cloudinary.com") && src.includes("/image/upload/");

// A transform segment looks like "f_auto,q_auto,w_1600" (letters, underscore, value).
const TRANSFORM_SEGMENT = /^[a-z]{1,3}_[^/]*$/;

export default function cloudinaryLoader({ src, width, quality }: LoaderProps) {
  const [base, rest] = src.split("/image/upload/");
  const segments = rest.split("/");
  // Keep any transforms already in the URL and add the resize after them. Cloudinary
  // applies chained transforms in order, so resizing last means the final width wins.
  let index = 0;
  while (index < segments.length - 1 && TRANSFORM_SEGMENT.test(segments[index])) index += 1;
  const resize = `f_auto,${quality ? `q_${quality}` : "q_auto"},w_${width},c_limit`;
  segments.splice(index, 0, resize);
  return `${base}/image/upload/${segments.join("/")}`;
}
