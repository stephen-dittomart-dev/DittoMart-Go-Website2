"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import ecosystem from "@/assets/DittoMart.png";
import { SplitHeading } from "@/components/motion/split-heading";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

const NODES = [
  { id: "3pl", label: "3PL providers", note: "Rapido · Ola · partner fleets", x: "18%", y: "26%" },
  { id: "agency-a", label: "Local agencies", note: "Our own rider network", x: "80%", y: "28%" },
  { id: "agency-b", label: "Local agencies", note: "Zone-level depots", x: "17%", y: "76%" },
  { id: "retail", label: "Retail shops", note: "Dark stores · outlets", x: "81%", y: "78%" },
];

/**
 * The ecosystem band — §1 of the flowchart, "Ecosystem Stakeholders".
 *
 * A full-bleed dark plate on a warm page. The contrast is deliberate: after
 * several dimmed-sand sections this drops the viewer into the system's own
 * world for one screen, which is the single biggest rhythm change on the
 * page. The artwork scales slowly under scroll and callout pins settle onto
 * it one at a time.
 */
export function Ecosystem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-eco]"), { opacity: 1, scale: 1, y: 0 });
        return;
      }

      // Slow push-in across the whole band.
      gsap.fromTo(
        q("[data-eco='art']"),
        { scale: 1.16, yPercent: 4 },
        {
          scale: 1,
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );

      gsap.set(q("[data-eco='pin']"), { opacity: 0, scale: 0.5, y: 16 });
      gsap.set(q("[data-eco='copy'] > *"), { opacity: 0, y: 26 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } })
        .to(q("[data-eco='copy'] > *"), {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: EASE.out4,
          stagger: 0.09,
        })
        .to(
          q("[data-eco='pin']"),
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(2)",
            stagger: 0.12,
          },
          "-=0.4"
        );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="ecosystem"
      className="relative scroll-mt-24 overflow-hidden border-y border-line bg-[#071018]"
    >
      {/* the artwork */}
      <div className="absolute inset-0">
        <div data-eco="art" className="relative size-full will-change-transform">
          <Image
            src={ecosystem}
            alt="The DittoMart Go ecosystem: 3PL providers including Rapido and Ola, local agencies and retail shops all connected through the DittoMart Go hub."
            fill
            sizes="100vw"
            placeholder="blur"
            className="object-cover object-center"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,24,0.82)_0%,rgba(7,16,24,0.35)_38%,rgba(7,16,24,0.88)_100%)]"
        />
      </div>

      {/* callout pins on the artwork */}
      <div aria-hidden className="absolute inset-0 hidden lg:block">
        {NODES.map((n) => (
          <div
            key={n.id + n.x}
            data-eco="pin"
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: n.x, top: n.y }}
          >
            <div className="flex items-center gap-2.5 rounded-full border border-white/25 bg-black/55 px-3.5 py-2 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-[#f4661f]" />
                <span className="relative inline-flex size-2 rounded-full bg-[#f4661f]" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-xs font-semibold text-white">{n.label}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55">
                  {n.note}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* copy */}
      <div className="container-page relative py-28 md:py-40">
        <div data-eco="copy" className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 font-mono text-2xs uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
            The ecosystem
          </span>

          <SplitHeading
            as="h2"
            mode="bounce"
            text="Everyone who moves a parcel, on one board"
            className="mt-7 text-3xl font-semibold leading-[1.06] tracking-[-0.03em] text-white md:text-5xl"
          />

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Third-party fleets, our own local agencies and the retail outlets
            sending the goods — all connected through one hub. Nobody on this
            board talks to anybody else directly. Everything routes through
            DittoMart Go.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-2xs uppercase tracking-[0.14em] text-white/45">
            <span>3PL providers</span>
            <span className="text-[#f4661f]">·</span>
            <span>Local agencies</span>
            <span className="text-[#f4661f]">·</span>
            <span>Retail shops</span>
            <span className="text-[#f4661f]">·</span>
            <span>ONDC network</span>
          </div>
        </div>
      </div>
    </section>
  );
}
