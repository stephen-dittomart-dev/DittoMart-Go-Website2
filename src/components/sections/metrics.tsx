"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { CountUp } from "@/components/motion/count-up";
import { Section } from "@/components/ui/primitives";
import { AmbientBackdrop } from "@/components/visuals/ambient";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

const METRICS = [
  {
    value: 9.2,
    decimals: 1,
    suffix: "s",
    label: "Median time to a rider",
    hint: "From request to a confirmed assignment",
  },
  {
    value: 98.4,
    decimals: 1,
    suffix: "%",
    label: "On-time delivery",
    hint: "Measured against the SLA on the order",
  },
  {
    value: 0,
    decimals: 0,
    suffix: "",
    label: "Double assignments",
    hint: "Structurally prevented, not merely monitored",
  },
  {
    value: 26,
    decimals: 0,
    suffix: "%",
    label: "Average logistics saving",
    hint: "Against single-provider contracted rates",
  },
];

/**
 * Metrics band.
 *
 * Animation language here is *measurement*: the dividing rules draw downward
 * like instrument gridlines before the numbers spin up. No fade-in.
 */
export function Metrics() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-metric], [data-metric-rule]"), {
          opacity: 1,
          scaleY: 1,
          y: 0,
        });
        return;
      }

      gsap.set(q("[data-metric-rule]"), { scaleY: 0, transformOrigin: "top" });
      gsap.set(q("[data-metric] > *"), { opacity: 0, y: 18 });

      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        })
        .to(q("[data-metric-rule]"), {
          scaleY: 1,
          duration: 0.85,
          ease: EASE.inOut3,
          stagger: 0.08,
        })
        .to(
          q("[data-metric] > *"),
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: EASE.out3,
            stagger: { each: 0.05, grid: [1, 4], from: "start" },
          },
          "-=0.5"
        );
    },
    { scope: root }
  );

  return (
    <Section className="relative overflow-hidden border-b border-line py-20 md:py-24">
      <AmbientBackdrop variant="quiet" />
      <div className="container-page relative">
        <p className="text-center text-2xs font-medium uppercase tracking-[0.18em] text-fg-subtle">
          What the system is actually doing
        </p>

        <div
          ref={root}
          className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        >
          {METRICS.map((m) => (
            <div key={m.label} className="relative pl-6 lg:pl-7">
              <span
                data-metric-rule
                aria-hidden
                className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-primary-border via-line to-transparent"
              />
              <div data-metric className="flex flex-col gap-2">
                <span className="text-4xl font-semibold tracking-[-0.035em] md:text-5xl">
                  <CountUp
                    value={m.value}
                    decimals={m.decimals}
                    suffix={m.suffix}
                  />
                </span>
                <span className="text-sm font-medium text-fg">{m.label}</span>
                <span className="text-xs leading-relaxed text-fg-subtle">
                  {m.hint}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-2xs text-fg-subtle">
          Rolling 30-day figures across the Chennai network. Your numbers will
          differ — we report yours, not ours, in your dashboard.
        </p>
      </div>
    </Section>
  );
}
