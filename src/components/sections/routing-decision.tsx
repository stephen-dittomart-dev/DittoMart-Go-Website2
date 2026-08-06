"use client";

import { useGSAP } from "@gsap/react";
import { Bike, Truck } from "lucide-react";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Card, Eyebrow, Section } from "@/components/ui/primitives";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Section 14 of the flowchart — "Smart Routing Decision: 3PL vs Direct Agency",
 * rendered as the fork it actually is.
 *
 * Motion language: *the fork*. A single inbound line splits into two branches
 * that draw outward simultaneously, then the winning conditions fill in on
 * each side. It is the only diagram on the site that animates symmetrically.
 */

const AGENCY = [
  "Agency already covers the pincode",
  "Dedicated riders online right now",
  "Client is on a Direct Fleet tier",
  "High-volume zone — cheaper than 3PL",
  "Same-hour or hyperlocal SLA",
  "Cold-chain capability we control",
];

const THIRD_PARTY = [
  "No agency coverage in that pincode",
  "Agency fleet fully occupied",
  "Overflow and peak spillover",
  "Cross-city or long-corridor runs",
  "Agency offline or off-shift",
  "Special vehicle class we do not own",
];

export function RoutingDecision() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-rd]"), { opacity: 1, x: 0, y: 0 });
        gsap.set(q("[data-rd-wire]"), { drawSVG: "100%" });
        return;
      }

      gsap.set(q("[data-rd-wire]"), { drawSVG: "0%" });
      gsap.set(q("[data-rd='node']"), { opacity: 0, scale: 0.6 });
      gsap.set(q("[data-rd='left']"), { opacity: 0, x: -34 });
      gsap.set(q("[data-rd='right']"), { opacity: 0, x: 34 });
      gsap.set(q("[data-rd='row']"), { opacity: 0, y: 10 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 74%", once: true } })
        .to(q("[data-rd='node']"), {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: EASE.back,
        })
        .to(
          q("[data-rd-wire]"),
          { drawSVG: "100%", duration: 0.9, ease: EASE.out3 },
          "-=0.15"
        )
        .to(
          [q("[data-rd='left']"), q("[data-rd='right']")],
          { opacity: 1, x: 0, duration: 0.85, ease: EASE.out4 },
          "-=0.55"
        )
        .to(
          q("[data-rd='row']"),
          { opacity: 1, y: 0, duration: 0.34, ease: EASE.out3, stagger: 0.045 },
          "-=0.45"
        );
    },
    { scope: root }
  );

  return (
    <Section className="border-b border-line">
      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Eyebrow>Smart routing</Eyebrow>
          <SplitHeading
            as="h2"
            mode="words"
            text="Own fleet or partner network — decided per order"
            className="text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Every order hits the same fork. There is no default partner and no
            standing preference — cost, ETA, live rider availability and vehicle
            capability decide it, order by order.
          </p>
        </div>

        <div ref={root} className="mt-14">
          {/* the fork */}
          <svg
            aria-hidden
            viewBox="0 0 900 96"
            className="mx-auto hidden w-full max-w-4xl md:block"
          >
            <g data-rd="node">
              <rect
                x="390"
                y="4"
                width="120"
                height="34"
                rx="10"
                fill="var(--primary-soft)"
                stroke="var(--primary-border)"
              />
              <text
                x="450"
                y="26"
                textAnchor="middle"
                className="fill-[var(--primary)] font-mono text-[11px] font-semibold"
              >
                ORDER IN
              </text>
            </g>
            <path
              data-rd-wire
              d="M450 38 V 58 H 170 V 88"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.75"
            />
            <path
              data-rd-wire
              d="M450 38 V 58 H 730 V 88"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.75"
            />
          </svg>

          <div className="grid gap-4 md:grid-cols-2">
            <div data-rd="left">
              <Card className="h-full border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[linear-gradient(160deg,var(--accent-soft),transparent_60%)] p-7 md:p-8">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-accent-soft text-accent">
                    <Bike aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">Direct agency fleet</h3>
                    <p className="font-mono text-2xs uppercase tracking-[0.12em] text-fg-subtle">
                      Our riders · our SLA
                    </p>
                  </div>
                </div>

                <ul className="mt-6 flex flex-col gap-3">
                  {AGENCY.map((a) => (
                    <li key={a} data-rd="row" className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[7px] size-1 shrink-0 rounded-full bg-accent"
                      />
                      <span className="text-sm leading-relaxed text-fg">{a}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <div data-rd="right">
              <Card className="h-full border-primary-border bg-[linear-gradient(160deg,var(--primary-soft),transparent_60%)] p-7 md:p-8">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-primary-border bg-primary-soft text-primary">
                    <Truck aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">Partner networks</h3>
                    <p className="font-mono text-2xs uppercase tracking-[0.12em] text-fg-subtle">
                      Nine rails · instant reach
                    </p>
                  </div>
                </div>

                <ul className="mt-6 flex flex-col gap-3">
                  {THIRD_PARTY.map((t) => (
                    <li key={t} data-rd="row" className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-[7px] size-1 shrink-0 rounded-full bg-primary"
                      />
                      <span className="text-sm leading-relaxed text-fg">{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <div
            className={cn(
              "mt-6 rounded-2xl border border-dashed border-line px-6 py-5 text-center"
            )}
          >
            <p className="text-sm text-fg-muted">
              Ranking inputs:{" "}
              <span className="font-medium text-fg">cost</span> ·{" "}
              <span className="font-medium text-fg">ETA</span> ·{" "}
              <span className="font-medium text-fg">provider scorecard</span> ·{" "}
              <span className="font-medium text-fg">vehicle capability</span> ·{" "}
              <span className="font-medium text-fg">temperature capability</span>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
