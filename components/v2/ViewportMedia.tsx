"use client";

import { useEffect, useRef, useState } from "react";

const MEDIA_LOAD_MARGIN = "600px 0px";
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
  const [active, setActive] = useState(eager);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || eager) return;

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: MEDIA_LOAD_MARGIN }
    );

    loadObserver.observe(video);
    return () => loadObserver.disconnect();
  }, [eager]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active) return;

    const play = () => void video.play().catch(() => undefined);
    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) play();
        else video.pause();
      },
      { threshold: [0, 0.15, 0.5] }
    );

    playObserver.observe(video);
    return () => {
      playObserver.disconnect();
      video.pause();
    };
  }, [active, src]);

  return (
    <video
      ref={videoRef}
      src={active ? src : undefined}
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
  eager?: boolean;
  onMediaLoad?: (image: HTMLImageElement) => void;
}

export function ViewportGif({ src, alt, className, eager = false, onMediaLoad }: ViewportGifProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(eager);

  useEffect(() => {
    const image = imageRef.current;
    if (!image || eager) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: MEDIA_LOAD_MARGIN }
    );

    observer.observe(image);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <img
      ref={imageRef}
      data-viewport-gif=""
      src={active ? src : TRANSPARENT_GIF}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onLoad={(event) => {
        if (active) onMediaLoad?.(event.currentTarget);
      }}
    />
  );
}
