"use client";

import { useGSAP } from "@gsap/react";
import {
  Bike,
  Building2,
  Cpu,
  Globe2,
  Layers,
  Truck,
  User,
} from "lucide-react";
import { useRef, useState } from "react";
import { useIsTablet } from "@/hooks/use-motion";
import {
  EASE,
  gsap,
  prefersReducedMotion,
  registerGsap,
  ScrollTrigger,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

type Layer = {
  id: string;
  icon: typeof Layers;
  title: string;
  role: string;
  detail: string;
  metrics: { k: string; v: string }[];
  tone: "neutral" | "brand" | "supply" | "end";
};

const LAYERS: Layer[] = [
  {
    id: "business",
    icon: Building2,
    title: "Your business",
    role: "Demand",
    detail:
      "Your commerce stack, POS, WMS or marketplace emits an order that needs to move. One authenticated call, idempotent on your own reference.",
    metrics: [
      { k: "integration", v: "1 endpoint" },
      { k: "auth", v: "scoped key" },
    ],
    tone: "neutral",
  },
  {
    id: "core",
    icon: Cpu,
    title: "DittoMart Go",
    role: "Intelligence layer",
    detail:
      "Tariff, wallet, routing and allocation resolve in sequence. The order is priced, funded, ranked and dispatched — typically inside one second.",
    metrics: [
      { k: "engines", v: "4" },
      { k: "decision", v: "<1s" },
    ],
    tone: "brand",
  },
  {
    id: "3pl",
    icon: Truck,
    title: "3PL network",
    role: "Supply rail 1",
    detail:
      "Contracted third-party fleets reached through a common adapter interface. Instant national reach, zero fleet capital.",
    metrics: [
      { k: "capex", v: "₹0" },
      { k: "onboarding", v: "1 adapter" },
    ],
    tone: "supply",
  },
  {
    id: "fleet",
    icon: Bike,
    title: "Direct fleet",
    role: "Supply rail 2",
    detail:
      "Partner agencies operating under our SLA, with our rider app, our proof requirements and our penalties. Better margin, better control.",
    metrics: [
      { k: "sla", v: "ours" },
      { k: "proof", v: "enforced" },
    ],
    tone: "supply",
  },
  {
    id: "ondc",
    icon: Globe2,
    title: "ONDC network",
    role: "Supply rail 3",
    detail:
      "Open network logistics in both directions — buy capacity when we are short, sell capacity when riders are idle.",
    metrics: [
      { k: "roles", v: "buyer + seller" },
      { k: "domain", v: "LOG10" },
    ],
    tone: "supply",
  },
  {
    id: "customer",
    icon: User,
    title: "Your customer",
    role: "Fulfilment",
    detail:
      "A tracking link carrying your brand, live rider position, verified handover and — where it matters — a temperature certificate.",
    metrics: [
      { k: "branding", v: "yours" },
      { k: "proof", v: "photo + OTP" },
    ],
    tone: "end",
  },
];

const toneRing = {
  neutral: "border-line",
  brand: "border-primary-border",
  supply: "border-[color-mix(in_oklab,var(--accent)_30%,transparent)]",
  end: "border-[color-mix(in_oklab,var(--success)_30%,transparent)]",
} as const;

const toneIcon = {
  neutral: "text-fg-muted bg-surface-2",
  brand: "text-primary bg-primary-soft",
  supply: "text-accent bg-accent-soft",
  end: "text-success bg-success-soft",
} as const;

/**
 * The Platform page's signature moment.
 *
 * The section pins and the six architecture layers advance under scroll —
 * the reader is walked down the stack one layer at a time rather than
 * scrolling past a diagram. A connector line draws downward in step, and the
 * detail panel morphs.
 *
 * Below 1024px pinning is abandoned entirely: there is not enough viewport to
 * hold both columns, and a broken pin is far worse than no pin.
 */
export function PlatformStack({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isTablet = useIsTablet();

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      const pin = pinRef.current;
      if (!el || !pin) return;

      const reduced = prefersReducedMotion();
      const small = window.innerWidth < 1024;

      if (reduced || small) {
        // Plain in-view highlighting; no pin, no scrub.
        const rows = gsap.utils.toArray<HTMLElement>("[data-layer-row]", el);
        rows.forEach((row, i) => {
          ScrollTrigger.create({
            trigger: row,
            start: "top 70%",
            end: "bottom 60%",
            onToggle: (self) => self.isActive && setActive(i),
          });
        });
        if (reduced) setActive(LAYERS.length - 1);
        return;
      }

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 96px",
        end: `+=${LAYERS.length * 46}%`,
        pin,
        pinSpacing: true,
        scrub: 0.35,
        anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.min(
            LAYERS.length - 1,
            Math.floor(self.progress * LAYERS.length)
          );
          setActive(idx);
          if (connectorRef.current) {
            gsap.set(connectorRef.current, { scaleY: self.progress });
          }
        },
      });

      return () => st.kill();
    },
    { scope: root, dependencies: [isTablet] }
  );

  // Morph the detail panel whenever the active layer changes.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const panel = root.current?.querySelector("[data-layer-panel-inner]");
      if (!panel) return;
      gsap.fromTo(
        panel,
        { opacity: 0, y: 18, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          ease: EASE.out3,
          overwrite: true,
        }
      );
    },
    { dependencies: [active] }
  );

  const layer = LAYERS[active];

  return (
    <div ref={root} className={className}>
      <div ref={pinRef} className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        {/* the stack */}
        <ol className="relative flex flex-col gap-3 lg:col-span-7">
          {/* connector rail */}
          <div
            aria-hidden
            className="absolute left-[27px] top-6 hidden h-[calc(100%-3rem)] w-px bg-line sm:block"
          >
            <div
              ref={connectorRef}
              className="h-full w-full origin-top bg-gradient-to-b from-ember-400 via-teal-400 to-crimson-400"
              style={{ transform: "scaleY(0)" }}
            />
          </div>

          {LAYERS.map((l, i) => {
            const isActive = active === i;
            const isPast = i < active;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  data-layer-row
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={cn(
                    "group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left sm:p-5",
                    "transition-all duration-500 [transition-timing-function:var(--ease-standard)]",
                    isActive
                      ? cn("scale-[1.015] bg-surface shadow-e2", toneRing[l.tone])
                      : isPast
                        ? "border-line bg-surface-2/60 opacity-80"
                        : "border-line bg-surface-2/30 opacity-55"
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-500",
                      isActive
                        ? cn(toneRing[l.tone], toneIcon[l.tone])
                        : "border-line bg-surface-2 text-fg-subtle"
                    )}
                  >
                    <l.icon aria-hidden className="size-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-base font-medium">{l.title}</span>
                      <span className="font-mono text-2xs uppercase tracking-[0.12em] text-fg-subtle">
                        {l.role}
                      </span>
                    </span>
                  </span>

                  <span className="font-mono text-2xs tnum text-fg-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* the detail panel */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-line bg-surface p-7">
            <div data-layer-panel-inner>
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl border",
                  toneRing[layer.tone],
                  toneIcon[layer.tone]
                )}
              >
                <layer.icon aria-hidden className="size-5" />
              </span>
              <p className="mt-5 font-mono text-2xs uppercase tracking-[0.14em] text-fg-subtle">
                {layer.role}
              </p>
              <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.02em]">
                {layer.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                {layer.detail}
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
                {layer.metrics.map((m) => (
                  <div key={m.k} className="bg-surface px-4 py-3">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle">
                      {m.k}
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{m.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* progress through the stack */}
            <div className="mt-7 flex items-center gap-3 border-t border-line pt-5">
              <div className="flex flex-1 gap-1">
                {LAYERS.map((l, i) => (
                  <span
                    key={l.id}
                    className={cn(
                      "h-0.5 flex-1 rounded-full transition-colors duration-500",
                      i <= active ? "bg-primary" : "bg-line-strong"
                    )}
                  />
                ))}
              </div>
              <span className="font-mono text-2xs tnum text-fg-subtle">
                {String(active + 1).padStart(2, "0")}/
                {String(LAYERS.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
