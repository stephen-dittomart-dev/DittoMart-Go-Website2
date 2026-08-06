"use client";

import { useGSAP } from "@gsap/react";
import { Calculator, Radio, Route, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Spotlight } from "@/components/motion/interactions";
import { SplitHeading } from "@/components/motion/split-heading";
import { Badge, Card, Eyebrow, Section } from "@/components/ui/primitives";
import { AllocationTimeline } from "@/components/visuals/allocation-timeline";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ENGINES = [
  {
    id: "tariff",
    icon: Calculator,
    label: "Tariff",
    headline: "Pricing that is configured, never deployed",
    body: "Rules are matched by specificity — client, zone, provider, vehicle, product type — and the most specific one wins. Change a rate for one zone at 9am without touching a line of code.",
    points: [
      "Six-level priority matching, most specific rule wins",
      "Base fare, distance bands, weight, surge, waiting, cold-chain surcharge",
      "Dry-run any rule against real historical orders before it goes live",
      "The quoted rate is locked on the order — your customer is never surprised",
    ],
    stat: { value: "<300ms", label: "Quote latency" },
  },
  {
    id: "wallet",
    icon: Wallet,
    label: "Wallet",
    headline: "No delivery leaves without funding",
    body: "Every order is checked against your balance before a provider is contacted. Underfunded orders are held, not lost — top up and they release themselves.",
    points: [
      "Pre-authorisation on every order, before any supply call",
      "Held orders resume automatically on top-up — nothing is recreated",
      "Auto-recharge, low-balance alerts, full transaction ledger",
      "Monthly GST invoice generated and reconciled against the ledger",
    ],
    stat: { value: "₹0", label: "Receivables risk" },
  },
  {
    id: "routing",
    icon: Route,
    label: "Routing",
    headline: "The cheapest route that still hits your SLA",
    body: "Providers are ranked continuously on live scorecards — accept rate, on-time percentage, RTO rate, SLA breaches, vehicle and temperature capability.",
    points: [
      "Own fleet preferred where we control the SLA, 3PL everywhere else",
      "Scorecards update from real outcomes, not from contracts",
      "Temperature and vehicle capability are hard filters, not preferences",
      "Operations can pin a zone to a provider — with a reason, into the audit log",
    ],
    stat: { value: "99.9%", label: "Allocation uptime" },
  },
  {
    id: "allocation",
    icon: Radio,
    label: "Allocation",
    headline: "Broadcast dispatch, without the double-booking",
    body: "Every eligible provider is triggered at once. The first to accept takes an atomic lock; everyone else is cancelled within two seconds. Two riders on one order is structurally impossible, not merely unlikely.",
    points: [
      "Atomic first-accept lock — exactly one acceptance can ever commit",
      "Bounded cancel fan-out with retries and a dead-letter queue",
      "Providers that penalise cancellations are excluded from broadcast",
      "Nightly reconciliation auto-disputes any charge for a cancelled assignment",
    ],
    stat: { value: "0", label: "Double assignments" },
    visual: "allocation",
  },
];

/**
 * The four engines.
 *
 * Animation language: *switching*. A physical indicator slides between tabs
 * and the panel content enters directionally — left-to-right if you moved
 * forward, right-to-left if you moved back — so the control feels mechanical
 * rather than like a crossfade.
 */
