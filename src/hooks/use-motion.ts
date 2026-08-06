"use client";

import { useGSAP } from "@gsap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DUR,
  EASE,
  gsap,
  prefersReducedMotion,
  registerGsap,
  ScrollTrigger,
  SplitText,
  travel,
} from "@/lib/motion";

/* ==========================================================================
   The animation vocabulary. Every scroll-driven behaviour on the site is
   built from these six hooks, so cleanup is uniform and nothing leaks
   across route changes.
   ========================================================================== */

/**
 * Scoped GSAP context. Everything created inside is reverted on unmount,
 * which matters enormously in the App Router where a route change tears down
 * the tree while ScrollTriggers are still registered globally.
 */
export function useMotionScope<T extends HTMLElement = HTMLDivElement>(
  setup: (ctx: { scope: T; reduced: boolean }) => void,
  deps: unknown[] = []
) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      registerGsap();
      if (!ref.current) return;
      setup({ scope: ref.current, reduced: prefersReducedMotion() });
    },
    { scope: ref, dependencies: deps, revertOnUpdate: true }
  );

  return ref;
}

/* -------------------------------------------------------------------------
   useReveal — the workhorse. Any descendant carrying [data-reveal] rises in
   DOM order. Supports named variants so pages can differ without every one
   of them hand-rolling a timeline.
   ------------------------------------------------------------------------- */

export type RevealVariant =
  | "rise"
  | "mask"
  | "scale"
  | "slide-left"
  | "slide-right"
  | "clip"
  | "blur"
  | "rotate";

const VARIANTS: Record<
  RevealVariant,
  { from: gsap.TweenVars; to: gsap.TweenVars }
> = {
  rise: {
    from: { opacity: 0, y: travel(30) },
    to: { opacity: 1, y: 0 },
  },
  mask: {
    from: { opacity: 0, yPercent: 40, clipPath: "inset(100% 0% 0% 0%)" },
    to: { opacity: 1, yPercent: 0, clipPath: "inset(0% 0% 0% 0%)" },
  },
  scale: {
    from: { opacity: 0, scale: 0.94, y: travel(18) },
    to: { opacity: 1, scale: 1, y: 0 },
  },
  "slide-left": {
    from: { opacity: 0, x: travel(46) },
    to: { opacity: 1, x: 0 },
  },
  "slide-right": {
    from: { opacity: 0, x: -travel(46) },
    to: { opacity: 1, x: 0 },
  },
  clip: {
    from: { clipPath: "inset(0% 100% 0% 0%)", opacity: 1 },
    to: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
  },
  blur: {
    from: { opacity: 0, filter: "blur(14px)", y: travel(22) },
    to: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  rotate: {
    from: { opacity: 0, rotateX: -32, y: travel(28), transformPerspective: 900 },
    to: { opacity: 1, rotateX: 0, y: 0 },
  },
};

export function useReveal<T extends HTMLElement = HTMLDivElement>({
  variant = "rise",
  stagger = 0.075,
  start = "top 84%",
  duration = DUR.reveal,
  ease = EASE.out3,
  selector = "[data-reveal]",
  deps = [],
}: {
  variant?: RevealVariant;
  stagger?: number;
  start?: string;
  duration?: number;
  ease?: string;
  selector?: string;
  deps?: unknown[];
} = {}) {
  return useMotionScope<T>(({ scope, reduced }) => {
    const targets = gsap.utils.toArray<HTMLElement>(selector, scope);
    if (!targets.length) return;

    const spec = VARIANTS[variant];

    if (reduced) {
      gsap.set(targets, { ...spec.to, clearProps: "filter,clipPath" });
      return;
    }

    gsap.set(targets, spec.from);
    gsap.to(targets, {
      ...spec.to,
      duration,
      ease,
      stagger,
      scrollTrigger: { trigger: scope, start, once: true },
    });
  }, deps);
}

/* -------------------------------------------------------------------------
   useSplitReveal — cinematic headline typography.
   Lines are masked, words rise inside them. Falls back to a plain fade when
   fonts have not loaded or motion is reduced.
   ------------------------------------------------------------------------- */

export function useSplitHeading<T extends HTMLElement = HTMLHeadingElement>({
  type = "words",
  stagger = 0.045,
  delay = 0,
  duration = 0.95,
  scroll = true,
  start = "top 86%",
  deps = [],
}: {
  type?: "words" | "chars" | "lines";
  stagger?: number;
  delay?: number;
  duration?: number;
  scroll?: boolean;
  start?: string;
  deps?: unknown[];
} = {}) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      let split: SplitText | null = null;

      const run = () => {
        split = SplitText.create(el, {
          type: `lines,${type}`,
          mask: "lines",
          linesClass: "split-line",
        });

        const targets =
          type === "chars" ? split.chars : type === "lines" ? split.lines : split.words;

        gsap.set(el, { opacity: 1 });
        gsap.from(targets, {
          yPercent: 118,
          rotate: type === "chars" ? 4 : 2,
          duration,
          ease: EASE.out4,
          stagger,
          delay,
          ...(scroll
            ? { scrollTrigger: { trigger: el, start, once: true } }
            : {}),
        });
      };

      // Splitting before webfonts land produces wrong line boxes.
      if (document.fonts?.status === "loaded") run();
      else document.fonts?.ready.then(run).catch(run);

      return () => split?.revert();
    },
    { scope: ref, dependencies: deps, revertOnUpdate: true }
  );

  return ref;
}

