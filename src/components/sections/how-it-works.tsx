"use client";

import { useGSAP } from "@gsap/react";
import { CheckCircle2, Route, Send, Wallet } from "lucide-react";
import { useRef, useState } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow, Section } from "@/components/ui/primitives";
import {
  DUR,
  EASE,
  gsap,
  prefersReducedMotion,
  registerGsap,
  ScrollTrigger,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    icon: Send,
    title: "You send one request",
    body: "Pickup, drop, package, temperature class, COD, SLA. One POST. Idempotent on your own order reference, so retries are free.",
    detail: "POST /api/v1/orders",
    lines: [
      { k: "client_order_ref", v: '"SO-48213"' },
      { k: "product_type", v: '"CHILLED"' },
      { k: "sla_minutes", v: "60" },
    ],
  },
  {
    n: "02",
    icon: Wallet,
    title: "We price it and fund it",
    body: "The tariff engine matches the most specific rule that applies to you and locks the rate on the order. The wallet verifies funds before a single provider is contacted.",
    detail: "Rate locked · ₹56.00",
    lines: [
      { k: "matched_rule", v: '"P3 client+zone"' },
      { k: "quoted_rate", v: "56.00" },
      { k: "wallet_check", v: '"sufficient"' },
    ],
  },
  {
    n: "03",
    icon: Route,
    title: "We find the fastest way there",
    body: "Every eligible provider is ranked on cost, ETA, reliability and vehicle capability — then triggered in parallel. First to accept wins. Everyone else is cancelled in under two seconds.",
    detail: "4 triggered · 1 accepted",
    lines: [
      { k: "triggered", v: "4" },
      { k: "accepted_in", v: '"8.41s"' },
      { k: "cancel_fanout", v: '"522ms"' },
    ],
  },
  {
    n: "04",
    icon: CheckCircle2,
    title: "You get every event back",
    body: "Signed webhooks on every state change, live rider GPS, proof of delivery, and a tracking link that carries your brand instead of ours.",
    detail: "order.delivered → 200 OK",
    lines: [
      { k: "event", v: '"order.delivered"' },
      { k: "proof", v: '"OTP + photo"' },
      { k: "temperature", v: '"in range"' },
    ],
  },
];

/**
 * Sticky storytelling.
 *
 * The left column pins and re-renders as each step block scrolls past on the
 * right, with a scrub-filled rail tying them together. This is deliberately
 * *not* the same reveal used elsewhere on the page — the section is explaining
 * a sequence, so the motion is sequential.
 */
export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const blocks = gsap.utils.toArray<HTMLElement>("[data-step-block]", el);
      const rail = railRef.current;

      if (prefersReducedMotion()) {
        if (rail) gsap.set(rail, { scaleY: 1 });
        gsap.set(gsap.utils.toArray("[data-step-block] > *", el), {
          opacity: 1,
          y: 0,
        });
        return;
      }

      // rail fills across the whole sequence
      if (rail) {
        gsap.fromTo(
          rail,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: {
              trigger: el,
              start: "top 55%",
              end: "bottom 70%",
              scrub: 0.4,
            },
          }
        );
      }

      blocks.forEach((block, i) => {
        // which step is "current"
        ScrollTrigger.create({
          trigger: block,
          start: "top 62%",
          end: "bottom 62%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });

        // each block arrives with its own offset, so the column feels stacked
        gsap.from(block, {
          opacity: 0,
          y: 60,
          rotateX: -6,
          transformPerspective: 1000,
          duration: DUR.section,
          ease: EASE.out4,
          scrollTrigger: { trigger: block, start: "top 82%", once: true },
        });
      });
    },
    { scope: root }
  );

  const current = STEPS[active];

  return (
    <Section id="how" className="border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>How it works</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines"
            text="Four steps between your order and your customer's door"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Everything below happens without a human touching it. Median time from
            request to an assigned rider is under ten seconds.
          </p>
        </div>

        <div ref={root} className="mt-20 grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* ---------- sticky narrator ---------- */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div className="flex items-start gap-5">
                {/* progress rail */}
                <div className="relative hidden w-px shrink-0 self-stretch bg-line lg:block">
                  <div
                    ref={railRef}
                    className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-ember-400 via-teal-400 to-crimson-400"
                    style={{ transform: "scaleY(0)" }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    {STEPS.map((s, i) => (
                      <span
                        key={s.n}
                        className={cn(
                          "h-1 rounded-full transition-all duration-500",
                          i === active
                            ? "w-8 bg-primary"
                            : i < active
                              ? "w-4 bg-primary/40"
                              : "w-4 bg-line-strong"
                        )}
                      />
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary-border bg-primary-soft text-primary shadow-e1">
                      <current.icon aria-hidden className="size-6" />
                    </span>
                    <span className="font-mono text-4xl font-semibold tnum text-fg-subtle">
                      {current.n}
                    </span>
                  </div>

                  <h3
                    key={`t-${active}`}
                    className="mt-7 text-2xl font-semibold leading-tight tracking-[-0.025em] md:text-3xl"
                    style={{ animation: "dm-step-in 520ms var(--ease-out-expo)" }}
                  >
                    {current.title}
                  </h3>

                  <p
                    key={`b-${active}`}
                    className="mt-4 max-w-md leading-relaxed text-fg-muted"
                    style={{ animation: "dm-step-in 620ms var(--ease-out-expo)" }}
                  >
                    {current.body}
                  </p>

                  <div
                    key={`d-${active}`}
                    className="mt-7 inline-flex items-center gap-2.5 rounded-xl border border-line bg-surface-2/60 px-4 py-3"
                    style={{ animation: "dm-step-in 700ms var(--ease-out-expo)" }}
                  >
                    <span className="size-1.5 shrink-0 animate-breathe rounded-full bg-accent" />
                    <code className="font-mono text-xs text-fg-muted">
                      {current.detail}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- scrolling blocks ---------- */}
          <ol className="flex flex-col gap-6 lg:col-span-7">
            {STEPS.map((step, i) => (
              <li
                key={step.n}
                data-step-block
                className={cn(
                  "rounded-2xl border bg-surface p-7 transition-colors duration-500 md:p-8 lg:min-h-[62vh] lg:flex lg:flex-col lg:justify-center",
                  i === active
                    ? "border-primary-border shadow-e2"
                    : "border-line"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl border transition-colors duration-500",
                      i === active
                        ? "border-primary-border bg-primary-soft text-primary"
                        : "border-line bg-surface-2 text-fg-subtle"
                    )}
                  >
                    <step.icon aria-hidden className="size-[18px]" />
                  </span>
                  <span className="font-mono text-xs text-fg-subtle">{step.n} / 04</span>
                </div>

                <h4 className="mt-6 text-lg font-medium tracking-[-0.015em]">
                  {step.title}
                </h4>

                <div className="mt-5 overflow-hidden rounded-xl border border-line bg-[var(--color-ink-950)] p-4 font-mono text-[12px] leading-relaxed">
                  {step.lines.map((l, li) => (
                    <div
                      key={l.k}
                      className="flex gap-2"
                      style={{
                        opacity: i === active ? 1 : 0.42,
                        transition: `opacity 500ms ${li * 70}ms`,
                      }}
                    >
                      <span className="text-[#5ff3d5]">{l.k}</span>
                      <span className="text-[#4d5871]">:</span>
                      <span className="text-[#ffc247]">{l.v}</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
