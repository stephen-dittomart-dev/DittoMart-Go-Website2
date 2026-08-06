"use client";

import { useGSAP } from "@gsap/react";
import { Check, Lock, X } from "lucide-react";
import { useRef, useState } from "react";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Broadcast allocation, drawn to scale and driven by scroll.
 *
 * Four providers are triggered at t=0. One accepts. The instant it does, a
 * distributed lock closes and every other provider is cancelled.
 *
 * The lock line is the one deliberately abrupt motion in the entire site: it
 * snaps rather than eases, because the lock is atomic and the motion should
 * say so. Everything else is scrubbed, so the reader controls the pace of the
 * explanation.
 */

const T_MAX = 9000;
const LOCK_AT = 8412;

const LANES = [
  { provider: "Rapido", responded: 8412, result: "accepted" as const },
  { provider: "Dunzo", responded: 8560, result: "cancelled" as const, cancelAck: 8752 },
  { provider: "Wefast", responded: 8548, result: "cancelled" as const, cancelAck: 8690 },
  {
    provider: "Direct fleet · Adyar",
    responded: 8571,
    result: "cancelled" as const,
    cancelAck: 8934,
  },
];

const pct = (ms: number) => (ms / T_MAX) * 100;

const GUARDRAILS = [
  { icon: Lock, label: "Accept lock atomic" },
  { icon: Check, label: "Fan-out under 2s" },
  { icon: Check, label: "Eligibility respected" },
  { icon: Check, label: "Cancellation cost recorded" },
];

export function AllocationTimeline({
  className,
  scrub = true,
}: {
  className?: string;
  /** Scroll-scrubbed (default) or play-once when it enters view. */
  scrub?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      const bars = q("[data-lane-bar]");
      const marks = q("[data-lane-mark]");
      const labels = q("[data-lane-label]");
      const lock = q("[data-lock]");
      const rails = q("[data-guardrail]");

      if (prefersReducedMotion()) {
        gsap.set(bars, { scaleX: 1 });
        gsap.set([marks, labels, lock, rails], { opacity: 1, scale: 1 });
        setElapsed(T_MAX);
        return;
      }

      gsap.set(bars, { scaleX: 0, transformOrigin: "left" });
      gsap.set(marks, { opacity: 0, scale: 0.4 });
      gsap.set(labels, { opacity: 0, x: -6 });
      gsap.set(lock, { opacity: 0, scaleY: 0.3 });
      gsap.set(rails, { opacity: 0, y: 6 });

      const trigger = scrub
        ? {
            trigger: el,
            start: "top 76%",
            end: "bottom 58%",
            scrub: 0.6,
          }
        : { trigger: el, start: "top 78%", once: true };

      const tl = gsap.timeline({ scrollTrigger: trigger });

      // 1 — the fan-out. All four lanes race simultaneously.
      LANES.forEach((lane, i) => {
        const endMs = lane.cancelAck ?? lane.responded;
        tl.to(
          bars[i],
          {
            scaleX: endMs / T_MAX,
            duration: 1.4,
            ease: scrub ? "none" : EASE.out3,
          },
          0
        );
      });

      // running clock readout
      const clock = { t: 0 };
      tl.to(
        clock,
        {
          t: T_MAX,
          duration: 1.4,
          ease: "none",
          onUpdate: () => setElapsed(clock.t),
        },
        0
      );

      // 2 — the lock. Snaps. No easing, minimal duration.
      tl.to(lock, { opacity: 1, scaleY: 1, duration: 0.06, ease: "none" }, 1.28);

      // 3 — results resolve
      tl.to(
        marks,
        { opacity: 1, scale: 1, duration: 0.28, ease: EASE.back, stagger: 0.05 },
        1.3
      ).to(
        labels,
        { opacity: 1, x: 0, duration: 0.3, ease: EASE.out3, stagger: 0.05 },
        1.38
      );

      // 4 — guardrails assert themselves
      tl.to(
        rails,
        { opacity: 1, y: 0, duration: 0.3, ease: EASE.out3, stagger: 0.07 },
        1.55
      );

      return () => tl.kill();
    },
    { scope: root, dependencies: [scrub] }
  );

  return (
    <div
      ref={root}
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface",
        className
      )}
    >
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-fg-subtle">ord_8f31c2a7</span>
          <span className="rounded-full border border-primary-border bg-primary-soft px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-primary">
            Broadcast · N=4
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-fg-muted">
          <span className="font-mono tnum">
            t+{(elapsed / 1000).toFixed(2)}s
          </span>
          <span>
            Cancel fan-out{" "}
            <span className="font-semibold text-success tnum">522ms</span>
          </span>
        </div>
      </div>

      {/* lanes */}
      <div className="relative px-5 py-6">
        {/* lock line — spans the lane column only */}
        <div
          className="pointer-events-none absolute inset-y-4 z-10"
          style={{
            left: "calc(1.25rem + 7.5rem + 1rem)",
            right: "calc(1.25rem + 6rem + 1rem)",
          }}
        >
          <div
            data-lock
            className="absolute inset-y-0 w-px origin-center bg-pulse-400"
            style={{ left: `${pct(LOCK_AT)}%` }}
          >
            <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-pulse-400 shadow-[0_0_14px_var(--color-pulse-400)]" />
            <span className="absolute -top-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[color-mix(in_oklab,var(--color-pulse-400)_40%,transparent)] bg-warning-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold text-warning">
              LOCK
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {LANES.map((lane) => {
            const isWinner = lane.result === "accepted";
            const endMs = lane.cancelAck ?? lane.responded;
            return (
              <div key={lane.provider} className="flex items-center gap-4">
                <div className="w-[7.5rem] shrink-0 truncate text-xs text-fg-muted md:w-40 md:text-sm">
                  {lane.provider}
                </div>

                <div className="relative h-7 flex-1 rounded-md bg-surface-2/60">
                  <span className="absolute left-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-fg-subtle" />

                  <div
                    data-lane-bar
                    className={cn(
                      "absolute inset-y-1 left-0 w-full rounded-[4px]",
                      isWinner
                        ? "bg-[color-mix(in_oklab,var(--success)_30%,transparent)]"
                        : "bg-[color-mix(in_oklab,var(--fg-subtle)_22%,transparent)]"
                    )}
                  />

                  <span
                    data-lane-mark
                    className={cn(
                      "absolute top-1/2 z-20 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border",
                      isWinner
                        ? "border-[color-mix(in_oklab,var(--success)_50%,transparent)] bg-success-soft text-success"
                        : "border-line bg-surface-2 text-fg-subtle"
                    )}
                    style={{ left: `${pct(endMs)}%` }}
                  >
                    {isWinner ? (
                      <Check aria-hidden className="size-3" strokeWidth={3} />
                    ) : (
                      <X aria-hidden className="size-3" strokeWidth={3} />
                    )}
                  </span>
                </div>

                <div className="w-24 shrink-0 text-right">
                  <span
                    data-lane-label
                    className={cn(
                      "inline-block font-mono text-2xs font-medium tnum",
                      isWinner ? "text-success" : "text-fg-subtle"
                    )}
                  >
                    {isWinner
                      ? "ACCEPTED"
                      : `CANCELLED ${lane.cancelAck! - LOCK_AT}ms`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* guardrail assertions */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line px-5 py-3.5">
        {GUARDRAILS.map(({ icon: I, label }) => (
          <span
            key={label}
            data-guardrail
            className="inline-flex items-center gap-1.5 text-2xs text-fg-muted"
          >
            <I aria-hidden className="size-3 text-success" strokeWidth={2.5} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
