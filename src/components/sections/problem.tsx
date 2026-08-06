"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Eyebrow, Section } from "@/components/ui/primitives";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

const BEFORE = [
  "Five courier contracts, five dashboards",
  "Rates negotiated by phone, reconciled by hand",
  "No visibility until the customer complains",
  "One provider goes down, the day goes down",
  "Finance chasing invoices across five formats",
];

const AFTER = [
  "One API, one contract, one invoice",
  "Rates computed and locked before dispatch",
  "Every state change pushed to your systems",
  "Provider fails, the next one is already moving",
  "Reconciliation runs itself, disputes auto-filed",
];

/**
 * Before / after.
 *
 * Animation language: *collapse*. The two panels slide in from opposite edges
 * and the "before" list decays to half opacity as the "after" list resolves —
 * the section argues that fragmentation converges into one thing, so the
 * motion converges too.
 */
export function Problem() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-p]"), { opacity: 1, x: 0, y: 0, clipPath: "none" });
        return;
      }

      gsap.set(q("[data-p='before']"), { opacity: 0, x: -46 });
      gsap.set(q("[data-p='after']"), { opacity: 0, x: 46 });
      gsap.set(q("[data-p='before-item']"), { opacity: 0, x: -14 });
      gsap.set(q("[data-p='after-item']"), {
        opacity: 0,
        clipPath: "inset(0% 100% 0% 0%)",
      });
      gsap.set(q("[data-p='arrow']"), { opacity: 0, x: -8 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 72%", once: true } })
        .to(q("[data-p='before']"), {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: EASE.out4,
        })
        .to(
          q("[data-p='after']"),
          { opacity: 1, x: 0, duration: 0.9, ease: EASE.out4 },
          "-=0.78"
        )
        .to(
          q("[data-p='before-item']"),
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.07, ease: EASE.out3 },
          "-=0.5"
        )
        .to(
          q("[data-p='after-item']"),
          {
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.62,
            stagger: 0.08,
            ease: EASE.out3,
          },
          "-=0.55"
        )
        .to(
          q("[data-p='arrow']"),
          { opacity: 1, x: 0, duration: 0.34, stagger: 0.06, ease: EASE.out3 },
          "-=0.45"
        )
        // the "before" column recedes once the answer has landed
        .to(
          q("[data-p='before']"),
          { opacity: 0.55, duration: 0.7, ease: EASE.inOut },
          "+=0.2"
        );
    },
    { scope: root }
  );

  return (
    <Section id="why" className="border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>The problem</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines-alt"
            text="Logistics is fragmented by default. Every provider you add makes it worse."
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Adding a courier should add capacity. Instead it adds a dashboard, a rate
            card, a reconciliation format and a support contact. DittoMart Go
            collapses all of it into a single integration.
          </p>
        </div>

        <div ref={root} className="mt-16 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div
            data-p="before"
            className="relative rounded-2xl border border-line bg-surface-2/40 p-7 md:p-9"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
              Without a delivery OS
            </span>
            <ul className="mt-7 flex flex-col gap-4">
              {BEFORE.map((item) => (
                <li
                  key={item}
                  data-p="before-item"
                  className="flex items-start gap-3"
                >
                  <span
                    aria-hidden
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-fg-subtle"
                  />
                  <span className="text-sm leading-relaxed text-fg-muted md:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-p="after"
            className="relative overflow-hidden rounded-2xl border border-primary-border bg-[linear-gradient(160deg,var(--primary-soft),transparent_60%)] p-7 md:p-9"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-60 blur-[70px]"
              style={{
                background:
                  "radial-gradient(closest-side, var(--spot-2), transparent 70%)",
              }}
            />
            <span className="relative inline-flex items-center gap-2 rounded-full border border-primary-border bg-primary-soft px-3 py-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-primary">
              With DittoMart Go
            </span>
            <ul className="relative mt-7 flex flex-col gap-4">
              {AFTER.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span data-p="arrow" aria-hidden className="mt-0.5 shrink-0 text-primary">
                    <ArrowRight className="size-4" strokeWidth={2.5} />
                  </span>
                  <span
                    data-p="after-item"
                    className="text-sm leading-relaxed text-fg md:text-base"
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
