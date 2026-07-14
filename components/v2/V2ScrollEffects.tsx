"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function V2ScrollEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = document.querySelector<HTMLElement>(".v2-design");
    if (!root) return;

    const progressBar = document.querySelector<HTMLElement>(".page-progress");
    const updateProgress = () => {
      if (!progressBar) return;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${distance > 0 ? window.scrollY / distance : 0})`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    const context = gsap.context(() => {
      gsap.set(".hero h1", { autoAlpha: 1, y: 0 });
      gsap.set(".hero-line-inner", { yPercent: 118, rotate: 1.5 });
      gsap.set(".hero-index, .hero-support, .hero-capabilities", {
        autoAlpha: 0,
        y: 24,
      });

      const opening = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      opening
        .fromTo(
          ".page-intro-mark",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.65 }
        )
        .to(".page-intro-line", { scaleX: 1, duration: 0.75 }, 0.12)
        .to(".page-intro", {
          yPercent: -100,
          duration: 1.05,
          ease: "expo.inOut",
        }, 0.82)
        .set(".page-intro", { display: "none" })
        .from(".site-header", {
          autoAlpha: 0,
          y: -24,
          duration: 0.75,
        }, 1.35)
        .to(".hero-index", { autoAlpha: 1, y: 0, duration: 0.7 }, 1.42)
        .to(".hero-line-inner", {
          yPercent: 0,
          rotate: 0,
          duration: 1.15,
          stagger: 0.12,
          ease: "expo.out",
        }, 1.48)
        .to(".hero-support", { autoAlpha: 1, y: 0, duration: 0.8 }, 1.88)
        .to(".hero-capabilities", { autoAlpha: 1, y: 0, duration: 0.75 }, 2)
        .from(".hero-capabilities span", {
          autoAlpha: 0,
          y: 12,
          duration: 0.55,
          stagger: 0.08,
        }, 2.05);

      gsap.to(".hero-copy", {
        yPercent: -10,
        scale: 0.965,
        opacity: 0.18,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      document.querySelectorAll<HTMLElement>(".section-intro").forEach((intro) => {
        const eyebrow = intro.querySelector(".eyebrow");
        const heading = intro.querySelector("h2");
        gsap.set(intro, { autoAlpha: 1, y: 0 });

        if (eyebrow) {
          gsap.from(eyebrow, {
            autoAlpha: 0,
            x: -30,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: intro, start: "top 82%", once: true },
          });
        }

        if (heading) {
          gsap.from(heading, {
            autoAlpha: 0,
            y: 70,
            clipPath: "inset(0 0 100% 0)",
            duration: 1.15,
            ease: "expo.out",
            scrollTrigger: { trigger: intro, start: "top 80%", once: true },
          });
        }
      });

      document.querySelectorAll<HTMLElement>(".project-row").forEach((row) => {
        const visual = row.querySelector<HTMLElement>(".project-visual");
        const copy = row.querySelector<HTMLElement>(".project-copy");
        const copyItems = copy
          ? Array.from(copy.children) as HTMLElement[]
          : [];

        gsap.set(row, { autoAlpha: 1, y: 0 });

        if (visual) {
          gsap.from(visual, {
            autoAlpha: 0,
            y: 55,
            clipPath: "inset(0 0 100% 0)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: row, start: "top 78%", once: true },
          });
        }

        if (copyItems.length > 0) {
          gsap.from(copyItems, {
            autoAlpha: 0,
            x: 34,
            duration: 0.8,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 72%", once: true },
          });
        }
      });

      gsap.set(".profile-statement, .profile-detail, .profile-journey, .practice-list", {
        autoAlpha: 1,
        y: 0,
      });

      gsap.from(".profile-statement", {
        autoAlpha: 0,
        y: 70,
        duration: 1.1,
        ease: "expo.out",
        immediateRender: false,
        scrollTrigger: { trigger: ".profile-grid", start: "top 76%", once: true },
      });

      gsap.from(".profile-detail p", {
        autoAlpha: 0,
        y: 30,
        duration: 0.75,
        stagger: 0.13,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: ".profile-detail", start: "top 82%", once: true },
      });

      gsap.from(".profile-journey path", {
        strokeDashoffset: 420,
        duration: 1.45,
        ease: "power2.out",
        scrollTrigger: { trigger: ".profile-journey", start: "top 84%", once: true },
      });

      gsap.from(".journey-point", {
        autoAlpha: 0,
        y: 26,
        duration: 0.75,
        stagger: 0.14,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: ".profile-journey", start: "top 82%", once: true },
      });

      gsap.from(".practice-list > div", {
        autoAlpha: 0,
        y: 45,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".practice-list", start: "top 84%", once: true },
      });

      gsap.set(".contact .eyebrow, .contact-main", { autoAlpha: 1, y: 0 });
      gsap.from(".contact .eyebrow", {
        autoAlpha: 0,
        x: -28,
        duration: 0.8,
        scrollTrigger: { trigger: ".contact", start: "top 72%", once: true },
      });
      gsap.from(".contact-main h2", {
        autoAlpha: 0,
        y: 90,
        rotate: 1.5,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: ".contact-main", start: "top 75%", once: true },
      });
      gsap.from(".contact-main a, .contact-foot", {
        autoAlpha: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.13,
        ease: "power3.out",
        scrollTrigger: { trigger: ".contact-main", start: "top 62%", once: true },
      });

      gsap.from(".site-footer > *", {
        autoAlpha: 0,
        y: 18,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".site-footer", start: "top 96%", once: true },
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("portfolio:layout", refresh);
    window.addEventListener("load", refresh, { once: true });

    // ─── Repair Pass ────────────────────────────────────────────────────────
    // When a page loads in a background tab, browsers suspend layout/paint, so
    // ScrollTrigger measures elements at wrong positions. With `once: true`,
    // the trigger is permanently destroyed after firing — even if it fired with
    // bad data and left the element stuck at opacity:0 / visibility:hidden.
    //
    // After every refresh we scan ALL GSAP-animated targets. If an element
    // still has GSAP's inline opacity<0.5 or visibility:hidden, we know the
    // animation never completed properly, so we force it in.
    // This is the guaranteed safety net that makes the animations bulletproof.
    const REPAIR_SELECTORS = [
      ".section-intro .eyebrow",
      ".section-intro h2",
      ".project-visual",
      ".project-copy > *",
      ".profile-statement",
      ".profile-detail p",
      ".journey-point",
      ".practice-list > div",
      ".contact .eyebrow",
      ".contact-main h2",
      ".contact-main a",
      ".contact-foot",
      ".site-footer > *",
    ];

    const runRepairPass = () => {
      REPAIR_SELECTORS.forEach((sel) => {
        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
          const opacity = parseFloat(el.style.opacity ?? "");
          const isHidden =
            el.style.visibility === "hidden" ||
            (!isNaN(opacity) && opacity < 0.5);
          if (isHidden) {
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              x: 0,
              rotate: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.55,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        });
      });
    };

    // Run after initial settle — catches pages that loaded while tab was hidden
    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
      window.setTimeout(runRepairPass, 400);
    }, 1200);

    // Run every time the user switches back to this tab
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        ScrollTrigger.refresh();
        window.setTimeout(runRepairPass, 400);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    document.querySelectorAll("[data-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("portfolio:layout", refresh);
      window.removeEventListener("load", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <div className="page-intro" aria-hidden="true">
        <div className="page-intro-mark">
          Oladimeji Abubakar / Product designer
        </div>
        <div className="page-intro-line" />
      </div>
      <div className="page-progress" />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
    </>
  );
}
