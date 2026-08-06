"use client";

import { useGSAP } from "@gsap/react";
import { Bike, Network, Snowflake, Truck } from "lucide-react";
import { useRef, useState } from "react";
import { useSequence } from "@/hooks/use-motion";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The hero diagram. One API call enters on the left, the four engines resolve
 * it in the centre, three supply rails compete on the right, one wins.
 *
 * Motion is staged rather than ambient: on entrance the wires draw themselves
 * in order (request → engines → rails → delivery), and only once the system is
 * "built" do the packets begin to flow. That sequence is the product's own
 * explanation, so the animation is doing narrative work rather than decoration.
 */

const RAILS = [
  {
    id: "3pl",
    label: "8 partner fleets",
    y: 74,
    color: "var(--color-ember-500)",
  },
  {
    id: "fleet",
    label: "Own agency fleet",
    y: 160,
    color: "var(--color-teal-600)",
  },
  {
    id: "ondc",
    label: "ONDC · Ola, Rapido",
    y: 246,
    color: "var(--color-crimson-600)",
  },
];

const ENGINES = [
  { label: "Tariff", sub: "rate locked", y: 96 },
  { label: "Wallet", sub: "funds verified", y: 138 },
  { label: "Routing", sub: "providers ranked", y: 180 },
  { label: "Allocation", sub: "first accept wins", y: 222 },
];

const railPath = (y: number) => `M550 160 C 610 160, 620 ${y}, 690 ${y}`;

