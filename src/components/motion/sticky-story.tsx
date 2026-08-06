"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState, type ReactNode } from "react";
import { EASE, gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type StickyStoryItem = {
  id: string;
  /** Rendered in the pinned left column when this item is active. */
  narrator: ReactNode;
  /** Rendered in the scrolling right column. */
  panel: ReactNode;
};

/**
 * Sticky storytelling — the pattern from "How it works", extracted.
 *
 * The left column stays put while the right column scrolls past it, and the
 * narrator swaps as each panel reaches reading position. A rail fills across
 * the whole sequence.
 *
 * This is the site's most effective explanatory device, so it now carries
 * four different sections instead of one: how it works, the supply network,
 * the order lifecycle and the exception paths. Each passes different content
 * and a different accent, so it reads as a house pattern rather than a repeat.
 */
export function StickyStory({
  items,
  className,
  panelClassName,
  railClassName = "from-ember-400 via-crimson-500 to-ember-600",
  onActiveChange,
  narratorHeader,
}: {
  items: StickyStoryItem[];
  className?: string;
  panelClassName?: string;
  railClassName?: string;
  onActiveChange?: (index: number) => void;
  /** Optional element above the narrator — progress pips, a badge, etc. */
  narratorHeader?: (active: number) => ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const blocks = gsap.utils.toArray<HTMLElement>("[data-story-panel]", el);
      const rail = railRef.current;

      if (prefersReducedMotion()) {
        if (rail) gsap.set(rail, { scaleY: 1 });
        gsap.set(blocks, { opacity: 1, y: 0, rotateX: 0 });
        return;
      }

      if (rail) {
        gsap.fromTo(
          rail,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: {
              trigger: el,
              start: "top 55%",
              end: "bottom 70%",
              scrub: 0.4,
            },
          }
        );
      }

      blocks.forEach((block, i) => {
        ScrollTrigger.create({
          trigger: block,
          start: "top 62%",
          end: "bottom 62%",
          onToggle: (self) => {
            if (!self.isActive) return;
            setActive(i);
            onActiveChange?.(i);
          },
        });

        gsap.from(block, {
          opacity: 0,
          y: 60,
          rotateX: -6,
          transformPerspective: 1000,
          duration: 1.05,
          ease: EASE.out4,
          scrollTrigger: { trigger: block, start: "top 82%", once: true },
        });
      });
    },
    { scope: root, dependencies: [items.length] }
  );

  return (
    <div
      ref={root}
      className={cn("grid gap-10 lg:grid-cols-12 lg:gap-16", className)}
    >
      {/* pinned narrator */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32">
          <div className="flex items-start gap-5">
            <div className="relative hidden w-px shrink-0 self-stretch bg-line lg:block">
              <div
                ref={railRef}
                className={cn(
                  "absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b",
                  railClassName
                )}
                style={{ transform: "scaleY(0)" }}
              />
            </div>

            <div className="min-w-0 flex-1">
              {narratorHeader ? narratorHeader(active) : null}
              <div key={items[active]?.id}>{items[active]?.narrator}</div>
            </div>
          </div>
        </div>
      </div>

      {/* scrolling panels */}
      <ol className={cn("flex flex-col gap-6 lg:col-span-7", panelClassName)}>
        {items.map((item, i) => (
          <li key={item.id} data-story-panel data-active={i === active}>
            {item.panel}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Progress pips used above several StickyStory narrators. */
export function StoryPips({
  count,
  active,
  className,
}: {
  count: number;
  active: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-500",
            i === active
              ? "w-8 bg-primary"
              : i < active
                ? "w-4 bg-primary/40"
                : "w-4 bg-line-strong"
          )}
        />
      ))}
    </div>
  );
}
