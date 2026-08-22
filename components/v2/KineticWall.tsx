"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ViewportGif, ViewportVideo } from "./ViewportMedia";

interface GalleryItem { id: string; image_url: string; title: string | null; }
const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");
const isGifUrl = (url: string) => /\.gif(\?|$)/i.test(url);
const optimized = (url: string) => url.includes("cloudinary.com") ? url.replace("/upload/", "/upload/f_auto,q_auto,w_1400,dpr_auto/") : url;
const poster = (url: string) => url.includes("/video/upload/") ? url.replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto,w_1400/").replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg$2") : undefined;

function Media({ item, priority = false }: { item: GalleryItem; priority?: boolean }) {
  const alt = item.title || "Interface design exploration";
  if (isVideoUrl(item.image_url)) return <ViewportVideo src={item.image_url} poster={poster(item.image_url)} ariaLabel={alt} eager={priority} />;
  if (isGifUrl(item.image_url)) return <ViewportGif src={item.image_url} alt={alt} />;
  return <Image src={optimized(item.image_url)} alt={alt} fill priority={priority} quality={90} sizes="(max-width: 700px) 82vw, 38vw" />;
}

export default function KineticWall() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await createClient().from("gallery_images").select("id, image_url, title, display_order").order("display_order", { ascending: true }).limit(6);
      if (data) setItems(data as GalleryItem[]);
    };
    void load();
  }, []);
  if (!items.length) return null;

  return (
    <section className="ui-lab" id="interface-title" aria-labelledby="ui-lab-title">
      <div className="ui-lab-glow" aria-hidden="true" />
      <header className="ui-lab-header">
        <div>
          <span>Playground</span>
          <h2 id="ui-lab-title">UI explorations,<br />always in motion.</h2>
        </div>
        <Link href="/playground">View all shots <ArrowUpRight aria-hidden="true" /></Link>
      </header>

      <div className="ui-lab-stage">
        <div className="ui-lab-orbit" aria-hidden="true" />
        <div className="ui-lab-track">
          {[...items, ...items].map((item, index) => (
            <figure className="ui-lab-shot" key={`${item.id}-${index}`} aria-hidden={index >= items.length}>
              <Media item={item} priority={index === 0} />
            </figure>
          ))}
        </div>
      </div>

      <Link className="ui-lab-mobile-link" href="/playground">View all shots <ArrowUpRight aria-hidden="true" /></Link>
    </section>
  );
}
