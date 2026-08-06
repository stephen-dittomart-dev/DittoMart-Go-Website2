"use client";

import { useEffect, useRef } from "react";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/**
 * Dual-layer cursor: an instant dot and a lerping ring.
 *
 * The ring reads intent — it grows over interactive elements and squares off
 * with a label over anything carrying `data-cursor`. Disabled entirely on
 * coarse pointers, where a custom cursor is meaningless and costs a rAF loop.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add("has-custom-cursor");

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "none" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "none" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.42, ease: EASE.out3 });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.42, ease: EASE.out3 });

    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: DUR.micro });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: DUR.micro });
    };

    const INTERACTIVE =
      'a, button, [role="button"], input, textarea, select, summary, [data-cursor]';

    const onOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest?.<HTMLElement>(INTERACTIVE);
      if (!target) return;

      const custom = target.dataset.cursor;

      if (custom) {
        label.textContent = custom.toUpperCase();
        gsap.to(ring, {
          width: 74,
          height: 74,
          borderRadius: 14,
          borderColor: "var(--primary)",
          backgroundColor: "color-mix(in oklab, var(--primary) 12%, transparent)",
          duration: DUR.fast,
          ease: EASE.out3,
        });
        gsap.to(label, { autoAlpha: 1, duration: DUR.micro });
        gsap.to(dot, { scale: 0, duration: DUR.micro });
      } else {
        gsap.to(ring, {
          width: 44,
          height: 44,
          borderRadius: 999,
          borderColor: "var(--primary)",
          backgroundColor: "color-mix(in oklab, var(--primary) 8%, transparent)",
          duration: DUR.fast,
          ease: EASE.out3,
        });
        gsap.to(dot, { scale: 0.55, duration: DUR.micro });
      }
    };

    const onOut = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest?.<HTMLElement>(INTERACTIVE);
      if (!target) return;
      const to = e.relatedTarget as HTMLElement | null;
      if (to?.closest?.(INTERACTIVE)) return;

      gsap.to(ring, {
        width: 26,
        height: 26,
        borderRadius: 999,
        borderColor: "var(--line-strong)",
        backgroundColor: "transparent",
        duration: DUR.fast,
        ease: EASE.out3,
      });
      gsap.to(label, { autoAlpha: 0, duration: DUR.micro });
      gsap.to(dot, { scale: 1, duration: DUR.micro });
    };

    const onDown = () => gsap.to(ring, { scale: 0.86, duration: DUR.micro });
    const onUp = () => gsap.to(ring, { scale: 1, duration: DUR.micro });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([dot, ring, label]);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9997]">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-line-strong"
        style={{ width: 26, height: 26, opacity: 0 }}
      >
        <span
          ref={labelRef}
          className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-primary"
          style={{ opacity: 0 }}
        />
      </div>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 size-[6px] rounded-full bg-primary"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
