"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { SplitHeading, type SplitMode } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/primitives";
import { AmbientBackdrop } from "@/components/visuals/ambient";
import { useMagnetic } from "@/hooks/use-motion";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Shared inner-page hero.
 *
 * `mode` lets each route pick its own headline choreography — Platform builds
 * line by line, Technology assembles character by character, Industries
 * scatters. Same component, deliberately different feel per page.
 *
 * `visual` fills the column beside the copy. Without it the headline block is
 * capped at `max-w-3xl` inside a much wider container, which left roughly
 * two-fifths of every inner hero empty — the single largest piece of dead
 * space on the site. With it the hero becomes a proper two-column spread and
 * each page carries its own animation there.
 */
export function PageHero({
  eyebrow,
  title,
  highlight,
  body,
  primary,
  secondary,
  children,
  visual,
  className,
  align = "left",
  mode = "lines",
  meta,
}: {
  eyebrow: string;
  title: string;
  highlight?: string[];
  body: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  children?: React.ReactNode;
  /** Rendered in the column beside the copy. Usually a canvas hero scene. */
  visual?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
  mode?: SplitMode;
  /** Optional mono telemetry row under the CTAs. */
  meta?: { label: string; value: string }[];
}) {
  const root = useRef<HTMLElement>(null);
  const ctaRef = useMagnetic<HTMLSpanElement>(0.3);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-ph]"), { opacity: 1, y: 0, clearProps: "all" });
        return;
      }

      gsap.set(q("[data-ph='eyebrow']"), { opacity: 0, y: 12 });
      gsap.set(q("[data-ph='body']"), { opacity: 0, y: 16 });
      gsap.set(q("[data-ph='cta'] > *"), { opacity: 0, y: 14 });
      gsap.set(q("[data-ph='meta'] > *"), { opacity: 0, y: 10 });
      gsap.set(q("[data-ph='rule']"), { scaleX: 0, transformOrigin: "left" });
      gsap.set(q("[data-ph='child']"), { opacity: 0, y: 40 });
      gsap.set(q("[data-ph='visual']"), { opacity: 0, scale: 0.94 });

      const tl = gsap.timeline({ defaults: { ease: EASE.out3 } });

      tl.to(q("[data-ph='eyebrow']"), { opacity: 1, y: 0, duration: 0.5 }, 0.25)
        .to(
          q("[data-ph='rule']"),
          { scaleX: 1, duration: 0.9, ease: EASE.inOut3 },
          0.3
        )
        .to(q("[data-ph='body']"), { opacity: 1, y: 0, duration: 0.62 }, 0.95)
        .to(
          q("[data-ph='cta'] > *"),
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          1.08
        )
        .to(
          q("[data-ph='meta'] > *"),
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 },
          1.2
        )
        .to(
          q("[data-ph='child']"),
          { opacity: 1, y: 0, duration: 1.1, ease: EASE.out4 },
          0.85
        )
        // The visual resolves alongside the headline rather than after it —
        // it is scenery, and scenery that arrives late reads as a load.
        .to(
          q("[data-ph='visual']"),
          { opacity: 1, scale: 1, duration: 1.3, ease: EASE.out4 },
          0.4
        );

      // Parallax the whole copy block out as the page scrolls on.
      gsap.to(q("[data-ph='copy']"), {
        yPercent: -12,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      return () => tl.kill();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className={cn(
        "relative isolate overflow-hidden border-b border-line pb-20 pt-36 md:pb-24 md:pt-44",
        className
      )}
    >
      <AmbientBackdrop variant="hero" />

      <div className="container-page relative">
        <div
          className={cn(
            visual && "grid items-center gap-14 lg:grid-cols-12 lg:gap-16"
          )}
        >
        <div
          data-ph="copy"
          className={cn(
            "flex flex-col",
            visual ? "lg:col-span-7" : "max-w-3xl",
            align === "center" && "mx-auto items-center text-center"
          )}
        >
          <div data-ph="eyebrow">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>

          <SplitHeading
            as="h1"
            text={title}
            highlight={highlight}
            mode={mode}
            scroll={false}
            delay={0.42}
            className="mt-7 text-4xl font-semibold leading-[1.04] tracking-[-0.035em] md:text-5xl lg:text-6xl"
          />

          <div
            data-ph="rule"
            aria-hidden
            className={cn(
              "mt-8 h-px w-full max-w-md bg-gradient-to-r from-primary-border via-line to-transparent",
              align === "center" && "mx-auto"
            )}
          />

          <p
            data-ph="body"
            className="mt-7 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg"
          >
            {body}
          </p>

          {primary || secondary ? (
            <div
              data-ph="cta"
              className={cn(
                "mt-10 flex flex-col gap-3 sm:flex-row",
                align === "center" && "justify-center"
              )}
            >
              {primary ? (
                <span ref={ctaRef} className="inline-block">
                  <Button asChild size="lg" data-cursor="start">
                    <Link href={primary.href}>
                      {primary.label}
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                </span>
              ) : null}
              {secondary ? (
                <Button asChild variant="outline" size="lg">
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}

          {meta?.length ? (
            <div
              data-ph="meta"
              className={cn(
                "mt-12 flex flex-wrap gap-x-10 gap-y-4",
                align === "center" && "justify-center"
              )}
            >
              {meta.map((m) => (
                <div key={m.label} className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">
                    {m.label}
                  </span>
                  <span className="text-lg font-semibold tnum">{m.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

          {visual ? (
            <div data-ph="visual" className="lg:col-span-5">
              {visual}
            </div>
          ) : null}
        </div>

        {children ? (
          <div data-ph="child" className="relative mt-16">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
