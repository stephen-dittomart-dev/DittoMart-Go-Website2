"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { ScrubVideo, StatStrip } from "@/components/motion/scene";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow } from "@/components/ui/primitives";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { introVideo } from "@/lib/media";

/**
 * "Get the highlights" — the film chapter.
 *
 * Apple puts its announcement film immediately after the hero, before any
 * feature copy, because the film does the emotional work and the features do
 * the rational work. Same order here: the intro video is scrubbed by scroll,
 * so the viewer drives it rather than waiting on it.
 */
export function Film() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el.querySelectorAll("[data-film-copy] > *"),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: EASE.out4,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="film"
      className="relative scroll-mt-24 overflow-hidden border-b border-line bg-bg-subtle py-24 md:py-32"
    >
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-60 mask-fade-b"
      />

      <div className="container-page relative">
        <div
          data-film-copy
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <Eyebrow icon={<Play className="size-3" />}>Get the highlights</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines"
            text="Watch a delivery find its own rider"
            className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-5xl"
          />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg">
            One order in. Nine networks compete. One rider wins, in about nine
            seconds. Scroll to play it through.
          </p>
        </div>

        <ScrubVideo
          src={introVideo}
          className="mx-auto mt-14 max-w-5xl"
          label="DittoMart Go — how one order finds its rider"
        />

        <div data-film-copy className="mt-12 flex justify-center">
          <Link
            href="/network"
            className="group inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            See every network in the film
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      <div className="mt-20">
        <StatStrip
          items={[
            { value: "9", label: "Delivery networks" },
            { value: "9.2s", label: "Median time to rider" },
            { value: "98.4%", label: "On-time delivery" },
            { value: "0", label: "Double assignments" },
          ]}
        />
      </div>
    </section>
  );
}