export function OrchestrationCanvas({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [built, setBuilt] = useState(prefersReducedMotion());

  // Once built, the engine list cycles like a live pipeline.
  const activeEngine = useSequence(ENGINES.length - 1, 1500, built);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-oc]"), { opacity: 1, drawSVG: "100%" });
        setBuilt(true);
        return;
      }

      const tl = gsap.timeline({
        delay: 0.75,
        onComplete: () => setBuilt(true),
      });

      // everything starts unbuilt
      gsap.set(q("[data-oc-wire]"), { drawSVG: "0%" });
      gsap.set(q("[data-oc-node]"), { opacity: 0, scale: 0.86, transformOrigin: "center" });
      gsap.set(q("[data-oc-text]"), { opacity: 0 });
      gsap.set(q("[data-oc-engine]"), { opacity: 0, x: -14 });

      tl
        // 1 — the request arrives
        .to(q("[data-oc-node='in']"), {
          opacity: 1,
          scale: 1,
          duration: DUR.fast,
          ease: EASE.back,
        })
        .to(
          q("[data-oc-text='in']"),
          { opacity: 1, duration: DUR.fast },
          "-=0.15"
        )
        .to(
          q("[data-oc-wire='in']"),
          { drawSVG: "100%", duration: 0.5, ease: EASE.inOut },
          "-=0.1"
        )

        // 2 — the core materialises
        .to(
          q("[data-oc-node='core']"),
          { opacity: 1, scale: 1, duration: 0.5, ease: EASE.out3 },
          "-=0.2"
        )
        .to(q("[data-oc-text='core']"), { opacity: 1, duration: DUR.fast }, "<")
        .to(q("[data-oc-engine]"), {
          opacity: 1,
          x: 0,
          duration: 0.42,
          ease: EASE.out3,
          stagger: 0.09,
        })

        // 3 — the rails fan out
        .to(
          q("[data-oc-wire='rail']"),
          { drawSVG: "100%", duration: 0.62, ease: EASE.out3, stagger: 0.1 },
          "-=0.1"
        )
        .to(
          q("[data-oc-node='rail']"),
          {
            opacity: 1,
            scale: 1,
            duration: 0.42,
            ease: EASE.back,
            stagger: 0.1,
          },
          "-=0.45"
        )
        .to(q("[data-oc-text='rail']"), { opacity: 1, duration: 0.3, stagger: 0.1 }, "<")

        // 4 — one rail wins and reaches the customer
        .to(q("[data-oc-wire='out']"), {
          drawSVG: "100%",
          duration: 0.4,
          ease: EASE.out3,
        })
        .to(
          q("[data-oc-node='out']"),
          { opacity: 1, scale: 1, duration: 0.42, ease: EASE.back },
          "-=0.2"
        )
        .to(q("[data-oc-text='out']"), { opacity: 1, duration: 0.3 }, "<");

      return () => tl.kill();
    },
    { scope: root }
  );

  return (
    <div ref={root} className={cn("relative w-full", className)}>
      <svg
        viewBox="0 0 900 320"
        className="w-full overflow-visible"
        role="img"
        aria-label="One API request enters DittoMart Go, is priced, funded and routed, then dispatched across the 3PL, direct fleet and ONDC supply rails to the customer."
      >
        <defs>
          <linearGradient id="oc-core" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-ember-500)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-crimson-500)" stopOpacity="0.1" />
          </linearGradient>
          <filter id="oc-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ---------- inbound: your application ---------- */}
        <g data-oc data-oc-node="in">
          <rect
            x="8"
            y="130"
            width="132"
            height="60"
            rx="12"
            fill="var(--surface-2)"
            stroke="var(--line-strong)"
          />
        </g>
        <g data-oc data-oc-text="in">
          <text
            x="74"
            y="155"
            textAnchor="middle"
            className="fill-[var(--fg)] text-[13px] font-medium"
          >
            Your application
          </text>
          <text
            x="74"
            y="173"
            textAnchor="middle"
            className="fill-[var(--fg-subtle)] font-mono text-[10px]"
          >
            POST /v1/orders
          </text>
        </g>

        <path
          data-oc
          data-oc-wire="in"
          d="M140 160 H 290"
          stroke="var(--line-strong)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* ---------- core ---------- */}
        <rect
          data-oc
          data-oc-node="core"
          x="290"
          y="52"
          width="260"
          height="216"
          rx="18"
          fill="url(#oc-core)"
          stroke="var(--primary-border)"
        />
        <text
          data-oc
          data-oc-text="core"
          x="420"
          y="80"
          textAnchor="middle"
          className="fill-[var(--fg-subtle)] text-[10px] font-semibold uppercase tracking-[0.16em]"
        >
          DittoMart Go
        </text>

        {ENGINES.map((engine, i) => {
          const isActive = built && activeEngine === i;
          return (
            <g key={engine.label} data-oc data-oc-engine>
              <rect
                x="310"
                y={engine.y}
                width="220"
                height="34"
                rx="9"
                fill={isActive ? "var(--primary-soft)" : "var(--elevated)"}
                stroke={isActive ? "var(--primary-border)" : "var(--line)"}
                style={{ transition: "fill 300ms ease, stroke 300ms ease" }}
              />
              <circle
                cx="327"
                cy={engine.y + 17}
                r={isActive ? 3.6 : 3}
                fill={isActive ? "var(--color-teal-400)" : "var(--fg-subtle)"}
                style={{ transition: "all 300ms ease" }}
              />
              <text
                x="342"
                y={engine.y + 21}
                className={
                  isActive
                    ? "fill-[var(--fg)] text-[12px] font-semibold"
                    : "fill-[var(--fg)] text-[12px] font-medium"
                }
              >
                {engine.label}
              </text>
              <text
                x="516"
                y={engine.y + 21}
                textAnchor="end"
                className="fill-[var(--fg-subtle)] font-mono text-[10px]"
              >
                {engine.sub}
              </text>
            </g>
          );
        })}

        {/* ---------- three supply rails ---------- */}
        {RAILS.map((rail, i) => {
          const d = railPath(rail.y);
          return (
            <g key={rail.id}>
              <path
                data-oc
                data-oc-wire="rail"
                d={d}
                stroke={i === 1 ? rail.color : "var(--line-strong)"}
                strokeWidth={i === 1 ? 1.9 : 1.5}
                fill="none"
                strokeOpacity={i === 1 ? 0.9 : 1}
              />

              <rect
                data-oc
                data-oc-node="rail"
                x="690"
                y={rail.y - 19}
                width="132"
                height="38"
                rx="10"
                fill="var(--surface-2)"
                stroke={i === 1 ? rail.color : "var(--line)"}
                strokeOpacity={i === 1 ? 0.7 : 1}
              />
              <text
                data-oc
                data-oc-text="rail"
                x="756"
                y={rail.y + 4}
                textAnchor="middle"
                className="fill-[var(--fg)] text-[12px] font-medium"
              >
                {rail.label}
              </text>

              {/* packets only start once the system has finished building */}
              {built && !prefersReducedMotion() ? (
                <circle r="3.2" fill={rail.color} filter="url(#oc-glow)">
                  <animateMotion
                    dur={`${3.4 + i * 0.6}s`}
                    repeatCount="indefinite"
                    begin={`${i * 0.8}s`}
                    path={d}
                  />
                </circle>
              ) : null}
            </g>
          );
        })}

        {/* ---------- winning rail collapses to one delivery ---------- */}
        <path
          data-oc
          data-oc-wire="out"
          d="M822 160 H 872"
          stroke="var(--color-teal-600)"
          strokeWidth="1.75"
          fill="none"
        />
        <g data-oc data-oc-node="out">
          <circle
            cx="878"
            cy="160"
            r="9"
            fill="var(--color-teal-600)"
            fillOpacity="0.16"
            stroke="var(--color-teal-600)"
          />
          <circle cx="878" cy="160" r="3" fill="var(--color-teal-600)" />
        </g>
        <text
          data-oc
          data-oc-text="out"
          x="878"
          y="192"
          textAnchor="middle"
          className="fill-[var(--fg-muted)] text-[11px]"
        >
          Customer
        </text>
      </svg>

      {/* ---------- floating evidence cards ---------- */}
      <FloatCard
        className="left-[2%] top-[2%] hidden md:flex"
        icon={<Truck className="size-3.5" />}
        label="Providers triggered"
        value="4"
        tone="brand"
      />
      <FloatCard
        className="right-[1%] top-[4%] hidden md:flex"
        icon={<Bike className="size-3.5" />}
        label="Accepted in"
        value="8.4s"
        tone="accent"
      />
      <FloatCard
        className="bottom-[4%] left-[8%] hidden lg:flex"
        icon={<Snowflake className="size-3.5" />}
        label="Cold chain"
        value="3.2°C"
        tone="accent"
      />
      <FloatCard
        className="bottom-[1%] right-[6%] hidden lg:flex"
        icon={<Network className="size-3.5" />}
        label="Double assignments"
        value="0"
        tone="success"
      />
    </div>
  );
}

function FloatCard({
  className,
  icon,
  label,
  value,
  tone = "brand",
}: {
  className?: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "brand" | "accent" | "success";
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent"
      : tone === "success"
        ? "text-success"
        : "text-primary";

  return (
    <div
      data-hero-float
      className={cn(
        "glass absolute items-center gap-3 rounded-xl px-3.5 py-2.5 shadow-e2",
        className
      )}
    >
      <span className={cn("shrink-0", toneClass)}>{icon}</span>
      <span className="flex flex-col leading-tight">
        <span className="text-2xs text-fg-subtle">{label}</span>
        <span className="text-sm font-semibold tnum text-fg">{value}</span>
      </span>
    </div>
  );
}
