"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ScrubVideo, StatStrip } from "@/components/motion/scene";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/primitives";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { operationsVideo } from "@/lib/media";

/**
 * The second film — "the platform, running".
 *
 * Deliberately placed deep in the page, after the operations console and
 * well clear of the opening film, so the two never sit near each other. It
 * reuses the same ScrubVideo frame and responsive behaviour as the first,
 * but the band around it is inverted to a dark plate: by this point the
 * reader has passed several sand-toned sections, and dropping to dark makes
 * the video read as a screening rather than another content block.
 */
export function OperationsFilm() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el.querySelectorAll("[data-of-copy] > *"),
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: EASE.out4,
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="operations-film"
      className="relative scroll-mt-24 overflow-hidden border-y border-line bg-[#0d0a08] py-24 md:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, color-mix(in oklab, var(--color-ember-500) 45%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-[0.12]"
      />

      <div className="container-page relative">
        <div
          data-of-copy
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <Eyebrow
            className="border-white/20 bg-white/5 text-white/70"
            icon={<MonitorPlay className="size-3" />}
          >
            In operation
          </Eyebrow>

          <SplitHeading
            as="h2"
            mode="bounce"
            text="The whole system, running"
            className="mt-6 text-3xl font-semibold leading-[1.06] tracking-[-0.03em] text-white md:text-5xl"
          />

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Orders arriving, rates locking, nine networks competing, riders
            moving and proof coming back — the platform doing on an ordinary
            afternoon exactly what the diagrams above describe.
          </p>
        </div>

        <ScrubVideo
          src={operationsVideo}
          className="mx-auto mt-14 max-w-5xl"
          label="DittoMart Go — the platform in operation"
        />

        <div data-of-copy className="mt-12 flex justify-center">
          <Link
            href="/platform"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ember-400)]"
          >
            See how each engine works
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      <div className="relative mt-20 [&_[data-strip-item]]:!bg-[#0d0a08] [&_[data-strip-item]]:text-white">
        <StatStrip
          className="!border-white/10 !bg-white/10"
          items={[
            { value: "1,284", label: "Orders on the board" },
            { value: "9.2s", label: "Median time to rider" },
            { value: "522ms", label: "Cancel fan-out" },
            { value: "0", label: "Double assignments" },
          ]}
        />
      </div>
    </section>
  );
}
