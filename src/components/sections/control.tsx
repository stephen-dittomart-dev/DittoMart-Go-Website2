"use client";

import { useGSAP } from "@gsap/react";
import { Eye, Gauge, ScrollText, SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow, Section } from "@/components/ui/primitives";
import { ConsoleMock } from "@/components/visuals/console-mock";
import { EASE, gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CONTROLS = [
  {
    icon: Eye,
    title: "See every order, everywhere",
    body: "One board across every provider, every zone and every rail — with the exceptions surfaced first and the happy path given the least ink.",
  },
  {
    icon: Gauge,
    title: "Watch the invariants, not the noise",
    body: "Time to accept, cancel fan-out latency, cancellation cost, double assignments. If the system is healthy, four numbers tell you so.",
  },
  {
    icon: SlidersHorizontal,
    title: "Change anything without a deploy",
    body: "Tariff rules, routing weights, broadcast fan-out, provider eligibility, feature flags per client. Configuration, not release cycles.",
  },
  {
    icon: ScrollText,
    title: "Every override leaves a trail",
    body: "Pin an order, adjust a balance, force a rate — each requires a reason and lands in an append-only audit log.",
  },
];

/**
 * Operations console.
 *
 * Animation language: *focus*. The four capabilities behave like a reading
 * list — the one nearest the centre of the viewport brightens and its rule
 * extends, the rest recede. Nothing moves position; only emphasis shifts.
 */
export function Control() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-control-item]", el);

      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 1, x: 0 });
        return;
      }

      gsap.set(items, { opacity: 0, x: 30 });
      gsap.to(items, {
        opacity: 1,
        x: 0,
        duration: 0.75,
        ease: EASE.out4,
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 76%", once: true },
      });

      items.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 62%",
          end: "bottom 52%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });

      gsap.to(el.querySelector("[data-control-visual]"), {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      });
    },
    { scope: root }
  );

  return (
    <Section id="control" className="relative border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>Operations</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines"
            text="Enterprise control, without an enterprise rollout"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Your team gets the same console our operations team uses — scoped to
            your data, governed by your roles.
          </p>
        </div>

        <div ref={root} className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div data-control-visual className="lg:col-span-7">
            <ConsoleMock />
          </div>

          <div className="flex flex-col lg:col-span-5">
            {CONTROLS.map((c, i) => (
              <div
                key={c.title}
                data-control-item
                className="relative flex gap-4 py-5 first:pt-0"
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-0 h-full w-px transition-colors duration-500",
                    i === active ? "bg-primary" : "bg-line"
                  )}
                />
                <span
                  className={cn(
                    "ml-6 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-500",
                    i === active
                      ? "border-primary-border bg-primary-soft text-primary"
                      : "border-line bg-surface-2 text-fg-subtle"
                  )}
                >
                  <c.icon aria-hidden className="size-4" />
                </span>
                <div
                  className={cn(
                    "transition-opacity duration-500",
                    i === active ? "opacity-100" : "opacity-55"
                  )}
                >
                  <h3 className="text-base font-medium">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
