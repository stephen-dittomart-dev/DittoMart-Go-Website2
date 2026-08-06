"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { ProviderLogo } from "@/components/visuals/provider-logo";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { providers } from "@/lib/providers";
import { cn } from "@/lib/utils";

/**
 * Partner marks drifting behind the network section.
 *
 * Scroll-linked rather than auto-playing: the track is tied to scroll
 * progress with `scrub`, so scrolling down carries the logos left-to-right
 * and scrolling back up runs them in reverse along exactly the same path.
 * That reversibility is the whole point — an autoplay marquee would keep
 * going the same way no matter what the reader does, which reads as
 * decoration. This reads as a response.
 *
 * Two rows travel in opposite directions so the band has depth, and the
 * whole thing sits at low opacity behind the content with an edge mask, so
 * it never competes with the copy in front of it.
 */
export function LogoDrift({
  className,
  rows = 2,
}: {
  className?: string;
  rows?: 1 | 2;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const tracks = gsap.utils.toArray<HTMLElement>("[data-drift-track]", el);
      if (!tracks.length) return;

      if (prefersReducedMotion()) {
        gsap.set(tracks, { xPercent: 0 });
        return;
      }

      tracks.forEach((track) => {
        const dir = Number(track.dataset.driftDir ?? "1");
        // The track holds two copies of the set, so travelling 50% of its
        // own width lands exactly on the duplicate — the row never shows a gap
        // whichever direction the reader is scrolling.
        gsap.fromTo(
          track,
          { xPercent: dir > 0 ? -28 : 4 },
          {
            xPercent: dir > 0 ? 4 : -28,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.9,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        "mask-fade-x",
        className
      )}
    >
      <div className="flex size-full flex-col justify-center gap-14">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            data-drift-track
            data-drift-dir={row % 2 === 0 ? "1" : "-1"}
            className="flex w-max shrink-0 items-center gap-20 will-change-transform"
          >
            {[...providers, ...providers].map((p, i) => (
              <ProviderLogo
                key={`${p.id}-${row}-${i}`}
                id={p.id}
                name={p.name}
                height={row === 0 ? 46 : 34}
                className="opacity-[0.07]"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