export function Engines() {
  const [active, setActive] = useState(0);
  const prev = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Slide the indicator under the active tab.
  useEffect(() => {
    const list = listRef.current;
    const ind = indicatorRef.current;
    if (!list || !ind) return;

    const move = () => {
      const btn = list.querySelectorAll<HTMLButtonElement>("[data-engine-tab]")[
        active
      ];
      if (!btn) return;
      const target = {
        x: btn.offsetLeft,
        width: btn.offsetWidth,
      };
      if (prefersReducedMotion()) {
        gsap.set(ind, target);
      } else {
        gsap.to(ind, { ...target, duration: 0.45, ease: EASE.out4 });
      }
    };

    move();
    window.addEventListener("resize", move);
    return () => window.removeEventListener("resize", move);
  }, [active]);

  // Directional entrance for the panel.
  useGSAP(
    () => {
      registerGsap();
      const panel = panelRef.current;
      if (!panel || prefersReducedMotion()) return;

      const dir = active >= prev.current ? 1 : -1;
      prev.current = active;

      const copy = panel.querySelectorAll("[data-engine-copy] > *");
      const visual = panel.querySelector("[data-engine-visual]");

      gsap.fromTo(
        copy,
        { opacity: 0, x: 22 * dir },
        {
          opacity: 1,
          x: 0,
          duration: DUR.reveal,
          ease: EASE.out4,
          stagger: 0.05,
        }
      );
      gsap.fromTo(
        visual,
        { opacity: 0, x: 30 * dir, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.85, ease: EASE.out4 }
      );
    },
    { dependencies: [active] }
  );

  const engine = ENGINES[active];

  return (
    <Section id="engines" className="relative border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>The platform</Eyebrow>
          <SplitHeading
            as="h2"
            mode="words"
            text="Four engines do all the work"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Everything else is plumbing. These four decide what a delivery costs,
            whether it is funded, who carries it, and how fast it gets picked up.
          </p>
        </div>

        {/* ---------- tab rail ---------- */}
        <div className="mt-12 overflow-x-auto pb-2">
          <div
            ref={listRef}
            role="tablist"
            aria-label="Platform engines"
            className="relative inline-flex items-center gap-1 rounded-2xl border border-line bg-surface-2/70 p-1.5"
          >
            <span
              ref={indicatorRef}
              aria-hidden
              className="absolute bottom-1.5 top-1.5 rounded-xl border border-primary-border bg-elevated shadow-e1"
              style={{ left: 0, width: 0 }}
            />
            {ENGINES.map((e, i) => (
              <button
                key={e.id}
                data-engine-tab
                role="tab"
                type="button"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "relative z-10 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-300",
                  i === active ? "text-fg" : "text-fg-muted hover:text-fg"
                )}
              >
                <e.icon
                  aria-hidden
                  className={cn(
                    "size-4 transition-colors duration-300",
                    i === active && "text-primary"
                  )}
                />
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- panel ---------- */}
        <div ref={panelRef} className="mt-8">
          <div
            role="tabpanel"
            className="grid gap-10 lg:grid-cols-12 lg:gap-14"
          >
            <div data-engine-copy className="lg:col-span-5">
              <Badge variant="brand" size="sm">
                {engine.label} engine
              </Badge>
              <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.025em] md:text-3xl">
                {engine.headline}
              </h3>
              <p className="mt-4 leading-relaxed text-fg-muted">{engine.body}</p>

              <ul className="mt-7 flex flex-col gap-3.5">
                {engine.points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-[9px] size-1 shrink-0 rounded-full bg-primary"
                    />
                    <span className="text-sm leading-relaxed text-fg-muted">{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 inline-flex items-baseline gap-3 rounded-xl border border-line bg-surface-2/60 px-5 py-3.5">
                <span className="text-2xl font-semibold tracking-[-0.03em] tnum">
                  {engine.stat.value}
                </span>
                <span className="text-xs text-fg-subtle">{engine.stat.label}</span>
              </div>
            </div>

            <div data-engine-visual className="lg:col-span-7">
              {engine.visual === "allocation" ? (
                <AllocationTimeline scrub={false} />
              ) : (
                <EngineDiagram id={engine.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------------ */

const DIAGRAMS: Record<
  string,
  {
    title: string;
    rows: { label: string; value: string; muted?: boolean; win?: boolean }[];
    footer: string;
  }
> = {
  tariff: {
    title: "Rule match · 5 km chilled · Adyar",
    rows: [
      { label: "P1  client + zone + provider + vehicle + type", value: "no match", muted: true },
      { label: "P2  client + zone + vehicle", value: "no match", muted: true },
      { label: "P3  client + zone", value: "matched", win: true },
      { label: "P4  zone + product type", value: "skipped", muted: true },
      { label: "P5  client default", value: "skipped", muted: true },
      { label: "P6  global default", value: "skipped", muted: true },
    ],
    footer: "Base ₹25 · Distance ₹16 · Cold chain ₹15 · Surge ×1.0  →  ₹56.00 locked",
  },
  wallet: {
    title: "Pre-authorisation · ord_8f31c2a7",
    rows: [
      { label: "Quoted rate", value: "₹56.00" },
      { label: "Available balance", value: "₹42,150.00" },
      { label: "Check", value: "sufficient", win: true },
      { label: "Supply call", value: "released" },
      { label: "Ledger entry", value: "DEBIT ₹56.00" },
      { label: "Balance after", value: "₹42,094.00" },
    ],
    footer: "Underfunded orders are held at PENDING_PAYMENT and released on top-up.",
  },
  routing: {
    title: "Provider ranking · 600020 → 600041",
    rows: [
      { label: "Direct fleet · Adyar", value: "score 94", win: true },
      { label: "Rapido", value: "score 88" },
      { label: "Dunzo", value: "score 81" },
      { label: "Wefast", value: "score 74" },
      { label: "ONDC · LOG10", value: "score 69" },
      { label: "Provider X", value: "no cold-chain capability", muted: true },
    ],
    footer: "Cost 35% · ETA 30% · Scorecard 25% · Capability 10% — weights are configurable.",
  },
};

function EngineDiagram({ id }: { id: string }) {
  const root = useRef<HTMLDivElement>(null);
  const d = DIAGRAMS[id];

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const rows = el.querySelectorAll("[data-diag-row]");
      gsap.fromTo(
        rows,
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          ease: EASE.out3,
          stagger: 0.055,
          delay: 0.12,
        }
      );
      const win = el.querySelector("[data-diag-win]");
      if (win) {
        gsap.fromTo(
          win,
          { backgroundColor: "transparent" },
          {
            backgroundColor: "var(--primary-soft)",
            duration: 0.5,
            ease: EASE.out,
            delay: 0.55,
          }
        );
      }
    },
    { scope: root, dependencies: [id] }
  );

  if (!d) return null;

  return (
    <Spotlight className="h-full">
      <Card ref={root} className="h-full overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <p className="font-mono text-xs text-fg-subtle">{d.title}</p>
        </div>
        <div className="divide-y divide-line">
          {d.rows.map((row) => (
            <div
              key={row.label}
              data-diag-row
              {...(row.win ? { "data-diag-win": true } : {})}
              className="flex items-center justify-between gap-4 px-5 py-3.5"
            >
              <span
                className={cn(
                  "font-mono text-xs md:text-[13px]",
                  row.muted ? "text-fg-subtle" : "text-fg-muted",
                  row.win && "text-fg"
                )}
              >
                {row.label}
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono text-xs tnum",
                  row.muted ? "text-fg-subtle" : "text-fg-muted",
                  row.win && "font-semibold text-primary"
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-line bg-surface-2/40 px-5 py-4">
          <p className="text-xs leading-relaxed text-fg-subtle">{d.footer}</p>
        </div>
      </Card>
    </Spotlight>
  );
}
