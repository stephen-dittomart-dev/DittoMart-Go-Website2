"use client";

import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ChapterRef = { id: string; label: string };

/**
 * Chapter rail — the fixed right-edge index.
 *
 * Long chaptered pages lose the reader: there is no sense of how much story
 * is left. Apple solves this with a persistent nav; we solve it with a rail
 * that tracks position, names the current chapter on hover, and lets the
 * reader jump. It also does useful visual work — it occupies the right
 * margin that would otherwise sit empty on wide screens.
 *
 * Hidden below 1280px, where that margin does not exist.
 */
export function ChapterRail({ chapters }: { chapters: ChapterRef[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) return;

    const triggers = chapters
      .map((c, i) => {
        const el = document.getElementById(c.id);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      })
      .filter(Boolean) as ScrollTrigger[];

    return () => triggers.forEach((t) => t.kill());
  }, [chapters]);

  // Only surface the rail once the reader is past the hero.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={root}
      aria-label="Chapters"
      className={cn(
        "pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 xl:block",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <ul className="pointer-events-auto flex flex-col items-end gap-3">
        {chapters.map((c, i) => (
          <li key={c.id} className="group flex items-center justify-end gap-3">
            <span
              className={cn(
                "whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-400",
                i === active
                  ? "translate-x-0 text-fg opacity-100"
                  : "translate-x-2 text-fg-subtle opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              )}
            >
              {c.label}
            </span>
            <a
              href={`#${c.id}`}
              aria-label={c.label}
              aria-current={i === active ? "true" : undefined}
              className={cn(
                "block h-px transition-all duration-400",
                i === active
                  ? "w-9 bg-primary"
                  : "w-4 bg-line-strong group-hover:w-7 group-hover:bg-primary/60"
              )}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
