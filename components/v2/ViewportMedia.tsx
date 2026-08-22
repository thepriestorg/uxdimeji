"use client";

import { useEffect, useRef, useState } from "react";

const MOBILE_MEDIA_QUERY = "(max-width: 700px)";
const TRANSPARENT_GIF =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

interface ViewportVideoProps {
  src: string;
  poster?: string;
  ariaLabel: string;
  className?: string;
  eager?: boolean;
  controls?: boolean;
  onMetadata?: (video: HTMLVideoElement) => void;
}

export function ViewportVideo({
  src,
  poster,
  ariaLabel,
  className,
  eager = false,
  controls = false,
  onMetadata,
}: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => void video.play().catch(() => undefined);
    if (!window.matchMedia(MOBILE_MEDIA_QUERY).matches) {
      play();
      return;
    }

    video.pause();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) play();
        else video.pause();
      },
      { threshold: [0, 0.25, 0.6] }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      aria-label={ariaLabel}
      className={className}
      muted
      loop
      playsInline
      controls={controls}
      preload={eager ? "auto" : "metadata"}
      onLoadedMetadata={(event) => onMetadata?.(event.currentTarget)}
    />
  );
}

interface ViewportGifProps {
  src: string;
  alt: string;
  className?: string;
  onMediaLoad?: (image: HTMLImageElement) => void;
}

export function ViewportGif({ src, alt, className, onMediaLoad }: ViewportGifProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    if (!window.matchMedia(MOBILE_MEDIA_QUERY).matches) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2, 0.6] }
    );

    observer.observe(image);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imageRef}
      data-viewport-gif=""
      src={active ? src : TRANSPARENT_GIF}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={(event) => {
        if (active) onMediaLoad?.(event.currentTarget);
      }}
    />
  );
}
