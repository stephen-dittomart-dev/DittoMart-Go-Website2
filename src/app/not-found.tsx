"use client";

import { useGSAP } from "@gsap/react";
import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { AmbientBackdrop } from "@/components/visuals/ambient";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

const DESTINATIONS = [
  { label: "Network", href: "/network", desc: "The nine networks we route across" },
  { label: "Platform", href: "/platform", desc: "How the system is put together" },
  { label: "Developers", href: "/developers", desc: "The API and the sandbox" },
  { label: "Contact", href: "/contact", desc: "Talk to a person" },
];

/**
 * 404.
 *
 * Motion language: *misrouted*. The numerals arrive off-target and correct
 * themselves, and a dashed route line searches for a destination it cannot
 * find. It is the only place on the site where motion is allowed to be a joke
 * — and it still explains what happened.
 */
export default function NotFound() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-nf]"), { opacity: 1, x: 0, y: 0, rotate: 0 });
        return;
      }

      gsap.set(q("[data-nf='digit']"), {
        opacity: 0,
        y: (i: number) => [-70, 60, -50][i] ?? 0,
        rotate: (i: number) => [-16, 12, -9][i] ?? 0,
      });
      gsap.set(q("[data-nf='copy']"), { opacity: 0, y: 20 });
      gsap.set(q("[data-nf='cta'] > *"), { opacity: 0, y: 16 });
      gsap.set(q("[data-nf='dest']"), { opacity: 0, y: 20 });
      gsap.set(q("[data-nf='route']"), { drawSVG: "0%" });

      gsap
        .timeline({ defaults: { ease: EASE.out4 } })
        // the digits overshoot, then snap into alignment
        .to(q("[data-nf='digit']"), {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 1.05,
          stagger: 0.09,
        })
        .to(
          q("[data-nf='route']"),
          { drawSVG: "100%", duration: 1.3, ease: EASE.inOut },
          "-=0.7"
        )
        .to(q("[data-nf='copy']"), { opacity: 1, y: 0, duration: 0.65 }, "-=0.85")
        .to(
          q("[data-nf='cta'] > *"),
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 },
          "-=0.45"
        )
        .to(
          q("[data-nf='dest']"),
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 },
          "-=0.35"
        );

      // the search marker keeps hunting
      gsap.to(q("[data-nf='marker']"), {
        keyframes: [
          { x: 22, y: -8, duration: 1.1 },
          { x: -14, y: 10, duration: 1.2 },
          { x: 6, y: -4, duration: 0.9 },
        ],
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.6,
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-dvh items-center overflow-hidden py-32"
    >
      <AmbientBackdrop variant="hero" />

      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <div
            aria-hidden
            className="flex items-center justify-center text-[7rem] font-semibold leading-none tracking-[-0.06em] md:text-[10rem]"
          >
            {["4", "0", "4"].map((d, i) => (
              <span key={i} data-nf="digit" className="text-primary">
                {d}
              </span>
            ))}
          </div>

          {/* a route searching for a destination */}
          <svg
            aria-hidden
            viewBox="0 0 320 40"
            className="mx-auto mt-2 w-full max-w-sm overflow-visible"
          >
            <path
              data-nf="route"
              d="M8 30 C 70 30, 80 8, 140 12 S 240 34, 300 14"
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1.5"
              strokeDasharray="5 6"
            />
            <circle cx="8" cy="30" r="3" fill="var(--color-ember-400)" />
            <g data-nf="marker">
              <circle
                cx="300"
                cy="14"
                r="8"
                fill="var(--warning-soft)"
                stroke="var(--warning)"
                strokeOpacity="0.6"
              />
              <circle cx="300" cy="14" r="2.5" fill="var(--warning)" />
            </g>
          </svg>

          <div data-nf="copy">
            <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
              This route has no serviceable destination
            </h1>
            <p className="mx-auto mt-5 max-w-md leading-relaxed text-fg-muted">
              The page you asked for does not exist, or it moved. Unlike a
              delivery, we cannot reroute this one automatically — but here is
              where most people were heading.
            </p>
          </div>

          <div
            data-nf="cta"
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg">
              <Link href="/">
                <ArrowLeft aria-hidden />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">
                <Compass aria-hidden />
                Tell us what broke
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid gap-3 text-left sm:grid-cols-2">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                data-nf="dest"
                className="group rounded-xl border border-line bg-surface-2/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-border hover:bg-surface"
              >
                <p className="text-sm font-medium transition-colors group-hover:text-primary">
                  {d.label}
                </p>
                <p className="mt-1 text-xs text-fg-subtle">{d.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
