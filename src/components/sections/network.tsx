"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, Box, Check } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Marquee, Spotlight } from "@/components/motion/interactions";
import { SplitHeading } from "@/components/motion/split-heading";
import { StickyStory, StoryPips } from "@/components/motion/sticky-story";
import { Button } from "@/components/ui/button";
import { Badge, Card, Eyebrow, Section } from "@/components/ui/primitives";
import { getIcon } from "@/lib/icon-registry";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { networkMarks } from "@/lib/network-marks";
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

                  {/*
                    The partner's own mark, arriving from the left under the
                    rail line.

                    It is deliberately a beat behind the copy above it — the
                    narrator block runs `dm-step-in` on mount and this waits
                    260ms — so the reader gets the name first and the logo as
                    confirmation, rather than both landing on top of each
                    other.

                    A white plate and `object-contain`: these marks arrive in
                    wildly different shapes, and several carry a cream
                    background baked into the file. On the page's own surface
                    half of them would sit in a pale rectangle of the wrong
                    colour; on white, all nine look intended.

                    The whole narrator is keyed by provider id in
                    `StickyStory`, so this subtree genuinely remounts on every
                    change — which is what lets a plain CSS animation replay.
                    Without that key it would run once and never again.
                  */}
                  {networkMarks[p.id] ? (
                    <div
                      className="mt-8 inline-block"
                      style={{
                        animation:
                          "dm-slide-in-left 620ms var(--ease-out-expo) 260ms both",
                      }}
                    >
                      <PartnerMark src={networkMarks[p.id]} />
                    </div>
                  ) : null}
                </div>
              ),
              panel: (
                <Card
                  className={cn(
                    "overflow-hidden p-7 transition-colors duration-500 md:p-8 lg:flex lg:min-h-[54vh] lg:flex-col lg:justify-center",
                    "group hover:border-primary-border"
                  )}
                >
                  {/*
                    Three quiet layers, and no more.

                    The panel was a flat surface with a list on it, which read
                    as a form rather than as a card worth looking at. What is
                    added here is only ever behind the text: a hairline grid
                    for texture, one warm corner light so the surface has a
                    direction, and the partner's index set enormous and nearly
                    invisible in the corner.

                    Everything is under 8% opacity. The temptation with a
                    panel like this is to add a gradient, a pattern, a badge
                    and a glow until the content is competing with its own
                    background — this stops at the point where you can feel
                    the depth but cannot name what is producing it.
                  */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.5]"
                    style={{
                      backgroundImage:
                        "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
                      backgroundSize: "34px 34px",
                      maskImage:
                        "radial-gradient(ellipse 70% 60% at 80% 0%, #000, transparent 70%)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-1/4 -top-1/3 aspect-square w-[120%] rounded-full opacity-[0.55] blur-3xl transition-opacity duration-500 group-hover:opacity-90"
                    style={{
                      background:
                        "radial-gradient(closest-side, var(--spot-1), transparent 72%)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -left-2 select-none font-mono text-[9rem] font-bold leading-none tracking-tighter text-fg opacity-[0.035]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="relative flex items-center justify-between gap-4">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-fg-muted transition-colors duration-500 group-hover:border-primary-border group-hover:bg-primary-soft group-hover:text-primary">
                      <Icon aria-hidden className="size-[18px]" />
                    </span>
                    <span className="font-mono text-xs text-fg-subtle">
                      {String(i + 1).padStart(2, "0")} / {providers.length}
                    </span>
                  </div>

                  <h4 className="relative mt-6 text-lg font-medium tracking-[-0.015em]">
                    {p.name}
                  </h4>

                  <ul className="relative mt-5 flex flex-col gap-3">
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

                  <div className="relative mt-6 rounded-xl border border-line bg-surface-2/70 px-4 py-3 backdrop-blur-sm">
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

/**
 * The partner's mark, inside a ring of light that never stops turning.
 *
 * The border is a conic gradient on a square element twice the plate's width,
 * spun by a plain CSS rotation and clipped by the parent's `overflow-hidden`.
 * That is the only version of this effect that stays smooth: it animates one
 * `transform` on one element, so it composites on the GPU and costs nothing
 * per frame. Animating a `border-image`, or a gradient's colour stops, or a
 * `background-position`, all repaint the element every frame instead.
 *
 * The conic runs mostly transparent with a short lit arc, so what travels the
 * edge reads as a highlight sweeping round rather than the whole border
 * changing colour. Underneath it a blurred copy of the same gradient throws a
 * soft glow onto the page — the ring alone looks pasted on.
 *
 * `p-px` on the frame is the border width. Any more and the conic reads as a
 * coloured band; any less and it disappears on a low-DPI screen.
 */
function PartnerMark({ src }: { src: StaticImageData }) {
  const conic =
    "conic-gradient(from 0deg, transparent 0 52%, rgba(251,128,56,0.35) 62%, #fb8038 74%, #ffc247 82%, #5bd9cb 90%, transparent 97%)";

  return (
    <span className="relative inline-block">
      {/* the glow it casts */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[26px] opacity-60 blur-xl"
      >
        <span
          className="absolute left-1/2 top-1/2 aspect-square w-[190%] -translate-x-1/2 -translate-y-1/2 animate-[dm-spin-slow_5.5s_linear_infinite]"
          style={{ background: conic }}
        />
      </span>

      {/* the ring */}
      <span className="relative block overflow-hidden rounded-[20px] p-px">
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[190%] -translate-x-1/2 -translate-y-1/2 animate-[dm-spin-slow_5.5s_linear_infinite]"
          style={{ background: conic }}
        />
        {/* a base ring so the unlit three-quarters is not simply nothing */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-[20px] border border-line"
        />

        <span className="relative flex items-center gap-4 rounded-[19px] bg-white py-3.5 pl-4 pr-5 shadow-e1">
          <span className="media-zoom relative block h-16 w-36 shrink-0 rounded-md">
            <span data-zoom className="absolute inset-0 block">
              <Image
                src={src}
                alt=""
                fill
                sizes="144px"
                quality={84}
                className="object-contain"
              />
            </span>
          </span>
          <span className="flex flex-col gap-1 border-l border-black/10 pl-4">
            <span className="font-mono text-2xs uppercase tracking-[0.18em] text-[#a0968a]">
              Partner
            </span>
            <span className="flex items-center gap-1.5 font-mono text-2xs text-[#3a322b]">
              <span className="size-1.5 animate-breathe rounded-full bg-[#e04e0f]" />
              Contracted
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}
