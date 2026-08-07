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
 * Wallet engine and the cold-chain moat, on one held stage.
 *
 * The two share a format, so they now share a screen. The background is the
 * moat's green and it does not move for the whole band; the page appears to
 * stop while the content on top of it changes hands — copy leaving through
 * the left edge, image leaving through the right, and the moat resolving in
 * the gap they open. The four-card strip underneath never moves at all, only
 * its readings swap.
 *
 * Held with CSS `sticky` inside a tall runway, not a GSAP pin. A pin injects
 * a spacer and rewrites the section's box, which is what threw the dimensions
 * out when this was first attempted. Sticky is measured by the browser and
 * cannot surprise the layout.
 *
 * Below 1024px the whole mechanism is dropped: the runway collapses to auto
 * height, the states stack normally and nothing is absolutely positioned.
 * There is not enough viewport to hold two states at once on a phone.
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
  const runway = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<0 | 1>(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      const track = runway.current;
      if (!el || !track) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion() || window.innerWidth < 1024) {
        // Also clears the `lg:opacity-0` pre-hydration guard on state B, which
        // otherwise leaves it invisible on a desktop with reduced motion on.
        gsap.set(q("[data-moat]"), { clearProps: "all", autoAlpha: 1 });
        gsap.set(q("[data-moat='b-copy']")[0]?.parentElement ?? [], {
          opacity: 1,
        });
        return;
      }

      // the moat starts off-stage, sitting exactly where the wallet is
      gsap.set(q("[data-moat='b-copy'], [data-moat='b-art']"), {
        autoAlpha: 0,
        scale: 0.93,
      });
      // Hand the pre-hydration guard over to the two children that the
      // timeline actually drives, so the wrapper stops holding them down.
      gsap.set(q("[data-moat='b-copy']")[0]?.parentElement ?? [], {
        opacity: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => setPhase(self.progress > 0.5 ? 1 : 0),
        },
      });

      tl
        // 0 → 0.42 · the wallet simply holds
        .to({}, { duration: 0.42 })

        // 0.42 → 0.62 · copy leaves left, image leaves right
        .to(
          q("[data-moat='a-copy']"),
          { xPercent: -74, autoAlpha: 0, filter: "blur(9px)", ease: "power2.in", duration: 0.2 },
          0.42
        )
        .to(
          q("[data-moat='a-art']"),
          { xPercent: 82, autoAlpha: 0, rotate: 6, ease: "power2.in", duration: 0.2 },
          0.42
        )

        // 0.56 → 0.78 · the moat resolves into the gap they left
        .to(
          q("[data-moat='b-copy']"),
          { autoAlpha: 1, scale: 1, duration: 0.22, ease: EASE.out3 },
          0.56
        )
        .to(
          q("[data-moat='b-art']"),
          { autoAlpha: 1, scale: 1, duration: 0.22, ease: EASE.out3 },
          0.6
        )

        // 0.78 → 1 · the moat holds
        .to({}, { duration: 0.22 });

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
      data-scene="teal"
      style={sceneVars("teal")}
      className="relative isolate scroll-mt-24 bg-bg text-fg"
    >
      {/* runway — only tall on desktop, where the hold happens */}
      <div ref={runway} className="relative lg:h-[250vh]">
        {/* stage — held by sticky */}
        <div className="lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:overflow-hidden">
          {/* the green world, fixed for the whole band */}
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

          <div className="container-page relative py-24 lg:flex-1 lg:py-0">
            {/*
              Both states occupy the same box. On desktop the second is
              absolutely positioned over the first so neither can push the
              other around; below lg it simply follows in normal flow.
            */}
            <div className="relative lg:min-h-[64vh]">
              {/* ---------- state A · wallet ---------- */}
              <div className="grid items-center gap-12 lg:absolute lg:inset-0 lg:grid-cols-12 lg:gap-16">
                <div data-moat="a-copy" className="lg:col-span-6">
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

                <div data-moat="a-art" className="lg:col-span-6">
                  <MediaPlate
                    entry={media.wallet}
                    glow="primary"
                    motion="jump"
                    spin
                  />
                </div>
              </div>

              {/* ---------- state B · the moat ---------- */}
              {/*
                `lg:opacity-0` covers the gap between first paint and
                hydration. On desktop this state is absolutely positioned on
                top of the wallet, so until GSAP hides it the reader sees both
                sets of copy printed over each other. GSAP writes opacity
                inline a moment later and wins it back.

                Scoped to `lg` on purpose: below that the two states stack in
                normal flow and both are meant to be read, so hiding this one
                there would lose real content if the script never ran.
              */}
              <div className="mt-24 grid items-center gap-12 lg:absolute lg:inset-0 lg:mt-0 lg:grid-cols-12 lg:gap-16 lg:opacity-0">
                <div data-moat="b-copy" className="lg:col-span-6">
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

                <div data-moat="b-art" className="lg:col-span-6">
                  <MediaPlate
                    entry={media.coldChain}
                    glow="accent"
                    motion="swing"
                  />
                </div>
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

            {/* how far through the band you are */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 -top-px h-px bg-primary transition-all duration-700",
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
