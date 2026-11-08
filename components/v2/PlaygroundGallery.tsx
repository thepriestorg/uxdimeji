"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ViewportGif, ViewportVideo } from "./ViewportMedia";
import styles from "@/app/playground/Playground.module.css";

interface GalleryItem { id: string; image_url: string; title: string | null; }
const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");
const isGifUrl = (url: string) => /\.gif(\?|$)/i.test(url);
const optimized = (url: string, w = 1000) => url.includes("cloudinary.com") ? url.replace("/upload/", `/upload/f_auto,q_auto:eco,w_${w},c_limit/`) : url;
const optimizedVideo = (url: string) => url.includes("cloudinary.com") && url.includes("/video/upload/") ? url.replace("/video/upload/", "/video/upload/q_auto:eco,vc_auto,w_1000,c_limit/") : url;
const poster = (url: string) => url.includes("/video/upload/") ? url.replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto:eco,w_1000,c_limit/").replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg$2") : undefined;

export default function PlaygroundGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await createClient().from("gallery_images").select("id, image_url, title, display_order").order("display_order", { ascending: true });
      if (data) setItems(data as GalleryItem[]);
      setLoaded(true);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!loaded) return <div className={styles.loading} aria-label="Loading interface shots"><i /><i /><i /><i /></div>;
  if (!items.length) return <p className={styles.empty}>New interface shots are on the way.</p>;

  return (
    <>
      <p className={styles.count}>{String(items.length).padStart(2, "0")} pieces</p>
      <section className={styles.gallery} aria-label="Interface studies">
        {items.map((item, index) => {
          const alt = item.title || "Interface design exploration";
          const video = isVideoUrl(item.image_url);
          return (
            <figure className={styles.shot} key={item.id} style={{ "--shot-index": index } as React.CSSProperties}>
              <div className={styles.frame}>
                {video ? (
                  <ViewportVideo src={optimizedVideo(item.image_url)} poster={poster(item.image_url)} ariaLabel={alt} eager={index < 2} />
                ) : isGifUrl(item.image_url) ? (
                  <ViewportGif src={optimized(item.image_url)} alt={alt} eager={index < 2} />
                ) : (
                  <button type="button" className={styles.zoom} onClick={() => setOpen(item)} aria-label={`Enlarge ${alt}`}>
                    <Image src={optimized(item.image_url)} alt={alt} width={1600} height={1200} quality={75} priority={index < 2} sizes="(max-width: 760px) 100vw, 580px" />
                  </button>
                )}
              </div>
              {item.title && (
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.title}
                </figcaption>
              )}
            </figure>
          );
        })}
      </section>

      {open && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={open.title || "Interface study"} onClick={() => setOpen(null)}>
          <button type="button" className={styles.close} onClick={() => setOpen(null)} aria-label="Close">
            <X aria-hidden="true" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={optimized(open.image_url, 2000)} alt={open.title || "Interface design exploration"} onClick={(event) => event.stopPropagation()} />
          {open.title && <p>{open.title}</p>}
        </div>
      )}
    </>
  );
}
