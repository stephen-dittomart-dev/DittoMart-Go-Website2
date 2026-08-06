"use client";

import { useGSAP } from "@gsap/react";
import { Check, Snowflake, Wallet } from "lucide-react";
import { useRef, useState } from "react";
import { MediaPlate } from "@/components/motion/scene";
import { SplitHeading } from "@/components/motion/split-heading";
import { Badge, Eyebrow } from "@/components/ui/primitives";
import { media } from "@/lib/media";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { sceneVars } from "@/lib/scenes";
import { cn } from "@/lib/utils";

/**
 * Wallet engine and the cold-chain moat, as one continuous green band.
 *
 * The two used to be separate sections in the same layout, one after the
 * other, which made the second read as a repeat of the first. They share a
 * format, so they now share a *stage*: the background is fixed for the whole
 * band, and the section pins while the content changes on it.
 *
 * The handover is directional rather than a crossfade. Wallet's copy leaves
 * through the left edge and its plate leaves through the right, opening a gap
 * in the middle — and the moat's copy and plate resolve out of that gap. The
 * four-card strip underneath never moves at all; only the numbers on it swap,
 * which is what makes the band feel like one instrument changing readings
 * instead of two slides.
 */

const WALLET = {
  eyebrow: "Wallet engine",
  title: "No order leaves without money behind it",
  body: "Any order without wallet balance never reaches a delivery partner. The gate runs before a single provider is contacted — insufficient balance returns HTTP 402 and the order waits at PENDING_PAYMENT instead of being lost.",
  points: [
    "Client recharge, payment verification, balance update",
    "Auto-block below your minimum threshold",
    "Per-order deduction at your contracted rate",
    "Monthly tax invoice auto-generated with 18% GST",
  ],
  stats: [
    { value: "HTTP 402", label: "Insufficient balance" },
    { value: "₹0", label: "Receivables risk" },
    { value: "18%", label: "GST auto-applied" },
    { value: "Weekly", label: "NEFT settlement" },
  ],
};

const MOAT = {
  eyebrow: "The moat",
  title: "Meat, dairy and vaccines need proof, not promises",
  body: "FROZEN, CHILLED, AMBIENT and HOT with min and max temperatures on the order itself, auto-matched to a vehicle certified to carry it. A BLE sensor inside the insulated box reports every 30 seconds.",
  points: [
    "FSSAI licence tracking for riders and vehicles, with expiry alerts",
    "Pickup condition photo before the rider leaves the vendor",
    "Perishable RTO protocol — returned meat and dairy are auto-discarded",
    "Proof of Freshness: pickup photo, temperature graph, delivery photo",
  ],
  stats: [
    { value: "4", label: "Temperature classes" },
    { value: "30s", label: "Sensor interval" },
    { value: "−4°C", label: "Live box reading" },
    { value: "0", label: "Unverifiable handovers" },
  ],
};

