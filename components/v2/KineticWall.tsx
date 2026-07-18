"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

/* ── Types ─────────────────────────────────────── */
interface GalleryItem {
  id: string;
  image_url: string;
  display_order: number;
  title: string | null;
  description: string | null;
  project_id: string | null;
  projectSlug: string | null;
}

/* ── Helpers ───────────────────────────────────── */
const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const getOptimizedUrl = (url: string, width: number = 800) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},dpr_auto/`);
};

const pad = (n: number) => String(n).padStart(2, "0");

const WALL_TRANSITION_MS = 700;
const WHEEL_QUIET_MS = 140;

const applyWallImageRatio = (image: HTMLImageElement | null) => {
  if (!image?.naturalWidth || !image.naturalHeight) return;

  const card = image.closest<HTMLElement>(".wall-card");
  if (!card) return;

  const ratio = image.naturalWidth / image.naturalHeight;
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const mobile = window.innerWidth <= 700;
  const maxWidth = mobile
    ? Math.min(window.innerWidth - 32, 380)
    : Math.min(window.innerWidth * 0.48, 720);
  let maxHeight = Math.min(viewportHeight * 0.62, 620);

  if (mobile) {
    const copy = card
      .closest<HTMLElement>(".kinetic-wall")
      ?.querySelector<HTMLElement>(".wall-copy");
    const copyBottom = copy
      ? copy.offsetTop + copy.offsetHeight
      : viewportHeight * 0.38;
    const safeTop = Math.max(copyBottom + 24, viewportHeight * 0.39);
    const safeBottom = viewportHeight - 52;
    const availableHeight = Math.max(
      safeBottom - safeTop,
      viewportHeight * 0.28
    );

    maxHeight = Math.min(availableHeight, viewportHeight * 0.52, 460);
    card.style.setProperty(
      "--wall-card-top",
      `${Math.round(safeTop + (safeBottom - safeTop) / 2)}px`
    );
  }

  let width = maxWidth;
  let height = width / ratio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }

  card.style.setProperty("--wall-card-ratio", String(ratio));
  card.style.setProperty("--wall-card-width", `${Math.round(width)}px`);
  card.style.setProperty("--wall-card-height", `${Math.round(height)}px`);
  window.dispatchEvent(new Event("portfolio:layout"));
};

/* ── 3D state calculator ──────────────────────── */
interface CardState {
  x: number;
  y: number;
  z: number;
  s: number;
  rx: number;
  ry: number;
  rz: number;
  o: number;
}

const wallState = (
  position: number,
  index: number,
  mobile: boolean
): CardState => {
  const vw = window.innerWidth / 100;
  const vh = (window.visualViewport?.height ?? window.innerHeight) / 100;

  const active: CardState = { x: mobile ? 0 : 8 * vw, y: mobile ? 0 : 4 * vh, z: 160, s: 1, rx: 0, ry: mobile ? 0 : -2, rz: 0, o: 1 };
  const previous: CardState = { x: mobile ? -66 * vw : -48 * vw, y: 33 * vh, z: -410, s: mobile ? 0.25 : 0.22, rx: 2, ry: 11, rz: -8, o: 0.34 };
  const next: CardState = { x: mobile ? 64 * vw : 34 * vw, y: 25 * vh, z: -300, s: mobile ? 0.36 : 0.46, rx: -8, ry: -13, rz: 8, o: 0.52 };
  if (position >= -1 && position <= 0) {
    const t = position + 1;
    return Object.fromEntries(
      Object.keys(active).map((key) => [
        key,
        mix(previous[key as keyof CardState], active[key as keyof CardState], t),
      ])
    ) as unknown as CardState;
  }
  if (position > 0 && position <= 1) {
    const t = position;
    return Object.fromEntries(
      Object.keys(active).map((key) => [
        key,
        mix(active[key as keyof CardState], next[key as keyof CardState], t),
      ])
    ) as unknown as CardState;
  }
  if (position < -1) {
    return {
      x: (mobile ? -72 : -51) * vw + (index % 3) * (mobile ? 6 : 9) * vw,
      y: (36 - (index % 2) * 7) * vh,
      z: -520 - Math.abs(position) * 30,
      s: mobile ? 0.16 : 0.18,
      rx: 4,
      ry: 14,
      rz: -10 + (index % 3) * 4,
      o: 0.18 + (index % 2) * 0.08,
    };
  }
  return {
    x: (mobile ? 72 : 40) * vw + (position - 1) * (mobile ? 8 : 7) * vw,
    y: (-24 + (index % 3) * 19) * vh,
    z: -500 - position * 35,
    s: mobile ? 0.2 : 0.28,
    rx: -10,
    ry: -15,
    rz: 9 - (index % 3) * 3,
    o: 0.18 + (index % 2) * 0.08,
  };
};

/* ── Component ─────────────────────────────────── */
export default function KineticWall() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const numberRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLElement>(null);
  const wheelLockedRef = useRef(false);
  const wheelUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelTransitionEndRef = useRef(0);
  const scrollAnimationRef = useRef<number | null>(null);
  const snapIndexRef = useRef<number | null>(null);

  /* ── Fetch gallery_images with projects join ──── */
  useEffect(() => {
    const fetchGallery = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("gallery_images")
        .select("*, projects(slug)")
        .order("display_order", { ascending: true });

      if (data && data.length > 0) {
        const mapped: GalleryItem[] = data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          image_url: row.image_url as string,
          display_order: row.display_order as number,
          title: (row.title as string) || null,
          description: (row.description as string) || null,
          project_id: (row.project_id as string) || null,
          projectSlug:
            row.projects &&
            typeof row.projects === "object" &&
            !Array.isArray(row.projects)
              ? ((row.projects as Record<string, unknown>).slug as string) || null
              : null,
        }));
        setItems(mapped);
        window.requestAnimationFrame(() => {
          window.dispatchEvent(new Event("portfolio:layout"));
        });
      }
      setLoading(false);
    };
    fetchGallery();
  }, []);

  /* ── Scroll-driven animation ────────────────── */
  const animate = useCallback(() => {
    const section = sectionRef.current;
    if (!section || items.length === 0) return;

    const sectionHeight = section.offsetHeight;
    const viewH = window.visualViewport?.height ?? window.innerHeight;
    section.style.setProperty("--wall-viewport-height", `${viewH}px`);
    const distance = sectionHeight - viewH;
    const localScroll = window.scrollY - section.offsetTop;
    const inside =
      localScroll > -70 && localScroll < distance + viewH - 70;
    const sticky = stickyRef.current;

    const header = document.querySelector(".site-header");
    header?.classList.toggle("on-wall", inside);

    sticky?.classList.toggle(
      "is-fixed",
      localScroll >= 0 && localScroll < distance
    );
    sticky?.classList.toggle("is-ended", localScroll >= distance);

    const mobile = window.innerWidth < 700;
    const amount = clamp(localScroll / distance);

    const rawIndex = amount * (items.length - 1);
    // During a discrete wheel transition, focus the destination immediately
    // instead of waiting for rawIndex to cross the rounding midpoint.
    const selectedIndex = snapIndexRef.current ?? Math.round(rawIndex);

    // Update number display
    if (numberRef.current) {
      numberRef.current.textContent = pad(selectedIndex + 1);
    }
    if (currentRef.current) {
      currentRef.current.textContent = pad(selectedIndex + 1);
    }

    // Update progress bar
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${amount})`;
    }

    // Update active card info
    if (selectedIndex !== activeIndexRef.current) {
      activeIndexRef.current = selectedIndex;
      setActiveIndex(selectedIndex);
    }

    // Position each card
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const pos = i - rawIndex;
      const state = wallState(pos, i, mobile);

      card.style.setProperty("--wx", `${state.x}px`);
      card.style.setProperty("--wy", `${state.y}px`);
      card.style.setProperty("--wz", `${state.z}px`);
      card.style.setProperty("--ws", `${state.s}`);
      card.style.setProperty("--wrx", `${state.rx}deg`);
      card.style.setProperty("--wry", `${state.ry}deg`);
      card.style.setProperty("--wrz", `${state.rz}deg`);
      card.style.setProperty("--wo", `${state.o}`);
      card.style.zIndex = String(Math.round(state.z + 1000));

      if (i === selectedIndex) {
        card.classList.add("is-active");
      } else {
        card.classList.remove("is-active");
      }
    });

  }, [items]);

  useEffect(() => {
    const copy = sectionRef.current?.querySelector<HTMLElement>(".wall-copy");
    if (!copy) return;

    copy.classList.remove("changing");
    void copy.offsetWidth;
    copy.classList.add("changing");
  }, [activeIndex]);

  useEffect(() => {
    if (items.length === 0) return;

    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("scroll", onScroll);
    // Initial calculation runs on the next frame so layout is fully settled.
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("touchmove", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [animate, items]);

  /* One wheel gesture advances exactly one gallery item. */
  useEffect(() => {
    if (items.length < 2) return;

    const animateScrollTo = (targetTop: number) => {
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }

      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      const startTop = window.scrollY;
      const distanceToTarget = targetTop - startTop;
      const startedAt = performance.now();

      // The global stylesheet enables smooth scrolling. Disable it while this
      // animation owns the scroll position so every frame remains deterministic.
      root.style.scrollBehavior = "auto";

      const step = (now: number) => {
        const progress = clamp((now - startedAt) / WALL_TRANSITION_MS);
        const eased = 1 - Math.pow(1 - progress, 4);
        window.scrollTo(0, startTop + distanceToTarget * eased);
        animate();

        if (progress < 1) {
          scrollAnimationRef.current = requestAnimationFrame(step);
          return;
        }

        // Finish on the exact index position so the selected card receives the
        // full active state instead of a rounded, in-between state.
        window.scrollTo(0, targetTop);
        snapIndexRef.current = null;
        animate();
        root.style.scrollBehavior = previousScrollBehavior;
        scrollAnimationRef.current = null;
      };

      scrollAnimationRef.current = requestAnimationFrame(step);
    };

    const scheduleWheelUnlock = () => {
      if (wheelUnlockTimerRef.current) {
        clearTimeout(wheelUnlockTimerRef.current);
      }

      const transitionRemaining = Math.max(
        0,
        wheelTransitionEndRef.current - performance.now()
      );
      wheelUnlockTimerRef.current = setTimeout(() => {
        wheelLockedRef.current = false;
        wheelUnlockTimerRef.current = null;
      }, Math.max(WHEEL_QUIET_MS, transitionRemaining));
    };

    const handleWheel = (event: WheelEvent) => {
      const section = sectionRef.current;
      if (!section || Math.abs(event.deltaY) < 2) return;

      const viewH = window.visualViewport?.height ?? window.innerHeight;
      const distance = section.offsetHeight - viewH;
      if (distance <= 0) return;

      const localScroll = window.scrollY - section.offsetTop;
      const withinWall = localScroll >= -1 && localScroll <= distance + 1;
      if (!withinWall) return;

      const direction = event.deltaY > 0 ? 1 : -1;
      const currentIndex = activeIndexRef.current;
      const leavingAtStart = direction < 0 && currentIndex === 0;
      const leavingAtEnd = direction > 0 && currentIndex === items.length - 1;

      // At either end, return control to normal page scrolling.
      if (!wheelLockedRef.current && (leavingAtStart || leavingAtEnd)) return;

      event.preventDefault();

      // Consume the inertial tail of the same wheel/trackpad gesture.
      if (wheelLockedRef.current) {
        scheduleWheelUnlock();
        return;
      }

      const nextIndex = clamp(
        currentIndex + direction,
        0,
        items.length - 1
      );
      const targetTop =
        section.offsetTop + (nextIndex / (items.length - 1)) * distance;

      wheelLockedRef.current = true;
      wheelTransitionEndRef.current = performance.now() + WALL_TRANSITION_MS;
      snapIndexRef.current = nextIndex;
      scheduleWheelUnlock();
      animateScrollTo(targetTop);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (wheelUnlockTimerRef.current) {
        clearTimeout(wheelUnlockTimerRef.current);
        wheelUnlockTimerRef.current = null;
      }
      if (scrollAnimationRef.current !== null) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
        document.documentElement.style.scrollBehavior = "";
      }
      snapIndexRef.current = null;
      wheelLockedRef.current = false;
    };
  }, [animate, items]);

  useEffect(() => {
    const images = cardRefs.current
      .map((card) => card?.querySelector<HTMLImageElement>("img"))
      .filter((image): image is HTMLImageElement => Boolean(image));
    const syncRatio = (event: Event) =>
      applyWallImageRatio(event.currentTarget as HTMLImageElement);

    images.forEach((image) => {
      image.addEventListener("load", syncRatio);
      if (image.complete) applyWallImageRatio(image);
    });

    const syncAllRatios = () => {
      images.forEach((image) => applyWallImageRatio(image));
    };

    window.addEventListener("resize", syncAllRatios, { passive: true });
    window.visualViewport?.addEventListener("resize", syncAllRatios);

    return () => {
      images.forEach((image) => image.removeEventListener("load", syncRatio));
      window.removeEventListener("resize", syncAllRatios);
      window.visualViewport?.removeEventListener("resize", syncAllRatios);
    };
  }, [items]);

  /* ── Pointer-move parallax on active card ────── */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handlePointerMove = (e: PointerEvent) => {
      const activeCard = cardRefs.current[activeIndexRef.current];
      if (!activeCard) return;
      const surface = activeCard.querySelector<HTMLElement>(".wall-surface");
      if (!surface) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 5;
      const y = (e.clientY / window.innerHeight - 0.5) * -5;

      surface.style.setProperty("--pointer-x", `${x}deg`);
      surface.style.setProperty("--pointer-y", `${y}deg`);
    };

    const handlePointerLeave = () => {
      cardRefs.current.forEach((card) => {
        const surface = card?.querySelector<HTMLElement>(".wall-surface");
        surface?.style.setProperty("--pointer-x", "0deg");
        surface?.style.setProperty("--pointer-y", "0deg");
      });
    };

    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [items]);

  /* ── Don't render until data is ready ─────────── */
  if (loading) return null;
  if (items.length === 0) return null;

  const activeItem = items[activeIndex] || items[0];
  const count = items.length;
  const wallStyle = {
    "--wall-height": `${count * 100 + 10}vh`,
    "--wall-mobile-height": `${count * 90 + 20}vh`,
  } as CSSProperties;
  const activeType = activeItem.projectSlug
    ? `${activeItem.projectSlug.replace(/-/g, " ")} / Case study`
    : "Interface / Study";

  return (
    <section
      className="kinetic-wall kinetic-wall-forced"
      id="interface-title"
      data-wall=""
      ref={sectionRef}
      style={wallStyle}
    >
      <div className="wall-sticky" ref={stickyRef}>
        {/* Background grid */}
        <div className="wall-grid" aria-hidden="true" />

        {/* Large number */}
        <div className="wall-number" data-wall-number="" ref={numberRef}>
          01
        </div>

        {/* Heading */}
        <header className="wall-heading">
          <span>
            Interface archive / 01-{pad(count)}
          </span>
          <h2>
            Product thinking,
            <br />
            in motion.
          </h2>
        </header>

        {/* Active card copy */}
        <div className="wall-copy" data-wall-copy="">
          <span data-wall-type="">{activeType}</span>
          <strong data-wall-title="">
            {activeItem.title || "Untitled work"}
          </strong>
          <p data-wall-note="">
            {activeItem.description || "A design exploration."}
          </p>
          {activeItem.projectSlug && (
            <Link
              data-wall-link=""
              href={`/projects/${activeItem.projectSlug}`}
            >
              Open case study
              <i className="arrow-icon arrow-out" aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* 3D card stage */}
        <div className="wall-stage" data-wall-stage="" ref={stageRef}>
          {items.map((item, index) => {
            const hasProject = Boolean(item.projectSlug);
            const cardClass = "wall-card wall-gallery-card";
            const cardStyle = {
              "--wall-card-ratio": 4 / 3,
              "--wall-card-width": "min(680px, 48vw)",
              "--wall-card-height": "min(440px, 33vw)",
            } as CSSProperties;

            const cardContent = (
              <div
                className="wall-surface wall-image-surface"
              >
                <Image
                  src={getOptimizedUrl(item.image_url, 1200)}
                  alt={item.title || "Gallery work"}
                  fill
                  className="object-contain"
                  quality={90}
                  priority={index === 0}
                  sizes="(max-width: 700px) calc(100vw - 32px), 48vw"
                  ref={(image) => {
                    if (image?.complete) applyWallImageRatio(image);
                  }}
                  onLoad={(event) => applyWallImageRatio(event.currentTarget)}
                />
              </div>
            );

            if (hasProject) {
              return (
                <Link
                  key={item.id}
                  className={cardClass}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  data-index={pad(index + 1)}
                  data-type={item.projectSlug || "Interface study"}
                  data-title={item.title || "Untitled work"}
                  data-note={item.description || "A design exploration."}
                  href={`/projects/${item.projectSlug}`}
                  style={cardStyle}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div
                key={item.id}
                className={cardClass}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                data-index={pad(index + 1)}
                data-type="Interface study"
                data-title={item.title || "Untitled work"}
                data-note={item.description || "A design exploration."}
                style={cardStyle}
              >
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Bottom status bar */}
        <div className="wall-status">
          <span data-wall-current="" ref={currentRef}>
            01
          </span>
          <i>
            <b data-wall-progress="" ref={progressRef} />
          </i>
          <span>{pad(count)}</span>
        </div>

        <div className="wall-archive-label">
          Past interfaces collapse into archive
        </div>
        <div className="wall-instruction">
          Scroll to reorganize
          <span className="arrow-icon arrow-down" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
