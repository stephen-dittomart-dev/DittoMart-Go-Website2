"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, KeyRound, Repeat, Webhook } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Eyebrow, Section } from "@/components/ui/primitives";
import { CodeWindow } from "@/components/visuals/code-window";
import { createOrderResponse, createOrderSamples } from "@/lib/code-samples";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

const HIGHLIGHTS = [
  {
    icon: KeyRound,
    title: "Sandbox before signature",
    body: "Keys are issued the moment you sign up. Build the whole integration against simulated riders before a contract exists.",
  },
  {
    icon: Webhook,
    title: "Signed, retried, idempotent",
    body: "Every state change is pushed to you with an HMAC signature and an idempotency key. Failed deliveries are retried and replayable from the dashboard.",
  },
  {
    icon: Repeat,
    title: "Versioned from day one",
    body: "The v1 contract will not break under you. New capability arrives as new fields and new endpoints, never as a migration.",
  },
];

/**
 * Developer section.
 *
 * Animation language: *terminal*. Copy arrives left-to-right on a monospace
 * rhythm while the code window types itself in — the two halves read as a
 * request being written and answered.
 */
export function Developers() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-dev]"), { opacity: 1, x: 0, y: 0 });
        return;
      }

      gsap.set(q("[data-dev='item']"), { opacity: 0, x: -20 });
      gsap.set(q("[data-dev='rule']"), { scaleX: 0, transformOrigin: "left" });
      gsap.set(q("[data-dev='cta']"), { opacity: 0, y: 12 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 74%", once: true } })
        .to(q("[data-dev='rule']"), {
          scaleX: 1,
          duration: 0.7,
          ease: EASE.inOut3,
          stagger: 0.12,
        })
        .to(
          q("[data-dev='item']"),
          { opacity: 1, x: 0, duration: 0.6, ease: EASE.out3, stagger: 0.12 },
          "-=0.6"
        )
        .to(q("[data-dev='cta']"), { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    },
    { scope: root }
  );

  return (
    <Section id="developers" className="relative border-b border-line">
      <div ref={root} className="container-page">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow>For developers</Eyebrow>

            <SplitHeading
              as="h2"
              mode="chars"
              text="Nine endpoints. One afternoon."
              className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
            />

            <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg">
              The API is the product. There is no portal you must use, no CSV you
              must upload, and no integration consultant you must book.
            </p>

            <div className="mt-10 flex flex-col">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="py-5">
                  <span
                    data-dev="rule"
                    aria-hidden
                    className="mb-5 block h-px w-full bg-gradient-to-r from-line-strong to-transparent"
                  />
                  <div data-dev="item" className="flex gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-primary">
                      <h.icon aria-hidden className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-medium">{h.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                        {h.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div data-dev="cta">
              <Button asChild variant="outline" size="lg" className="mt-4">
                <Link href="/developers">
                  Explore the API
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <CodeWindow
              samples={createOrderSamples}
              response={createOrderResponse}
              title="Create a delivery"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
