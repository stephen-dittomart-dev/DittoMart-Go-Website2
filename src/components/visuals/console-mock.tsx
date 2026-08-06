"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { CountUp } from "@/components/motion/count-up";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

const ORDERS = [
  { id: "ord_9a21", route: "T. Nagar → Adyar", rail: "3PL", status: "In transit", tone: "info", eta: "12 min" },
  { id: "ord_9a22", route: "Guindy → Velachery", rail: "Fleet", status: "Delivered", tone: "success", eta: "—" },
  { id: "ord_9a23", route: "Anna Nagar → Kilpauk", rail: "Fleet", status: "Picked up", tone: "info", eta: "18 min" },
  { id: "ord_9a24", route: "Nungambakkam → Mylapore", rail: "3PL", status: "Allocating", tone: "warn", eta: "—" },
  { id: "ord_9a25", route: "Porur → Ambattur", rail: "ONDC", status: "In transit", tone: "info", eta: "24 min" },
];

const toneMap = {
  info: "border-primary-border bg-primary-soft text-primary",
  success:
    "border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-success-soft text-success",
  warn: "border-[color-mix(in_oklab,var(--warning)_35%,transparent)] bg-warning-soft text-warning",
} as const;

/**
 * A restrained slice of the operations console.
 *
 * Rows stream in like a live feed — each one wipes in from the left behind its
 * rail-coloured edge, in the order a real board would receive them.
 */
export function ConsoleMock({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-row], [data-tile]"), { opacity: 1, y: 0, scaleY: 1 });
        return;
      }

      gsap.set(q("[data-tile]"), { opacity: 0, y: 14 });
      gsap.set(q("[data-row]"), { opacity: 0, x: -22 });
      gsap.set(q("[data-row-edge]"), { scaleY: 0, transformOrigin: "center" });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } })
        .to(q("[data-tile]"), {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: EASE.out3,
          stagger: 0.08,
        })
        .to(
          q("[data-row]"),
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: EASE.out3,
            stagger: 0.09,
          },
          "-=0.25"
        )
        .to(
          q("[data-row-edge]"),
          { scaleY: 1, duration: 0.34, ease: EASE.back, stagger: 0.09 },
          "-=0.55"
        );
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-e3",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-success" />
          <span className="text-xs font-medium">Operations console</span>
        </div>
        <span className="hidden items-center gap-1.5 text-2xs text-fg-subtle sm:inline-flex">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-success" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          Live · updated 2s ago
        </span>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-4">
        {[
          { label: "Active orders", value: 1284, suffix: "", tone: "text-fg" },
          { label: "On-time", value: 98.4, suffix: "%", decimals: 1, tone: "text-fg" },
          { label: "Avg accept", value: 9.2, suffix: "s", decimals: 1, tone: "text-fg" },
          { label: "Double assignments", value: 0, suffix: "", tone: "text-success" },
        ].map((tile) => (
          <div key={tile.label} data-tile className="bg-surface px-5 py-4">
            <p className="text-2xs uppercase tracking-[0.1em] text-fg-subtle">
              {tile.label}
            </p>
            <p className={cn("mt-1.5 text-xl font-semibold tnum", tile.tone)}>
              <CountUp
                value={tile.value}
                decimals={tile.decimals ?? 0}
                suffix={tile.suffix}
              />
            </p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-line">
        {ORDERS.map((o) => (
          <div
            key={o.id}
            data-row
            className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-200 hover:bg-surface-2/60"
          >
            <span
              data-row-edge
              className={cn(
                "h-8 w-[3px] shrink-0 rounded-full",
                o.rail === "Fleet"
                  ? "bg-teal-400"
                  : o.rail === "ONDC"
                    ? "bg-ember-400"
                    : "bg-crimson-400"
              )}
            />
            <span className="hidden w-20 shrink-0 font-mono text-2xs text-fg-subtle sm:block">
              {o.id}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-fg md:text-sm">
              {o.route}
            </span>
            <span className="hidden shrink-0 text-2xs text-fg-subtle md:block">
              {o.rail}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-2xs font-medium",
                toneMap[o.tone as keyof typeof toneMap]
              )}
            >
              {o.status}
            </span>
            <span className="hidden w-14 shrink-0 text-right text-2xs tnum text-fg-muted sm:block">
              {o.eta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
