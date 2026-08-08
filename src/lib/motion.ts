"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

/* ==========================================================================
   Motion tokens — every tween pulls duration + ease from here.
   Nothing in this codebase should hardcode a duration or a cubic-bezier.
   ========================================================================== */

export const DUR = {
  micro: 0.22,
  fast: 0.34,
  reveal: 0.72,
  section: 1.1,
  system: 1.9,
  cinematic: 2.4,
} as const;

export const EASE = {
  out: "power2.out",
  out3: "power3.out",
  out4: "power4.out",
  expo: "expo.out",
  inOut: "power2.inOut",
  inOut3: "power3.inOut",
  /** The house curve — matches --ease-out-expo in globals.css. */
  house: "cubic-bezier(0.16, 1, 0.3, 1)",
  back: "back.out(1.7)",
} as const;

let registered = false;

/**
 * Registers plugins exactly once, client-side only.
 * DrawSVGPlugin ships in the public GSAP package from 3.13 onward, but we
 * guard the import anyway so a stripped install degrades instead of throwing.
 */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  const plugins = [ScrollTrigger, MotionPathPlugin, SplitText, DrawSVGPlugin].filter(
    Boolean
  );
  gsap.registerPlugin(...plugins);
  gsap.defaults({ ease: EASE.out3, duration: DUR.reveal });

  /*
   * `limitCallbacks` is the one that matters on a page with two hundred
   * scroll-driven elements. Without it every trigger evaluates and reports its
   * enter/leave state on every scroll frame, whether or not anything changed;
   * with it, a callback fires only on an actual crossing. Scrubbed tweens are
   * untouched — they read progress directly — so nothing looks different, there
   * is simply less bookkeeping per frame.
   *
   * `autoRefreshEvents` drops `visibilitychange` from the list. A refresh
   * re-measures every trigger on the page, and tabbing away and back is not a
   * layout change; the three that remain are.
   */
  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
    autoRefreshEvents: "DOMContentLoaded,load,resize",
  });

  /*
   * `force3D` is deliberately left at GSAP's default of `"auto"`, which
   * promotes an element for the duration of a tween and drops it afterwards.
   * Forcing it on globally was tried and removed: it keeps a compositor layer
   * alive for every element that has ever animated, and on the heavier pages
   * here that is hundreds of them. The machine this was measured on was too
   * noisy to prove it either way, and an unverifiable change that trades main-
   * thread work for GPU memory is not one to keep on a guess.
   */
  gsap.config({ nullTargetWarn: false });
  registered = true;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export function isTablet() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 1024;
}

export function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Damp travel distance on small screens so reveals never feel like jumps. */
export function travel(base = 28) {
  return isMobile() ? Math.round(base * 0.55) : base;
}

/**
 * Scroll-anchored sections only make sense when there is room to pin.
 * Below 1024 we fall back to a plain reveal rather than a broken pin.
 */
export function canPin() {
  return !prefersReducedMotion() && !isTablet();
}

export { gsap, ScrollTrigger, MotionPathPlugin, SplitText, DrawSVGPlugin };
