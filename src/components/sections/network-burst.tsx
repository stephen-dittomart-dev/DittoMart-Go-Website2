"use client";

import { useGSAP } from "@gsap/react";
import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import threePl from "@/assets/3PL.png";
import detectionAI from "@/assets/detectionAI.png";
import engine from "@/assets/engine.png";
import fssai from "@/assets/fssai.png";
import globalLogistics from "@/assets/globalLogistics.png";
import ondc from "@/assets/ondc-buyer-seller.png";
import peakDemand from "@/assets/peakDemand.png";
import riderApp from "@/assets/riderApp.png";
import voiceAssist from "@/assets/voiceAssist.png";
import { SplitHeading } from "@/components/motion/split-heading";
import {
  EASE,
  gsap,
  prefersReducedMotion,
  registerGsap,
  ScrollTrigger,
} from "@/lib/motion";
import { providers } from "@/lib/providers";
import { sceneVars } from "@/lib/scenes";
import { cn } from "@/lib/utils";

/**
 * The nine networks, as a pinned burst.
 *
 * The section pins. The page stops. Nine plates start stacked dead centre and
 * fly outward past every edge of the viewport as scroll progresses, while the
 * name of the network currently in focus changes underneath.
 *
 * Two decisions worth recording:
 *
 *  · The plates travel on a radial vector computed per index rather than to
 *    hand-placed coordinates, so the burst stays even at any aspect ratio.
 *    Hard-coded positions look correct on one monitor and wrong on the next.
 *
 *  · Below 1024px the pin is abandoned entirely and the same nine become a
 *    plain vertical list. There is not enough viewport to pin *and* show
 *    anything moving, and a broken pin on a phone is far worse than no pin.
 */

const ART: StaticImageData[] = [
  threePl,
  globalLogistics,
  riderApp,
  peakDemand,
  detectionAI,
  engine,
  fssai,
  voiceAssist,
  ondc,
];

/** Even radial spread, nudged outward so nothing lands behind the copy. */
function vector(i: number, total: number) {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  const spread = 78; // vw/vh travelled at full progress
  return {
    x: Math.cos(angle) * spread,
    y: Math.sin(angle) * spread * 0.78,
    rot: (i % 2 === 0 ? 1 : -1) * (12 + (i % 3) * 6),
  };
}

export function NetworkBurst() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const plates = gsap.utils.toArray<HTMLElement>("[data-burst-plate]", el);
      const pin = el.querySelector<HTMLElement>("[data-burst-stage]");
      if (!plates.length || !pin) return;

      const reduced = prefersReducedMotion();
      const small = window.innerWidth < 1024;

      if (reduced || small) {
        gsap.set(plates, { clearProps: "all", opacity: 1 });
        setActive(providers.length - 1);
        return;
      }

      // all nine start stacked in the middle
      gsap.set(plates, {
        xPercent: -50,
        yPercent: -50,
        left: "50%",
        top: "50%",
        scale: 0.42,
        opacity: 0,
        rotate: 0,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: `+=${providers.length * 34}%`,
          pin,
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(
              providers.length - 1,
              Math.floor(self.progress * providers.length)
            );
            setActive(idx);
          },
        },
      });

      plates.forEach((plate, i) => {
        const v = vector(i, plates.length);
        // each plate appears, then leaves through its own edge
        tl.to(
          plate,
          { opacity: 1, scale: 0.72, duration: 0.25, ease: EASE.out3 },
          i * 0.09
        ).to(
          plate,
          {
            x: `${v.x}vw`,
            y: `${v.y}vh`,
            rotate: v.rot,
            scale: 1.15,
            opacity: 0,
            ease: "none",
            duration: 1,
          },
          i * 0.09 + 0.2
        );
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: root }
  );

  const current = providers[active];

  return (
    <section
      ref={root}
      id="network"
      style={sceneVars("ink")}
      className="relative isolate scroll-mt-24 bg-bg text-fg"
    >
      <div
        data-burst-stage
        className="relative flex min-h-dvh items-center justify-center overflow-hidden"
      >
        {/* wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 50%, var(--spot-1), transparent 70%)",
          }}
        />
        <div aria-hidden className="bg-grid absolute inset-0 opacity-50" />

        {/* the flying plates */}
        <div aria-hidden className="absolute inset-0 hidden lg:block">
          {ART.map((src, i) => (
            <div
              key={i}
              data-burst-plate
              className="absolute h-[26vh] w-[22vw] overflow-hidden rounded-2xl border border-line bg-[#f2ede5] shadow-e3 will-change-transform"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="22vw"
                placeholder="blur"
                className="object-cover mix-blend-multiply"
              />
            </div>
          ))}
        </div>

        {/* the copy holds the centre */}
        <div className="container-page relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 font-mono text-2xs uppercase tracking-[0.16em] text-fg-muted backdrop-blur-md">
            The network
          </span>

          <SplitHeading
            as="h2"
            mode="lines"
            text="Nine delivery networks. You integrate with one."
            highlight={["Nine", "networks."]}
            className="mx-auto mt-7 max-w-4xl text-3xl font-semibold leading-[1.06] tracking-[-0.035em] md:text-6xl"
          />

          {/* the network currently in focus */}
          <div className="mx-auto mt-10 flex min-h-[7rem] max-w-xl flex-col items-center">
            <span
              key={current.id}
              className="font-mono text-2xs uppercase tracking-[0.2em] text-primary"
              style={{ animation: "dm-step-in 420ms var(--ease-out-expo)" }}
            >
              {String(active + 1).padStart(2, "0")} / {String(providers.length).padStart(2, "0")}
            </span>
            <p
              key={`${current.id}-n`}
              className="mt-3 text-2xl font-semibold tracking-[-0.02em] md:text-3xl"
              style={{ animation: "dm-step-in 520ms var(--ease-out-expo)" }}
            >
              {current.name}
            </p>
            <p
              key={`${current.id}-t`}
              className="mt-2 text-sm text-fg-muted md:text-base"
              style={{ animation: "dm-step-in 620ms var(--ease-out-expo)" }}
            >
              {current.tagline} · {current.coverage}
            </p>
          </div>

          {/* progress pips */}
          <div className="mt-8 flex items-center justify-center gap-1.5">
            {providers.map((p, i) => (
              <span
                key={p.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === active ? "w-8 bg-primary" : "w-3 bg-line-strong"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* the mobile / reduced-motion fallback list */}
      <div className="container-page relative pb-24 lg:hidden">
        <ul className="grid gap-3 sm:grid-cols-2">
          {providers.map((p, i) => (
            <li
              key={p.id}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <span className="font-mono text-2xs text-fg-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-1.5 text-base font-medium">{p.name}</p>
              <p className="mt-1 text-sm text-fg-muted">{p.tagline}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
