"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type * as MatterTypes from "matter-js";

type Matter = typeof MatterTypes;
type Mode = "assembled" | "loose" | "tidying";
type Letter = {
  el: HTMLElement;
  body: MatterTypes.Body;
  // Resting centre of the glyph in footer coordinates; the DOM transform is an offset from it.
  hx: number;
  hy: number;
  tween?: { delay: number; elapsed: number; x: number; y: number; angle: number; turn: number };
};

const STEP = 1000 / 60;
const TIDY_MS = 820;

/**
 * Turns the footer wordmark into physical letters. The name renders as plain text until the
 * engine loads; after that, letters can be grabbed, thrown, swiped, knocked over and tidied
 * back into place. Only runs for browsers the root layout opted into motion.
 */
export function useGravityWordmark(
  footerRef: RefObject<HTMLElement | null>,
  markRef: RefObject<HTMLElement | null>,
  agentRef: RefObject<HTMLElement | null>
) {
  const [ready, setReady] = useState(false);
  const [loose, setLoose] = useState(false);
  const [hint, setHint] = useState(false);
  const [undoKey, setUndoKey] = useState("Ctrl Z");
  const controls = useRef({ knock: () => {}, tidy: () => {} });

  useEffect(() => {
    const footer = footerRef.current;
    const mark = markRef.current;
    if (!footer || !mark || !document.documentElement.hasAttribute("data-build-animate")) return;

    let disposed = false;
    let teardown = () => {};
    // The engine is only fetched once the footer is about a screen away.
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loader.disconnect();
        Promise.all([import("matter-js"), document.fonts.ready])
          .then(([mod]) => {
            if (disposed) return;
            teardown = start(("default" in mod ? mod.default : mod) as Matter, footer, mark);
          })
          .catch((error) => console.warn("Footer physics unavailable.", error));
      },
      { rootMargin: "100% 0px" }
    );
    loader.observe(footer);
    return () => {
      disposed = true;
      loader.disconnect();
      teardown();
    };

    function start(M: Matter, footer: HTMLElement, mark: HTMLElement) {
      const { Engine, Bodies, Body, Composite, Constraint, Sleeping, Vertices } = M;
      const engine = Engine.create({ enableSleeping: true });
      const spans = Array.from(mark.querySelectorAll<HTMLElement>("[data-letter]"));
      const letters: Letter[] = [];
      const measure = document.createElement("canvas").getContext("2d");
      let mode: Mode = "assembled";
      let width = 0;
      let letterHeight = 0;
      let frame = 0;
      let last = 0;
      let lag = 0;
      let footerVisible = false;
      let introPlayed = false;
      let introTimer: ReturnType<typeof setTimeout> | undefined;
      const timers: ReturnType<typeof setTimeout>[] = [];
      let drag: { letter: Letter; constraint: MatterTypes.Constraint; pointerId: number } | null = null;
      let lastMouse: { x: number; y: number; t: number } | null = null;

      const local = (event: PointerEvent) => {
        const rect = footer.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      };

      const render = () => {
        letters.forEach(({ el, body, hx, hy }) => {
          el.style.transform = `translate3d(${(body.position.x - hx).toFixed(2)}px, ${(body.position.y - hy).toFixed(2)}px, 0) rotate(${body.angle.toFixed(4)}rad)`;
        });
      };

      const shouldRun = () =>
        footerVisible &&
        (mode === "tidying" || !!drag || (mode === "loose" && letters.some(({ body }) => !body.isSleeping)));

      const tick = (now: number) => {
        frame = 0;
        const elapsed = Math.min(64, now - last);
        last = now;
        if (mode === "loose") {
          lag += elapsed;
          while (lag >= STEP) {
            Engine.update(engine, STEP);
            lag -= STEP;
          }
        } else if (mode === "tidying") {
          tidyStep(elapsed);
        }
        if (mode !== "assembled") render();
        if (shouldRun()) frame = requestAnimationFrame(tick);
      };

      const wake = () => {
        if (frame || !shouldRun()) return;
        last = performance.now();
        lag = 0;
        frame = requestAnimationFrame(tick);
      };

      const setMode = (next: Mode) => {
        mode = next;
        if (next === "assembled") delete footer.dataset.physics;
        else footer.dataset.physics = next;
        setLoose(next === "loose");
      };

      // Any hands-on play retires the intro and the hint.
      const interacted = () => {
        introPlayed = true;
        clearTimeout(introTimer);
        setHint(false);
      };

      const goLoose = () => {
        letters.forEach((letter) => {
          letter.tween = undefined;
          Sleeping.set(letter.body, false);
        });
        setMode("loose");
        wake();
      };

      const assemble = () => {
        letters.forEach(({ el, body, hx, hy }) => {
          Body.setPosition(body, { x: hx, y: hy });
          Body.setAngle(body, 0);
          Body.setVelocity(body, { x: 0, y: 0 });
          Body.setAngularVelocity(body, 0);
          el.style.transform = "";
        });
        setMode("assembled");
      };

      const build = () => {
        endDrag();
        Composite.clear(engine.world, false);
        letters.length = 0;
        width = footer.clientWidth;
        const markStyle = getComputedStyle(mark);
        const em = parseFloat(markStyle.fontSize);
        if (measure) measure.font = `${markStyle.fontWeight} ${markStyle.fontSize} ${markStyle.fontFamily}`;
        let floor = 0;
        let heights = 0;

        spans.forEach((el) => {
          el.style.transform = "";
          // A zero-size inline box sits on the baseline, so its offset locates the glyph.
          const probe = document.createElement("i");
          probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
          el.append(probe);
          const baseline = probe.offsetTop;
          probe.remove();
          const metrics = measure?.measureText(el.textContent ?? "");
          const top = metrics ? baseline - metrics.actualBoundingBoxAscent : 0;
          const bottom = metrics ? baseline + metrics.actualBoundingBoxDescent : el.offsetHeight;
          const w = el.offsetWidth - em * 0.06;
          const h = bottom - top;
          const hx = mark.offsetLeft + el.offsetLeft + el.offsetWidth / 2;
          const hy = mark.offsetTop + el.offsetTop + (top + bottom) / 2;
          el.style.transformOrigin = `50% ${((top + bottom) / 2).toFixed(2)}px`;
          el.style.setProperty("--glyph-top", `${top.toFixed(2)}px`);
          el.style.setProperty("--glyph-height", `${h.toFixed(2)}px`);
          el.dataset.size = `${Math.round(w)} × ${Math.round(h)}`;
          const body = Bodies.rectangle(hx, hy, w, h, {
            chamfer: { radius: Math.min(w, h) * 0.12 },
            restitution: 0.22,
            friction: 0.55,
            frictionAir: 0.012,
            density: 0.0016,
          });
          letters.push({ el, body, hx, hy });
          floor = Math.max(floor, mark.offsetTop + el.offsetTop + bottom);
          heights += h;
        });

        letterHeight = heights / Math.max(1, letters.length);
        const height = footer.clientHeight;
        const t = 600;
        const wall = { isStatic: true, friction: 0.6, restitution: 0.2 };
        // Anything marked [data-solid] (the sticky notes, the badge) is furniture letters hit.
        const solids = Array.from(footer.querySelectorAll<HTMLElement>("[data-solid]")).flatMap((el) => {
          let x = 0;
          let y = 0;
          let node: HTMLElement | null = el;
          while (node && node !== footer) {
            x += node.offsetLeft;
            y += node.offsetTop;
            node = node.offsetParent as HTMLElement | null;
          }
          if (node !== footer || !el.offsetWidth) return [];
          const cx = x + el.offsetWidth / 2;
          const cy = y + el.offsetHeight / 2;
          if (el.dataset.solid === "circle") return [Bodies.circle(cx, cy, el.offsetWidth / 2, wall)];
          const angle = ((parseFloat(getComputedStyle(el).rotate) || 0) * Math.PI) / 180;
          return [Bodies.rectangle(cx, cy, el.offsetWidth, el.offsetHeight, { ...wall, angle })];
        });
        Composite.add(engine.world, [
          ...solids,
          Bodies.rectangle(width / 2, floor + t / 2, width * 3, t, wall),
          Bodies.rectangle(width / 2, -t / 2, width * 3, t, wall),
          Bodies.rectangle(-t / 2, height / 2, t, height * 3, wall),
          Bodies.rectangle(width + t / 2, height / 2, t, height * 3, wall),
          ...letters.map(({ body }) => body),
        ]);
        assemble();
      };

      // Pops every letter up and away from `originX`, scaled to the letter size.
      const knock = (originX = width / 2) => {
        goLoose();
        const g = engine.gravity.y * engine.gravity.scale * STEP * STEP;
        letters.forEach(({ body, hx }) => {
          const lift = 1.2 + Math.random() * 1.5;
          const spread = ((hx - originX) / Math.max(1, width)) * letterHeight * 0.16;
          Body.setVelocity(body, {
            x: spread + (Math.random() - 0.5) * letterHeight * 0.05,
            y: -Math.sqrt(2 * g * lift * letterHeight),
          });
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
        });
      };

      const tidy = () => {
        if (mode !== "loose") return;
        endDrag();
        letters.forEach((letter, i) => {
          const { x, y } = letter.body.position;
          const angle = letter.body.angle;
          letter.tween = { delay: i * 45, elapsed: 0, x, y, angle, turn: Math.round(angle / (Math.PI * 2)) * Math.PI * 2 };
        });
        setMode("tidying");
        wake();
      };

      // Letters float up and settle back home with a little overshoot.
      const tidyStep = (elapsed: number) => {
        let done = true;
        letters.forEach(({ body, hx, hy, tween }) => {
          if (!tween) return;
          tween.elapsed += elapsed;
          const p = Math.min(1, Math.max(0, (tween.elapsed - tween.delay) / TIDY_MS));
          const c = 1.6;
          const e = 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
          const arc = Math.sin(Math.PI * Math.min(1, p * 1.15)) * letterHeight * 0.5;
          Body.setPosition(body, { x: tween.x + (hx - tween.x) * e, y: tween.y + (hy - tween.y) * e - arc });
          Body.setAngle(body, tween.angle + (tween.turn - tween.angle) * e);
          if (p < 1) done = false;
        });
        if (done) assemble();
      };

      function endDrag() {
        if (!drag) return;
        Composite.remove(engine.world, drag.constraint);
        delete drag.letter.el.dataset.grabbed;
        delete footer.dataset.dragging;
        drag = null;
        window.removeEventListener("pointermove", onDragMove);
        window.removeEventListener("pointerup", onDragEnd);
        window.removeEventListener("pointercancel", onDragEnd);
      }

      function onDragMove(event: PointerEvent) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        const p = local(event);
        drag.constraint.pointA = {
          x: Math.min(width, Math.max(0, p.x)),
          y: Math.min(footer.clientHeight, Math.max(0, p.y)),
        };
      }

      function onDragEnd(event: PointerEvent) {
        if (drag && event.pointerId === drag.pointerId) endDrag();
      }

      const onPointerDown = (event: PointerEvent) => {
        const el = (event.target as Element).closest<HTMLElement>("[data-letter]");
        const letter = letters.find((item) => item.el === el);
        if (!letter || drag || event.button !== 0) return;
        event.preventDefault();
        interacted();
        if (mode !== "loose") goLoose();
        const p = local(event);
        const { body } = letter;
        Sleeping.set(body, false);
        const constraint = Constraint.create({
          pointA: p,
          bodyB: body,
          pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
          length: 0,
          stiffness: 0.2,
          damping: 0.08,
        });
        Composite.add(engine.world, constraint);
        drag = { letter, constraint, pointerId: event.pointerId };
        letter.el.dataset.grabbed = "";
        footer.dataset.dragging = "";
        window.addEventListener("pointermove", onDragMove);
        window.addEventListener("pointerup", onDragEnd);
        window.addEventListener("pointercancel", onDragEnd);
        wake();
      };

      // A fast mouse swipe through a letter shoves it, from the side it was hit.
      const onMouseMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" || drag) return;
        const p = local(event);
        const now = event.timeStamp;
        const prev = lastMouse;
        lastMouse = { ...p, t: now };
        if (!prev || now - prev.t > 80 || now <= prev.t || mode === "tidying") return;
        const vx = (p.x - prev.x) / (now - prev.t);
        const vy = (p.y - prev.y) / (now - prev.t);
        const speed = Math.hypot(vx, vy);
        if (speed < (mode === "assembled" ? 1.6 : 0.35)) return;
        const hit = letters.find(({ body }) => Vertices.contains(body.vertices, p));
        if (!hit) return;
        interacted();
        if (mode === "assembled") goLoose();
        const scale = Math.min(1, 2.4 / speed) * 0.4 * STEP;
        Sleeping.set(hit.body, false);
        Body.applyForce(hit.body, p, {
          x: (hit.body.mass * vx * scale) / (STEP * STEP),
          y: (hit.body.mass * vy * scale) / (STEP * STEP),
        });
        wake();
      };
      const onMouseLeave = () => {
        lastMouse = null;
      };

      // Tilting a phone (portrait, where no permission prompt is needed) tips gravity sideways.
      const onTilt = (event: DeviceOrientationEvent) => {
        if (event.gamma === null || (screen.orientation?.angle ?? 0) !== 0) return;
        const tilt = Math.abs(event.gamma) < 6 ? 0 : Math.sin((event.gamma * Math.PI) / 180) * 1.4;
        const next = Math.max(-0.9, Math.min(0.9, tilt));
        if (Math.abs(next - engine.gravity.x) < 0.05) return;
        engine.gravity.x = next;
        if (mode !== "loose") return;
        letters.forEach(({ body }) => Sleeping.set(body, false));
        wake();
      };

      const onKey = (event: KeyboardEvent) => {
        if (mode !== "loose" || !footerVisible || event.shiftKey || event.altKey) return;
        if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
        const active = document.activeElement as HTMLElement | null;
        if (active?.isContentEditable || /^(input|textarea|select)$/i.test(active?.tagName ?? "")) return;
        event.preventDefault();
        interacted();
        tidy();
      };

      // An agent cursor flies in, clicks the name, and gravity takes over.
      const intro = () => {
        if (introPlayed || mode !== "assembled") return;
        introPlayed = true;
        const agent = agentRef.current;
        const target = letters[5] ?? letters[0];
        if (!agent || !target) return knock();
        const label = agent.querySelector("[data-agent-label]");
        const tx = target.hx - letterHeight * 0.1;
        const ty = target.hy - letterHeight * 0.05;
        const at = (x: number, y: number, s = 1) => `translate3d(${x}px, ${y}px, 0) scale(${s})`;
        const duration = 2800;
        const press = 0.48;
        agent.style.transformOrigin = "0 0";
        agent.animate(
          [
            { transform: at(width + 40, ty - letterHeight * 1.8), opacity: 0 },
            { transform: at(width - 120, ty - letterHeight * 1.6), opacity: 1, offset: 0.1 },
            { transform: at(tx, ty), opacity: 1, offset: press - 0.04, easing: "ease-in" },
            { transform: at(tx, ty, 0.78), opacity: 1, offset: press },
            { transform: at(tx, ty), opacity: 1, offset: press + 0.05, easing: "cubic-bezier(.2,.7,.3,1)" },
            { transform: at(tx + 60, ty - letterHeight * 1.7), opacity: 1, offset: 0.86 },
            { transform: at(tx + 70, ty - letterHeight * 1.8), opacity: 0 },
          ],
          { duration, easing: "cubic-bezier(.45,0,.25,1)", fill: "forwards" }
        );
        timers.push(
          setTimeout(() => {
            if (mode !== "assembled") return;
            agent
              .querySelector("[data-agent-ripple]")
              ?.animate([{ scale: "0", opacity: 1 }, { scale: "1", opacity: 0 }], { duration: 700, easing: "ease-out" });
            if (label) label.textContent = "Gravity: on";
            knock(tx);
          }, duration * press),
          setTimeout(() => {
            if (mode === "loose" && !drag) setHint(true);
          }, duration + 400)
        );
      };

      const footerObserver = new IntersectionObserver(([entry]) => {
        footerVisible = entry.isIntersecting;
        if (footerVisible) wake();
      });
      footerObserver.observe(footer);

      // The intro waits until the whole name is on screen, then gives it a beat.
      const markObserver = new IntersectionObserver(
        ([entry]) => {
          clearTimeout(introTimer);
          if (entry.isIntersecting && !introPlayed) introTimer = setTimeout(intro, 600);
        },
        { threshold: 0.85 }
      );
      markObserver.observe(mark);

      let resizeTimer: ReturnType<typeof setTimeout> | undefined;
      const resizeObserver = new ResizeObserver(() => {
        if (footer.clientWidth === width) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          setHint(false);
          build();
        }, 150);
      });

      build();
      resizeObserver.observe(footer);
      mark.addEventListener("pointerdown", onPointerDown);
      footer.addEventListener("pointermove", onMouseMove);
      footer.addEventListener("pointerleave", onMouseLeave);
      window.addEventListener("keydown", onKey);
      window.addEventListener("deviceorientation", onTilt);
      footer.dataset.ready = "";
      controls.current = {
        knock: () => {
          interacted();
          knock();
        },
        tidy: () => {
          interacted();
          tidy();
        },
      };
      setUndoKey(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘Z" : "Ctrl Z");
      setReady(true);

      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(introTimer);
        clearTimeout(resizeTimer);
        timers.forEach(clearTimeout);
        endDrag();
        footerObserver.disconnect();
        markObserver.disconnect();
        resizeObserver.disconnect();
        mark.removeEventListener("pointerdown", onPointerDown);
        footer.removeEventListener("pointermove", onMouseMove);
        footer.removeEventListener("pointerleave", onMouseLeave);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("deviceorientation", onTilt);
        agentRef.current?.getAnimations().forEach((animation) => animation.cancel());
        spans.forEach((el) => {
          el.style.transform = "";
        });
        delete footer.dataset.physics;
        delete footer.dataset.ready;
        Engine.clear(engine);
        controls.current = { knock: () => {}, tidy: () => {} };
      };
    }
  }, [footerRef, markRef, agentRef]);

  return { ready, loose, hint, undoKey, controls };
}
