"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ViewportGif, ViewportVideo } from "./ViewportMedia";

interface GalleryItem { id: string; image_url: string; title: string | null; }
const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");
const isGifUrl = (url: string) => /\.gif(\?|$)/i.test(url);
const optimized = (url: string) => url.includes("cloudinary.com") ? url.replace("/upload/", "/upload/f_auto,q_auto,w_1600,dpr_auto/") : url;
const poster = (url: string) => url.includes("/video/upload/") ? url.replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto,w_1600/").replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg$2") : undefined;

export default function PlaygroundGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const load = async () => {
      const { data } = await createClient().from("gallery_images").select("id, image_url, title, display_order").order("display_order", { ascending: true });
      if (data) setItems(data as GalleryItem[]);
      setLoaded(true);
    };
    void load();
  }, []);
  if (!loaded) return <div className="playground-loading" aria-label="Loading interface shots" />;
  if (!items.length) return <p className="playground-empty">New interface shots are on the way.</p>;
  return (
    <div className="playground-grid">
      {items.map((item, index) => {
        const alt = item.title || "Interface design exploration";
        return (
          <figure className="playground-shot" key={item.id}>
            {isVideoUrl(item.image_url) ? <ViewportVideo src={item.image_url} poster={poster(item.image_url)} ariaLabel={alt} eager={index < 2} /> : isGifUrl(item.image_url) ? <ViewportGif src={item.image_url} alt={alt} /> : <Image src={optimized(item.image_url)} alt={alt} fill quality={92} priority={index < 2} sizes="(max-width: 720px) 100vw, 50vw" />}
          </figure>
        );
      })}
    </div>
  );
}
