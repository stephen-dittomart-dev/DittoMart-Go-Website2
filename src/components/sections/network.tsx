"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, Box, Check } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Marquee, Spotlight } from "@/components/motion/interactions";
import { SplitHeading } from "@/components/motion/split-heading";
import { StickyStory, StoryPips } from "@/components/motion/sticky-story";
import { Button } from "@/components/ui/button";
import { Badge, Card, Eyebrow, Section } from "@/components/ui/primitives";
import { getIcon } from "@/lib/icon-registry";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { providers, providerStats } from "@/lib/providers";
import { cn } from "@/lib/utils";

const railTone = {
  "3PL": "border-primary-border bg-primary-soft text-primary",
  ONDC: "border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-accent-soft text-accent",
  ROUTING:
    "border-[color-mix(in_oklab,var(--ai)_35%,transparent)] bg-ai-soft text-ai",
  NETWORK: "border-line bg-surface-2 text-fg-muted",
} as const;

/* =========================================================================
   The partner rail — a continuously moving band of every network we can
   reach. This is the first proof on the page that the aggregation claim is
   real, so it sits directly under the hero.
   ========================================================================= */

export function NetworkRail({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative border-y border-line bg-bg-subtle/70",
        compact ? "py-6" : "py-8"
      )}
    >
      <p className="container-page mb-6 text-center font-mono text-2xs font-medium uppercase tracking-[0.18em] text-fg-subtle">
        {providerStats.total} delivery networks · one integration
      </p>

      <Marquee duration={42}>
        {providers.map((p) => {
          const Icon = getIcon(p.icon) ?? Box;
          return (
            <span
              key={p.id}
              className="flex select-none items-center gap-2.5 whitespace-nowrap opacity-60 transition-opacity duration-300 hover:opacity-100"
            >
              <Icon aria-hidden className="size-4 text-primary" />
              <span className="text-base font-semibold tracking-[-0.01em] md:text-lg">
                {p.name}
              </span>
            </span>
          );
        })}
      </Marquee>
    </div>
  );
}

/* =========================================================================
   Home section — the network told with the sticky-story pattern.
   ========================================================================= */

export function NetworkStory() {
  return (
    <Section id="network" className="border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>The network</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines-alt"
            text="Nine delivery networks. You integrate with one."
            highlight={["Nine", "networks."]}
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Every partner below is contracted, rate-carded and reachable through
            the same API call. The routing engine picks between them on cost, ETA
            and reliability — you never choose a courier again.
          </p>
        </div>

        <StickyStory
          className="mt-16"
          narratorHeader={(active) => (
            <StoryPips count={providers.length} active={active} className="mb-8" />
          )}
          items={providers.map((p, i) => {
            const Icon = getIcon(p.icon) ?? Box;
            return {
              id: p.id,
              narrator: (
                <div style={{ animation: "dm-step-in 560ms var(--ease-out-expo)" }}>
                  <div className="flex items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary shadow-e1">
                      <Icon aria-hidden className="size-6" />
                    </span>
                    <span className="font-mono text-4xl font-semibold tnum text-fg-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-7 text-2xl font-semibold leading-tight tracking-[-0.025em] md:text-3xl">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-primary">
                    {p.tagline}
                  </p>
                  <p className="mt-4 max-w-md leading-relaxed text-fg-muted">
                    {p.body}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 font-mono text-2xs font-semibold uppercase tracking-wide",
                        railTone[p.rail]
                      )}
                    >
                      {p.rail === "ROUTING" ? "Routing layer" : `${p.rail} rail`}
                    </span>
                    <span className="rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-2xs text-fg-muted">
                      {p.coverage}
                    </span>
                  </div>
                </div>
              ),
              panel: (
                <Card
                  className={cn(
                    "p-7 transition-colors duration-500 md:p-8 lg:flex lg:min-h-[54vh] lg:flex-col lg:justify-center",
                    "group hover:border-primary-border"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-muted transition-colors duration-500 group-hover:border-primary-border group-hover:bg-primary-soft group-hover:text-primary">
                      <Icon aria-hidden className="size-[18px]" />
                    </span>
                    <span className="font-mono text-xs text-fg-subtle">
                      {String(i + 1).padStart(2, "0")} / {providers.length}
                    </span>
                  </div>

                  <h4 className="mt-6 text-lg font-medium tracking-[-0.015em]">
                    {p.name}
                  </h4>

                  <ul className="mt-5 flex flex-col gap-3">
                    {p.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2.5">
                        <Check
                          aria-hidden
                          className="mt-0.5 size-3.5 shrink-0 text-primary"
                          strokeWidth={3}
                        />
                        <span className="text-sm leading-relaxed text-fg-muted">
                          {s}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-xl border border-line bg-surface-2/60 px-4 py-3">
                    <p className="font-mono text-2xs uppercase tracking-[0.12em] text-fg-subtle">
                      Routed here when
                    </p>
                    <p className="mt-1 text-sm text-fg">{p.bestFor}</p>
                  </div>
                </Card>
              ),
            };
          })}
        />

        <div className="mt-14 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/network">
              See the full network
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}

/* =========================================================================
   Full grid — used on /network under the sticky story.
   ========================================================================= */

export function NetworkGrid() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-net-card]", el);

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, y: 0, rotate: 0 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 56, rotate: -2 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        rotate: 0,
        duration: 0.9,
        ease: EASE.out4,
        stagger: { each: 0.07, grid: [3, 3], from: "start" },
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <Section className="border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>At a glance</Eyebrow>
          <SplitHeading
            as="h2"
            mode="words"
            text="Every rail, side by side"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
        </div>

        <div ref={root} className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => {
            const Icon = getIcon(p.icon) ?? Box;
            return (
              <div key={p.id} data-net-card>
                <Spotlight className="h-full rounded-2xl">
                  <Card className="group flex h-full flex-col p-6 hover:-translate-y-1 hover:border-primary-border hover:shadow-e2 md:p-7">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-muted transition-colors duration-300 group-hover:border-primary-border group-hover:bg-primary-soft group-hover:text-primary">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <Badge
                        size="sm"
                        variant={
                          p.rail === "ONDC"
                            ? "accent"
                            : p.rail === "ROUTING"
                              ? "ai"
                              : "brand"
                        }
                      >
                        {p.rail === "ROUTING" ? "Routing" : p.rail}
                      </Badge>
                    </div>

                    <h3 className="mt-5 text-lg font-medium tracking-[-0.015em]">
                      {p.name}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-primary">
                      {p.tagline}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
                      {p.body}
                    </p>

                    <div className="mt-6 border-t border-line pt-4">
                      <p className="font-mono text-2xs uppercase tracking-[0.12em] text-fg-subtle">
                        Best for
                      </p>
                      <p className="mt-1 text-sm text-fg">{p.bestFor}</p>
                    </div>
                  </Card>
                </Spotlight>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
