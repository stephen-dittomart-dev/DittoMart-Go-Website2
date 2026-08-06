"use client";

import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Card, Eyebrow, Section } from "@/components/ui/primitives";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

const QUOTES = [
  {
    quote:
      "We replaced four courier contracts with one endpoint. The part I did not expect was finance — reconciliation used to take two days a month and now it does not exist.",
    name: "Head of Operations",
    role: "Regional grocery chain · 14 dark stores",
    metric: "4 contracts → 1",
  },
  {
    quote:
      "The temperature certificate settled an argument we have been having with a hospital procurement team for a year. We stopped debating and started attaching the file.",
    name: "Supply Chain Lead",
    role: "Diagnostics network · Chennai",
    metric: "Zero cold-chain disputes",
  },
  {
    quote:
      "Broadcast dispatch was the whole reason we moved. During the evening peak our old provider would just sit on requests. Now four fleets race for the order and someone always wins.",
    name: "Founder",
    role: "Cloud kitchen group · 9 outlets",
    metric: "Peak SLA 91% → 98%",
  },
];

/**
 * Testimonials as a draggable rail rather than a grid.
 *
 * Cards enter on a horizontal scrub tied to page scroll, then remain
 * manually navigable. Distinct from every other section on the page, which
 * is the point — this is the one place the reader is invited to browse
 * laterally rather than continue downward.
 */
export function Testimonials() {
  const root = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-quote]", el);

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, x: 0, rotate: 0 });
        return;
      }

      gsap.set(cards, { opacity: 0, x: 70, rotate: 1.5 });

      gsap.to(cards, {
        opacity: 1,
        x: 0,
        rotate: 0,
        duration: 0.95,
        ease: EASE.out4,
        stagger: 0.13,
        scrollTrigger: { trigger: el, start: "top 76%", once: true },
      });
    },
    { scope: root }
  );

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(QUOTES.length - 1, i));
    setIndex(clamped);
    const card = track.children[clamped] as HTMLElement | undefined;
    if (!card) return;

    if (prefersReducedMotion()) {
      track.scrollLeft = card.offsetLeft - 16;
      return;
    }
    gsap.to(track, {
      scrollLeft: card.offsetLeft - 16,
      duration: DUR.reveal,
      ease: EASE.out3,
      overwrite: true,
    });
  }, []);

  return (
    <Section className="relative border-b border-line">
      <div className="container-page">
        <div className="flex flex-col items-center gap-5 text-center">
          <Eyebrow>In production</Eyebrow>
          <SplitHeading
            as="h2"
            mode="words"
            text="The businesses running on it"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
        </div>

        <div ref={root} className="mt-14">
          <div
            ref={trackRef}
            data-lenis-prevent
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible"
          >
            {QUOTES.map((q, i) => (
              <div
                key={q.name + q.role}
                data-quote
                className="w-[85vw] shrink-0 snap-start sm:w-[62vw] md:w-[46vw] lg:w-auto"
              >
                <Card
                  className={cn(
                    "group flex h-full flex-col p-7 transition-[border-color,transform] duration-500 md:p-8",
                    "hover:-translate-y-1 hover:border-primary-border",
                    i === index && "lg:border-line"
                  )}
                >
                  <Quote
                    aria-hidden
                    className="size-6 shrink-0 text-primary opacity-40 transition-opacity duration-300 group-hover:opacity-80"
                  />
                  <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-fg">
                    {q.quote}
                  </blockquote>
                  <div className="mt-7 border-t border-line pt-5">
                    <p className="text-sm font-medium">{q.name}</p>
                    <p className="mt-0.5 text-xs text-fg-subtle">{q.role}</p>
                    <p className="mt-3 inline-flex rounded-full border border-primary-border bg-primary-soft px-2.5 py-1 text-2xs font-medium text-primary">
                      {q.metric}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* rail controls — mobile/tablet only, where the track scrolls */}
          <div className="mt-6 flex items-center justify-between lg:hidden">
            <div className="flex gap-1.5">
              {QUOTES.map((q, i) => (
                <button
                  key={q.name}
                  type="button"
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={cn(
                    "h-1 rounded-full transition-all duration-400",
                    i === index ? "w-8 bg-primary" : "w-4 bg-line-strong"
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollTo(index - 1)}
                disabled={index === 0}
                aria-label="Previous testimonial"
                className="inline-flex size-9 items-center justify-center rounded-xl border border-line text-fg-muted transition-colors hover:border-primary-border hover:text-primary disabled:opacity-40"
              >
                <ArrowLeft aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTo(index + 1)}
                disabled={index === QUOTES.length - 1}
                aria-label="Next testimonial"
                className="inline-flex size-9 items-center justify-center rounded-xl border border-line text-fg-muted transition-colors hover:border-primary-border hover:text-primary disabled:opacity-40"
              >
                <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-2xs text-fg-subtle">
          Customer names withheld at their request during the early access
          programme.
        </p>
      </div>
    </Section>
  );
}
