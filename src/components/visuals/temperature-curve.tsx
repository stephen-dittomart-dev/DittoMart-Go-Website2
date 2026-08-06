"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Cold-chain temperature trace, scrubbed by scroll.
 *
 * The line draws in proportion to scroll position and a readout head rides
 * the end of it, reporting the live value. The point of the visual is that
 * the trace never leaves the safe band — so the reader should watch it happen
 * rather than arrive at a finished chart.
 */

const READINGS = [
  3.6, 3.4, 3.1, 2.9, 3.0, 3.2, 3.5, 3.8, 4.0, 3.9, 3.6, 3.3, 3.1, 3.0, 2.8, 2.9,
  3.1, 3.3, 3.2, 3.0,
];

const W = 520;
const H = 180;
const MIN = 0;
const MAX = 8;
const SAFE_MIN = 2;
const SAFE_MAX = 5;

const toY = (t: number) => H - ((t - MIN) / (MAX - MIN)) * H;
const points = READINGS.map((t, i) => ({
  x: (i / (READINGS.length - 1)) * W,
  y: toY(t),
  t,
}));

const linePath = points
  .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
  .join(" ");

const areaPath = `${linePath} L${W} ${H} L0 ${H} Z`;

export function TemperatureCurve({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [readout, setReadout] = useState({ temp: READINGS[0], idx: 0 });

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const line = el.querySelector<SVGPathElement>("[data-tc-line]");
      const area = el.querySelector<SVGPathElement>("[data-tc-area]");
      const head = el.querySelector<SVGGElement>("[data-tc-head]");
      const band = el.querySelector<SVGRectElement>("[data-tc-band]");
      const dots = gsap.utils.toArray<SVGCircleElement>("[data-tc-dot]", el);
      if (!line) return;

      if (prefersReducedMotion()) {
        gsap.set([line, area], { drawSVG: "100%", opacity: 1 });
        gsap.set(dots, { opacity: 1, scale: 1 });
        gsap.set(head, { opacity: 1 });
        setReadout({ temp: READINGS[READINGS.length - 1], idx: READINGS.length - 1 });
        return;
      }

      const len = line.getTotalLength();

      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(area, { opacity: 0 });
      gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: "center" });
      gsap.set(head, { opacity: 0 });

      // Safe band draws first — establish the rules before showing the data.
      gsap.from(band, {
        scaleY: 0,
        transformOrigin: "center",
        duration: 0.7,
        ease: EASE.out3,
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 74%",
          end: "bottom 62%",
          scrub: 0.55,
        },
      });

      tl.to(line, { strokeDashoffset: 0, ease: "none" }, 0)
        .to(area, { opacity: 1, ease: "none" }, 0)
        .to(head, { opacity: 1, duration: 0.05 }, 0);

      // Head rides the path and reports the value under it.
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 74%",
          end: "bottom 62%",
          scrub: 0.55,
        },
        onUpdate: () => {
          const pt = line.getPointAtLength(len * proxy.p);
          gsap.set(head, { x: pt.x, y: pt.y });
          const idx = Math.min(
            READINGS.length - 1,
            Math.round(proxy.p * (READINGS.length - 1))
          );
          setReadout({ temp: READINGS[idx], idx });
        },
      });

      // Sample dots pop as the line passes them.
      dots.forEach((dot, i) => {
        const at = (i * 4) / (READINGS.length - 1);
        gsap.to(dot, {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: EASE.back,
          scrollTrigger: {
            trigger: el,
            start: "top 74%",
            end: "bottom 62%",
            scrub: true,
            onUpdate: (self) => {
              if (self.progress >= at) {
                gsap.to(dot, { opacity: 1, scale: 1, duration: 0.2, overwrite: "auto" });
              }
            },
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface p-5",
        className
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Temperature trace</p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            CHILLED · 2°C to 5°C · 20 readings over 42 min
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-success-soft px-2.5 py-1 text-2xs font-semibold text-success">
            <span className="size-1.5 animate-breathe rounded-full bg-success" />
            In range
          </span>
          <span className="font-mono text-[11px] tnum text-fg-muted">
            {readout.temp.toFixed(1)}°C
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Temperature stayed between 2.8 and 4.0 degrees Celsius across the whole trip, inside the 2 to 5 degree safe band."
      >
        <defs>
          <linearGradient id="tc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-teal-400)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-teal-400)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* safe band */}
        <rect
          data-tc-band
          x="0"
          y={toY(SAFE_MAX)}
          width={W}
          height={toY(SAFE_MIN) - toY(SAFE_MAX)}
          fill="var(--success-soft)"
        />
        <line
          x1="0"
          x2={W}
          y1={toY(SAFE_MAX)}
          y2={toY(SAFE_MAX)}
          stroke="var(--success)"
          strokeOpacity="0.45"
          strokeDasharray="4 5"
        />
        <line
          x1="0"
          x2={W}
          y1={toY(SAFE_MIN)}
          y2={toY(SAFE_MIN)}
          stroke="var(--success)"
          strokeOpacity="0.45"
          strokeDasharray="4 5"
        />

        {[0, 2, 4, 6, 8].map((t) => (
          <line
            key={t}
            x1="0"
            x2={W}
            y1={toY(t)}
            y2={toY(t)}
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}

        <path data-tc-area d={areaPath} fill="url(#tc-fill)" />

        <path
          data-tc-line
          d={linePath}
          fill="none"
          stroke="var(--color-teal-400)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) =>
          i % 4 === 0 ? (
            <circle
              key={i}
              data-tc-dot
              cx={p.x}
              cy={p.y}
              r="3"
              fill="var(--bg)"
              stroke="var(--color-teal-400)"
              strokeWidth="1.8"
            />
          ) : null
        )}

        {/* readout head */}
        <g data-tc-head>
          <circle
            r="12"
            fill="var(--color-teal-400)"
            fillOpacity="0.14"
            className="animate-breathe"
          />
          <circle r="4.5" fill="var(--bg)" stroke="var(--color-teal-400)" strokeWidth="2" />
        </g>
      </svg>

      <div className="mt-4 flex items-center justify-between text-2xs text-fg-subtle">
        <span>Pickup 18:04</span>
        <span className="font-mono tnum">
          reading {String(readout.idx + 1).padStart(2, "0")}/20
        </span>
        <span>Handover 18:46</span>
      </div>
    </div>
  );
}
