"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * The shared plumbing behind every canvas visual on the site.
 *
 * Each hero visual only wants to answer one question — "given a context and a
 * box, what do I draw this frame?" Everything around that question is the
 * same every time and easy to get subtly wrong, so it lives here once:
 *
 *  · device pixel ratio, capped at 2 (beyond that you pay quadratic fill cost
 *    for a difference nobody can see)
 *  · `ResizeObserver` on the host rather than a `window` resize listener, so a
 *    box that changes size without the window changing is still caught
 *  · one loop, GSAP's ticker — the same one that drives Lenis. A private
 *    `requestAnimationFrame` competes with it for the frame
 *  · delta-scaled time, so a 144Hz panel does not run the scene at 2.4×
 *  · paused when off screen or on a hidden tab
 *  · under `prefers-reduced-motion` the scene is warmed to a settled state and
 *    drawn exactly once, so it still composes as a picture but never animates
 *
 * The scene reads its colours from the host's computed styles, which means it
 * inherits whatever `Scene` palette the surrounding band declared. Nothing
 * here hardcodes a brand colour.
 */

export type ReadVar = (name: string, fallback?: string) => string;
export type SceneFrame = (t: number, dt: number) => void;

/**
 * Called on mount and again whenever the box changes size. Do setup here and
 * return the per-frame function; anything captured in the closure is safely
 * sized to the current box.
 */
export type SceneInit = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  v: ReadVar
) => SceneFrame;

export function useCanvasScene(init: SceneInit) {
  const ref = useRef<HTMLCanvasElement>(null);
  // Kept in a ref so an inline arrow in the caller does not re-run the effect.
  const initRef = useRef(init);
  initRef.current = init;

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const styles = getComputedStyle(host);
    const readVar: ReadVar = (n, f = "#fb8038") =>
      styles.getPropertyValue(n).trim() || f;

    let frame: SceneFrame | null = null;
    let w = 0;
    let h = 0;

    const build = () => {
      const rect = host.getBoundingClientRect();
      const nw = Math.max(1, Math.round(rect.width));
      const nh = Math.max(1, Math.round(rect.height));
      if (nw === w && nh === h) return;
      w = nw;
      h = nh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // Everything downstream draws in CSS pixels.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      frame = initRef.current(ctx, w, h, readVar);
      if (reduced) {
        // Warm the scene so the single frame is a composed picture rather
        // than whatever the first tick happens to look like.
        for (let i = 0; i < 80; i++) frame(i * 0.016, 1);
      }
    };

    const tick = (time: number, deltaTime: number) => {
      frame?.(time, Math.min(deltaTime / 16.667, 3));
    };

    let running = false;
    const start = () => {
      if (running || reduced) return;
      gsap.ticker.add(tick);
      running = true;
    };
    const stop = () => {
      if (!running) return;
      gsap.ticker.remove(tick);
      running = false;
    };

    build();

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "140px" }
    );
    io.observe(host);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(build);
    ro.observe(host);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return ref;
}

/** The standard wrapper: a positioned host the canvas can measure against. */
export function CanvasHost({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`relative isolate h-[22rem] w-full overflow-hidden sm:h-[26rem] lg:h-[30rem] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
