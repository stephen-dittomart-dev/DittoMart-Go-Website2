"use client";

import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import {
  EASE,
  gsap,
  prefersReducedMotion,
  registerGsap,
  ScrollTrigger,
} from "@/lib/motion";

/**
 * Route transition — content-level, no overlay.
 *
 * The previous version dropped a full-screen dark curtain over the viewport
 * on every navigation. It read as a blackout: the page vanished, then came
 * back. This replaces it with the transition the fast product sites use —
 * nothing covers the screen at all. Instead a slim brand line sweeps the top
 * edge for feedback, and the arriving page's own content lifts and sharpens
 * into place, banded so the top of the page resolves before the bottom.
 *
 * Two implementation details that matter:
 *
 *  · The wrapper's transform and filter are cleared the moment the tween
 *    finishes. A lingering transform on an ancestor creates a containing
 *    block, which would quietly break every pinned ScrollTrigger further
 *    down the page.
 *
 *  · ScrollTrigger.refresh() runs on completion, once the layout is final.
 */
export function PageEnter({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      registerGsap();
      const el = wrap.current;
      const line = sweep.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { clearProps: "all" });
        if (line) gsap.set(line, { autoAlpha: 0 });
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          // Drop every inline style so nothing is left holding a containing
          // block over the pinned sections below.
          gsap.set(el, { clearProps: "all" });
          ScrollTrigger.refresh();
        },
      });

      if (line) {
        tl.set(line, { autoAlpha: 1, scaleX: 0, transformOrigin: "left center" })
          .to(line, { scaleX: 1, duration: 0.42, ease: EASE.out3 })
          .to(
            line,
            { autoAlpha: 0, duration: 0.28, ease: EASE.out },
            "+=0.05"
          );
      }

      // A single soft band travels across the viewport as the page settles.
      // Translucent and brand-tinted rather than opaque — it reads as light
      // moving over the page, not as the page being covered.
      const band = el.parentElement?.querySelector("[data-page-sweep]");
      if (band) {
        tl.fromTo(
          band,
          { xPercent: -120, skewX: -12, autoAlpha: 0 },
          {
            xPercent: 220,
            autoAlpha: 1,
            duration: 0.95,
            ease: "power2.inOut",
            onComplete: () => gsap.set(band, { autoAlpha: 0 }),
          },
          0
        );
      }

      tl.fromTo(
        el,
        { autoAlpha: 0, y: 26, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.62,
          ease: EASE.out4,
        },
        0
      );

      // The first band of content resolves a beat after the page itself, so
      // the arrival reads as staged rather than as one flat fade.
      const bands = el.querySelectorAll<HTMLElement>(
        ":scope > section:nth-of-type(-n+2)"
      );
      if (bands.length) {
        tl.fromTo(
          bands,
          { y: 18, autoAlpha: 0.4 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.55,
            ease: EASE.out3,
            stagger: 0.08,
            clearProps: "all",
          },
          0.12
        );
      }

      return () => tl.kill();
    },
    { dependencies: [pathname] }
  );

  return (
    <>
      <div
        ref={sweep}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] origin-left bg-gradient-to-r from-ember-500 via-pulse-500 to-crimson-600"
        style={{ opacity: 0 }}
      />

      <div
        data-page-sweep
        aria-hidden
        className="pointer-events-none fixed inset-y-0 -left-1/3 z-[9996] w-1/2"
        style={{
          opacity: 0,
          background:
            "linear-gradient(100deg, transparent, color-mix(in oklab, var(--color-ember-500) 16%, transparent) 45%, color-mix(in oklab, var(--color-pulse-500) 10%, transparent) 60%, transparent)",
        }}
      />

      <div ref={wrap}>{children}</div>
    </>
  );
}