export function MoatBand() {
  const root = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<0 | 1>(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const stage = el.querySelector<HTMLElement>("[data-moat-stage]");
      if (!stage) return;

      const reduced = prefersReducedMotion();
      const small = window.innerWidth < 1024;

      if (reduced || small) {
        gsap.set(q("[data-moat]"), { clearProps: "all", autoAlpha: 1 });
        return;
      }

      gsap.set(q("[data-moat='b-copy'], [data-moat='b-art']"), {
        autoAlpha: 0,
        scale: 0.86,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=190%",
          pin: stage,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => setPhase(self.progress > 0.5 ? 1 : 0),
        },
      });

      // wallet holds, then parts down the middle
      tl.to({}, { duration: 0.55 })
        .to(
          q("[data-moat='a-copy']"),
          { xPercent: -68, autoAlpha: 0, filter: "blur(10px)", ease: "power2.in" },
          0.55
        )
        .to(
          q("[data-moat='a-art']"),
          { xPercent: 78, autoAlpha: 0, rotate: 8, ease: "power2.in" },
          0.55
        )
        // the moat resolves out of the gap they left
        .to(
          q("[data-moat='b-copy']"),
          { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE.out4 },
          0.9
        )
        .to(
          q("[data-moat='b-art']"),
          { autoAlpha: 1, scale: 1, duration: 0.5, ease: EASE.out4 },
          0.95
        )
        .to({}, { duration: 0.5 });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: root }
  );

  const stats = phase === 0 ? WALLET.stats : MOAT.stats;

  return (
    <section
      ref={root}
      id="wallet"
      style={sceneVars("teal")}
      className="relative isolate scroll-mt-24 bg-bg text-fg"
    >
      <div
        data-moat-stage
        className="relative flex min-h-dvh flex-col justify-center overflow-hidden"
      >
        {/* the fixed green world — held for the whole band */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-bg" />
          <div className="bg-grid absolute inset-0 opacity-50" />
          <div
            className="absolute -top-1/4 left-1/2 h-[80vh] w-[90vw] -translate-x-1/2 rounded-full blur-[130px]"
            style={{
              background:
                "radial-gradient(closest-side, var(--spot-1), transparent 72%)",
            }}
          />
        </div>

        <div className="container-page relative flex-1 py-24">
          <div className="relative grid min-h-[62vh] items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ---------- state A · wallet ---------- */}
            <div
              data-moat="a-copy"
              className="lg:col-span-6 lg:col-start-1 lg:row-start-1"
            >
              <Eyebrow icon={<Wallet className="size-3" />}>
                {WALLET.eyebrow}
              </Eyebrow>
              <SplitHeading
                as="h2"
                mode="bounce"
                text={WALLET.title}
                className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
              />
              <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg">
                {WALLET.body}
              </p>
              <Points items={WALLET.points} />
            </div>

            <div
              data-moat="a-art"
              className="lg:col-span-6 lg:col-start-7 lg:row-start-1"
            >
              <MediaPlate
                src={media.wallet.src}
                alt={media.wallet.alt}
                caption={media.wallet.caption}
                glow="primary"
                motion="jump"
                spin
              />
            </div>

            {/* ---------- state B · the moat ---------- */}
            <div
              data-moat="b-copy"
              className="lg:col-span-6 lg:col-start-1 lg:row-start-1"
            >
              <Badge variant="accent" size="sm">
                <Snowflake aria-hidden className="size-3" />
                {MOAT.eyebrow}
              </Badge>
              <h2 className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl">
                {MOAT.title}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg">
                {MOAT.body}
              </p>
              <Points items={MOAT.points} />
            </div>

            <div
              data-moat="b-art"
              className="lg:col-span-6 lg:col-start-7 lg:row-start-1"
            >
              <MediaPlate
                src={media.coldChain.src}
                alt={media.coldChain.alt}
                caption={media.coldChain.caption}
                glow="accent"
                motion="swing"
              />
            </div>
          </div>
        </div>

        {/* ---------- the strip that never moves ---------- */}
        <div className="relative grid grid-cols-2 gap-px border-t border-line bg-line lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-bg px-6 py-7 text-center">
              <div
                key={`${phase}-${s.value}`}
                className="text-2xl font-semibold tracking-[-0.03em] tnum md:text-3xl"
                style={{ animation: "dm-step-in 420ms var(--ease-out-expo)" }}
              >
                {s.value}
              </div>
              <div
                key={`${phase}-${s.label}`}
                className="mt-2 font-mono text-2xs uppercase tracking-[0.14em] text-fg-subtle"
                style={{ animation: "dm-step-in 520ms var(--ease-out-expo)" }}
              >
                {s.label}
              </div>
            </div>
          ))}

          {/* which half of the band you are in */}
          <div className="pointer-events-none absolute inset-x-0 -top-px flex">
            <span
              className={cn(
                "h-px bg-primary transition-all duration-700",
                phase === 0 ? "w-1/2" : "w-full"
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 flex flex-col gap-3">
      {items.map((p) => (
        <li key={p} className="flex items-start gap-3">
          <Check
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-primary"
            strokeWidth={3}
          />
          <span className="text-sm leading-relaxed text-fg-muted md:text-base">
            {p}
          </span>
        </li>
      ))}
    </ul>
  );
}
