"use client";

import { useGSAP } from "@gsap/react";
import { ArrowDownLeft, ArrowUpRight, Globe2 } from "lucide-react";
import { useRef } from "react";
import { Chapter, MediaPlate } from "@/components/motion/scene";
import { SplitHeading } from "@/components/motion/split-heading";
import { Badge, Card, Section } from "@/components/ui/primitives";
import { media } from "@/lib/media";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { ondcCarriers } from "@/lib/providers";

/**
 * Illustrated ONDC chapter — used on home, ahead of the interactive
 * two-role diagram which carries the detail.
 */
export function OndcChapter() {
  return (
    <>
      <Chapter
        id="ondc-intro"
        eyebrow={
          <Badge variant="accent" size="sm">
            <Globe2 aria-hidden className="size-3" />
            ONDC · LOG10
          </Badge>
        }
        media={
          <MediaPlate
            src={media.ondc.src}
            alt={media.ondc.alt}
            caption={media.ondc.caption}
            glow="accent"
          />
        }
      >
        <SplitHeading
          as="h2"
          mode="lines"
          text="Two registrations. Two revenue directions."
          className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
        />
        <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
          We hold both ONDC roles at once. As a logistics buyer we search the
          network and purchase the cheapest or fastest capacity — that is how Ola
          and Rapido reach your order. As a logistics seller we publish our own
          fleet back to the network, so external apps can buy our riders.
        </p>
        <p className="mt-5 rounded-2xl border border-primary-border bg-primary-soft px-5 py-4 text-sm font-medium text-fg">
          Zero idle riders. When B2B clients have no orders, ONDC network orders
          reach the riders instead. Dual revenue stream.
        </p>
      </Chapter>
      <OndcDual />
    </>
  );
}

const ROLES = [
  {
    key: "buyer",
    icon: ArrowDownLeft,
    title: "We buy capacity",
    sub: "Buyer participant · BNP",
    body: "Your order searches the open network, collects quotes from every logistics provider on it, and buys the best one. That is how Ola and Rapido capacity reaches your delivery without you — or us — signing a bilateral contract with either.",
    flow: ["/search", "/select", "/init", "/confirm", "/status", "/track"],
    result: "Ola · Rapido and every other network provider, through one call",
  },
  {
    key: "seller",
    icon: ArrowUpRight,
    title: "We sell capacity",
    sub: "Seller participant · SNP",
    body: "When our own riders would otherwise sit idle, we publish that capacity back to the network and fulfil orders originating anywhere on it. Idle time becomes revenue instead of cost — which is part of why our rates hold.",
    flow: ["/on_search", "/on_select", "/on_init", "/on_confirm", "/on_status"],
    result: "Zero idle riders — the fleet earns between your orders",
  },
];

/**
 * ONDC dual role.
 *
 * Motion language: *two directions*. The two roles enter from opposite sides
 * and a pair of counter-travelling packets runs between them, because the
 * entire point of the section is that traffic flows both ways.
 */
export function OndcDual() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-ondc]"), { opacity: 1, x: 0 });
        return;
      }

      gsap.set(q("[data-ondc='buyer']"), { opacity: 0, x: -44 });
      gsap.set(q("[data-ondc='seller']"), { opacity: 0, x: 44 });
      gsap.set(q("[data-ondc='chip']"), { opacity: 0, scale: 0.7 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 76%", once: true } })
        .to([q("[data-ondc='buyer']"), q("[data-ondc='seller']")], {
          opacity: 1,
          x: 0,
          duration: 0.95,
          ease: EASE.out4,
          stagger: 0.12,
        })
        .to(
          q("[data-ondc='chip']"),
          { opacity: 1, scale: 1, duration: 0.34, ease: EASE.back, stagger: 0.04 },
          "-=0.5"
        );
    },
    { scope: root }
  );

  return (
    <Section id="ondc" className="scroll-mt-24 border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <SplitHeading
            as="h2"
            mode="lines"
            text="Ola and Rapido, without signing with Ola or Rapido"
            highlight={["Ola", "Rapido,"]}
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            We are a participant on the open network in both directions. That gives
            us national reach we did not have to negotiate, and a second revenue
            line when our own fleet is idle.
          </p>
        </div>

        <div ref={root} className="mt-14 grid gap-4 lg:grid-cols-2">
          {ROLES.map((role) => (
            <div key={role.key} data-ondc={role.key}>
              <Card className="flex h-full flex-col p-7 md:p-8">
                <div className="flex items-center gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-accent-soft text-accent">
                    <role.icon aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">{role.title}</h3>
                    <p className="font-mono text-2xs uppercase tracking-[0.12em] text-fg-subtle">
                      {role.sub}
                    </p>
                  </div>
                </div>

                <p className="mt-5 flex-1 leading-relaxed text-fg-muted">
                  {role.body}
                </p>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {role.flow.map((f) => (
                    <span
                      key={f}
                      data-ondc="chip"
                      className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-2xs text-fg-muted"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-primary-border bg-primary-soft px-4 py-3">
                  <p className="text-sm font-medium text-fg">{role.result}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-dashed border-line p-6">
          <span className="text-sm text-fg-muted">Reached over ONDC today:</span>
          {ondcCarriers.map((c) => (
            <span
              key={c}
              className="rounded-full border border-line bg-surface-2/60 px-3 py-1.5 text-sm font-medium"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