/* -------------------------------------------------------------------------
   useCountUp — number tweened into view, once.
   ------------------------------------------------------------------------- */

export function useCountUp(
  value: number,
  {
    duration = 1.8,
    decimals = 0,
    start = "top 88%",
    format,
  }: {
    duration?: number;
    decimals?: number;
    start?: string;
    format?: (n: number) => string;
  } = {}
) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el) return;

      const render = (n: number) =>
        format
          ? format(n)
          : new Intl.NumberFormat("en-IN", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }).format(n);

      if (prefersReducedMotion()) {
        el.textContent = render(value);
        return;
      }

      const obj = { n: 0 };
      el.textContent = render(0);

      gsap.to(obj, {
        n: value,
        duration,
        ease: EASE.out4,
        onUpdate: () => {
          el.textContent = render(obj.n);
        },
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref, dependencies: [value] }
  );

  return ref;
}

/* -------------------------------------------------------------------------
   useInView — plain IntersectionObserver, for "only animate when visible".
   ------------------------------------------------------------------------- */

export function useInView<T extends HTMLElement = HTMLDivElement>(
  rootMargin = "-10% 0px"
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
}

/* -------------------------------------------------------------------------
   useSequence — one shared cadence engine for every living diagram.
   Pauses off-screen; jumps to the final step under reduced motion.
   ------------------------------------------------------------------------- */

export function useSequence(steps: number, intervalMs = 1400, active = true) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStep(steps);
      return;
    }
    if (!active) return;

    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % (steps + 1));
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [steps, intervalMs, active]);

  return step;
}

/* -------------------------------------------------------------------------
   useMediaQuery / breakpoints
   ------------------------------------------------------------------------- */

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsTablet = () => useMediaQuery("(max-width: 1023px)");
export const useReducedMotionPref = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

/* -------------------------------------------------------------------------
   useScrollProgress — 0..1 for a target element, cheap and scrub-linked.
   ------------------------------------------------------------------------- */

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>({
  start = "top bottom",
  end = "bottom top",
}: { start?: string; end?: string } = {}) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        setProgress(1);
        return;
      }
      ScrollTrigger.create({
        trigger: el,
        start,
        end,
        onUpdate: (self) => setProgress(self.progress),
      });
    },
    { scope: ref }
  );

  return [ref, progress] as const;
}

/* -------------------------------------------------------------------------
   useMagnetic — pointer-attracted element. Reserved for primary CTAs.
   ------------------------------------------------------------------------- */

export function useMagnetic<T extends HTMLElement = HTMLDivElement>(
  strength = 0.32,
  scale = 1.02
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches)
      return;

    registerGsap();
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: EASE.out3 });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: EASE.out3 });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onEnter = () => gsap.to(el, { scale, duration: DUR.micro, ease: EASE.out3 });
    const onLeave = () => {
      xTo(0);
      yTo(0);
      gsap.to(el, { scale: 1, duration: DUR.fast, ease: EASE.out3 });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength, scale]);

  return ref;
}

/* -------------------------------------------------------------------------
   useParallax — scrub-linked translate on a single element.
   ------------------------------------------------------------------------- */

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  distance = 60,
  scrub: number | boolean = 0.6
) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el,
        { y: distance },
        {
          y: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub,
          },
        }
      );
    },
    { scope: ref }
  );

  return ref;
}

/** Refreshes ScrollTrigger once layout has genuinely settled. */
export function useScrollTriggerRefresh(deps: unknown[] = []) {
  const refresh = useCallback(() => ScrollTrigger.refresh(), []);

  useEffect(() => {
    const t = window.setTimeout(refresh, 350);
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
