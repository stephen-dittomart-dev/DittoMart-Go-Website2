"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ElementType, type ReactNode } from "react";
import {
  DUR,
  EASE,
  gsap,
  prefersReducedMotion,
  registerGsap,
  SplitText,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

export type SplitMode =
  | "words"
  | "chars"
  | "lines"
  /** Words rise, but each line also slides in from alternating sides. */
  | "lines-alt"
  /** Characters scatter in from random offsets — used sparingly, for one hero. */
  | "scatter"
  /** Words drop in and overshoot on an elastic settle. */
  | "bounce"
  /** Characters pop up one by one with a springy overshoot. */
  | "bounce-chars";

/**
 * Cinematic headline typography.
 *
 * GSAP SplitText with `mask: "lines"` gives us a real overflow-clipped line
 * box per line, so words rise *out of* the type rather than fading on top of
 * it. Splitting is deferred until webfonts resolve, because measuring line
 * boxes against a fallback font produces wrong breaks that only show up on
 * slow connections.
 *
 * Accessibility: SplitText preserves the original text nodes and GSAP restores
 * them on revert. We additionally carry `aria-label` so assistive tech reads
 * one string rather than a pile of spans.
 */
export function SplitHeading({
  text,
  children,
  as: Tag = "h2",
  mode = "words",
  className,
  delay = 0,
  stagger,
  duration,
  scroll = true,
  start = "top 86%",
  highlight,
  /**
   * Solid, and scene-aware. `text-primary` resolves to whatever the
   * surrounding scene has declared as its primary, so a highlighted phrase
   * always lands in a colour that contrasts with the band it sits on —
   * ember on ink, gold on crimson, deep ember on sand. A single gradient
   * could not do that: it looked correct on one background and muddy on the
   * next, and across a long page it read as decoration rather than emphasis.
   */
  highlightClassName = "text-primary",
  onReady,
  play = true,
  idle = "none",
}: {
  text: string;
  children?: ReactNode;
  as?: ElementType;
  mode?: SplitMode;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  scroll?: boolean;
  start?: string;
  highlight?: string[];
  highlightClassName?: string;
  onReady?: () => void;
  /**
   * Hold the heading in its pre-entrance state. The home hero uses this so
   * the headline does not play out of sight underneath the intro overlay.
   */
  play?: boolean;
  /**
   * What the heading does *after* it has arrived.
   *
   * `wave` keeps it alive: a slow sine travels through the words left to
   * right, forever, so the headline breathes whether or not anyone scrolls.
   *
   * It is one continuous function of time rather than a stack of looping
   * tweens. Two infinite tweens writing `y` on the same word fight each other
   * and the result drifts; a single wave has one value per word per frame and
   * cannot disagree with itself.
   */
  idle?: "none" | "wave";
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1 });
        onReady?.();
        return;
      }

      if (!play) {
        gsap.set(el, { opacity: 0 });
        return;
      }

      let split: SplitText | null = null;
      let tl: gsap.core.Timeline | null = null;
      let wave: gsap.TickerCallback | null = null;

      /**
       * The idle wave.
       *
       * Driven straight off the site's ticker with `quickSetter`, which
       * writes the transform without going through a tween at all — for ten
       * or so words that is a handful of property writes a frame, well below
       * the cost of the tweens it replaces.
       *
       * Amplitude is deliberately tiny. At 3px it reads as the type being
       * alive; at 8px it reads as the page being broken.
       */
      const startWave = (words: Element[]) => {
        if (idle !== "wave" || !words.length) return;
        const setters = words.map((w) => gsap.quickSetter(w, "y", "px"));
        wave = (time: number) => {
          for (let i = 0; i < setters.length; i++) {
            setters[i](Math.sin(time * 1.15 - i * 0.5) * 3);
          }
        };
        gsap.ticker.add(wave);
      };

      const run = () => {
        if (!ref.current) return;

        const needsChars =
          mode === "chars" || mode === "scatter" || mode === "bounce-chars";
        const splitType = needsChars ? "lines,words,chars" : "lines,words";

        split = SplitText.create(el, {
          type: splitType,
          mask: "lines",
          linesClass: "split-line",
        });

        gsap.set(el, { opacity: 1 });

        const words = split.words as Element[];

        tl = gsap.timeline({
          delay,
          ...(scroll
            ? { scrollTrigger: { trigger: el, start, once: true } }
            : {}),
          onComplete: () => {
            onReady?.();
            // The wave only takes over once the entrance has finished, so the
            // two never write `y` on the same word in the same frame.
            startWave(words);
          },
        });

        if (mode === "lines") {
          tl.from(split.lines, {
            yPercent: 112,
            duration: duration ?? 1.05,
            ease: EASE.out4,
            stagger: stagger ?? 0.12,
          });
        } else if (mode === "lines-alt") {
          split.lines.forEach((line, i) => {
            tl!.from(
              line,
              {
                yPercent: 112,
                xPercent: i % 2 === 0 ? -6 : 6,
                duration: duration ?? 1.05,
                ease: EASE.out4,
              },
              i * (stagger ?? 0.11)
            );
          });
        } else if (mode === "chars") {
          tl.from(split.chars, {
            yPercent: 118,
            rotate: 5,
            duration: duration ?? 0.8,
            ease: EASE.out4,
            stagger: stagger ?? 0.018,
          });
        } else if (mode === "bounce") {
          // Words fall past their resting position and spring back.
          tl.from(split.words, {
            yPercent: -130,
            opacity: 0,
            duration: duration ?? 1.1,
            ease: "bounce.out",
            stagger: stagger ?? 0.055,
          });
        } else if (mode === "bounce-chars") {
          tl.from(split.chars, {
            yPercent: 130,
            scale: 0.5,
            opacity: 0,
            duration: duration ?? 0.85,
            ease: "back.out(3)",
            stagger: stagger ?? 0.022,
          });
        } else if (mode === "scatter") {
          tl.from(split.chars, {
            yPercent: () => gsap.utils.random(90, 150),
            xPercent: () => gsap.utils.random(-24, 24),
            rotate: () => gsap.utils.random(-14, 14),
            opacity: 0,
            duration: duration ?? 1.1,
            ease: EASE.out4,
            stagger: { each: stagger ?? 0.014, from: "random" },
          });
        } else {
          tl.from(split.words, {
            yPercent: 114,
            rotate: 2.5,
            duration: duration ?? 0.95,
            ease: EASE.out4,
            stagger: stagger ?? 0.045,
          });
        }
      };

      if (document.fonts?.status === "loaded") run();
      else document.fonts?.ready.then(run).catch(run);

      return () => {
        // Off the ticker before the split reverts — a wave still holding
        // setters for elements SplitText has just destroyed writes to
        // detached nodes every frame for the life of the page.
        if (wave) gsap.ticker.remove(wave);
        tl?.kill();
        split?.revert();
      };
    },
    { scope: ref, dependencies: [text, mode, play, idle] }
  );

  const content = children ?? renderHighlighted(text, highlight, highlightClassName);

  return (
    <Tag
      ref={ref}
      data-split
      aria-label={text}
      className={cn(className)}
    >
      {content}
    </Tag>
  );
}

function renderHighlighted(
  text: string,
  highlight: string[] | undefined,
  highlightClassName: string
) {
  if (!highlight?.length) return text;

  const set = new Set(highlight.map((w) => w.toLowerCase().replace(/[^a-z0-9]/gi, "")));

  return text.split(" ").map((word, i, arr) => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/gi, "");
    const isHit = set.has(clean);
    return (
      <span key={`${word}-${i}`} className={isHit ? highlightClassName : undefined}>
        {word}
        {i < arr.length - 1 ? " " : ""}
      </span>
    );
  });
}
