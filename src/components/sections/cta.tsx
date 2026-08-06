"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { AmbientBackdrop } from "@/components/visuals/ambient";
import { useMagnetic } from "@/hooks/use-motion";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Closing CTA.
 *
 * Animation language: *convergence*. Two rules sweep in from the page edges
 * toward the centre and the headline resolves between them — the last thing
 * the page does is bring everything to one point, which is the argument.
 */
export function CTA({
  title = "Stop managing couriers. Start shipping.",
  body = "Sandbox credentials in minutes. A working integration this week. No fleet to buy, no contracts to negotiate, no dashboard to learn.",
  primary = { label: "Book a demo", href: "/contact" },
  secondary = { label: "Read the API docs", href: "/developers" },
  className,
}: {
  title?: string;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const ctaRef = useMagnetic<HTMLSpanElement>(0.36);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-cta]"), { opacity: 1, x: 0, y: 0, scaleX: 1 });
        return;
      }

      gsap.set(q("[data-cta='rule-l']"), { scaleX: 0, transformOrigin: "left" });
      gsap.set(q("[data-cta='rule-r']"), { scaleX: 0, transformOrigin: "right" });
      gsap.set(q("[data-cta='body']"), { opacity: 0, y: 16 });
      gsap.set(q("[data-cta='buttons'] > *"), { opacity: 0, y: 14 });
      gsap.set(q("[data-cta='fine'] > *"), { opacity: 0 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 74%", once: true } })
        .to(
          [q("[data-cta='rule-l']"), q("[data-cta='rule-r']")],
          { scaleX: 1, duration: 1.05, ease: EASE.inOut3 },
          0
        )
        .to(q("[data-cta='body']"), { opacity: 1, y: 0, duration: 0.65 }, 0.6)
        .to(
          q("[data-cta='buttons'] > *"),
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.09, ease: EASE.out3 },
          0.75
        )
        .to(
          q("[data-cta='fine'] > *"),
          { opacity: 1, duration: 0.4, stagger: 0.05 },
          0.95
        );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className={cn("relative overflow-hidden py-28 md:py-36", className)}
    >
      <AmbientBackdrop variant="hero" />

      <div className="container-page relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* converging rules */}
          <div className="mb-10 flex w-full items-center gap-4">
            <span
              data-cta="rule-l"
              aria-hidden
              className="h-px flex-1 bg-gradient-to-r from-transparent to-primary-border"
            />
            <span
              aria-hidden
              className="size-1.5 shrink-0 animate-breathe rounded-full bg-primary"
            />
            <span
              data-cta="rule-r"
              aria-hidden
              className="h-px flex-1 bg-gradient-to-l from-transparent to-primary-border"
            />
          </div>

          <SplitHeading
            as="h2"
            text={title}
            mode="lines"
            className="text-3xl font-semibold leading-[1.05] tracking-[-0.035em] md:text-5xl"
          />

          <p
            data-cta="body"
            className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg"
          >
            {body}
          </p>

          <div
            data-cta="buttons"
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <span ref={ctaRef} className="inline-block">
              <Button asChild size="lg" data-cursor="start">
                <Link href={primary.href}>
                  {primary.label}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </span>
            <Button asChild variant="outline" size="lg">
              <Link href={secondary.href}>
                <Terminal aria-hidden />
                {secondary.label}
              </Link>
            </Button>
          </div>

          <div
            data-cta="fine"
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-2xs text-fg-subtle"
          >
            <span>No setup fee</span>
            <span className="hidden sm:inline">·</span>
            <span>Pay per delivery</span>
            <span className="hidden sm:inline">·</span>
            <span>Cancel any time</span>
            <span className="hidden sm:inline">·</span>
            <span>Chennai, expanding</span>
          </div>
        </div>
      </div>
    </section>
  );
}
