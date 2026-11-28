"use client";

import Image, { type ImageProps } from "next/image";
import cloudinaryLoader, { isCloudinaryImage } from "@/lib/image-loader";

// Drop-in for next/image. Cloudinary images are resized by Cloudinary, so they never use
// the hosting platform's image optimizer. Local files and other hosts keep the default.
export default function Img({ alt, ...props }: ImageProps) {
  if (!props.unoptimized && typeof props.src === "string" && isCloudinaryImage(props.src)) {
    return <Image alt={alt} {...props} loader={cloudinaryLoader} />;
  }
  return <Image alt={alt} {...props} />;
}
