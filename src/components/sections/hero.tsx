"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { NetworkRail } from "@/components/sections/network";
import { Button } from "@/components/ui/button";
import { AmbientBackdrop } from "@/components/visuals/ambient";
import { OrchestrationCanvas } from "@/components/visuals/orchestration-canvas";
import { ShaderField } from "@/components/visuals/shader-field";
import { useMagnetic } from "@/hooks/use-motion";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/**
 * Home hero — the cinematic opening.
 *
 * Animation language for this page: *assembly*. Elements arrive in the order
 * the system itself would process a request, and the diagram literally builds
 * before the packets start flowing. Nothing here fades in as a group.
 */
export function Hero({ ready = true }: { ready?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const ctaRef = useMagnetic<HTMLSpanElement>(0.34);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-hero]"), { opacity: 1, y: 0, clearProps: "all" });
        return;
      }

      // While the intro overlay is still on screen the hero holds its
      // pre-entrance state, so the two sequences never overlap.
      if (!ready) {
        gsap.set(
          q(
            "[data-hero='badge'], [data-hero='lede'], [data-hero='note'], [data-hero='panel'], [data-hero='rail'], [data-hero-float]"
          ),
          { opacity: 0 }
        );
        gsap.set(q("[data-hero='cta'] > *"), { opacity: 0 });
        return;
      }

      gsap.set(q("[data-hero='badge']"), { opacity: 0, y: 14 });
      gsap.set(q("[data-hero='lede']"), { opacity: 0, y: 18 });
      gsap.set(q("[data-hero='cta'] > *"), { opacity: 0, y: 16 });
      gsap.set(q("[data-hero='note']"), { opacity: 0 });
      gsap.set(q("[data-hero='panel']"), { opacity: 0, y: 46, scale: 0.965 });
      gsap.set(q("[data-hero-float]"), { opacity: 0, y: 16, scale: 0.94 });
      gsap.set(q("[data-hero='rail']"), { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: EASE.out3 } });

      tl.to(q("[data-hero='badge']"), { opacity: 1, y: 0, duration: 0.55 }, 0.35)
        // headline runs itself via SplitHeading at delay 0.5
        .to(q("[data-hero='lede']"), { opacity: 1, y: 0, duration: 0.65 }, 1.05)
        .to(
          q("[data-hero='cta'] > *"),
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.09 },
          1.18
        )
        .to(q("[data-hero='note']"), { opacity: 1, duration: 0.5 }, 1.42)
        .to(
          q("[data-hero='panel']"),
          { opacity: 1, y: 0, scale: 1, duration: 1.25, ease: EASE.out4 },
          0.72
        )
        .to(
          q("[data-hero-float]"),
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: EASE.back,
            stagger: 0.12,
          },
          2.1
        )
        .to(q("[data-hero='rail']"), { opacity: 1, duration: 0.6 }, 2.2);

      // Floating cards drift independently once they have landed.
      const floats = q("[data-hero-float]");
      floats.forEach((card, i) => {
        gsap.to(card, {
          y: i % 2 === 0 ? -9 : -13,
          duration: 3.4 + i * 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 2.6 + i * 0.2,
        });
      });

      // Depth parallax on the panel as the hero leaves.
      gsap.to(q("[data-hero='panel']"), {
        yPercent: -9,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      // Copy column drifts slightly faster — layered depth, not a slideshow.
      gsap.to(q("[data-hero='copy']"), {
        yPercent: -16,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "70% top",
          scrub: 0.6,
        },
      });

      return () => tl.kill();
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden pt-36 md:pt-44"
    >
      <AmbientBackdrop variant="hero" />

      {/*
        The WebGL flow field sits above the backdrop but below all copy, and
        is masked away from the centre of the viewport where the headline
        lives — the shader adds light at the edges without ever touching the
        contrast of the text.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_58%_50%_at_50%_38%,transparent_35%,#000_78%)]"
      >
        <ShaderField intensity={0.9} />
      </div>

      <div className="container-page relative">
        <div
          data-hero="copy"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <div data-hero="badge">
            <Link
              href="/network#ondc"
              data-cursor="explore"
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface-2/70 py-1.5 pl-1.5 pr-4 text-xs backdrop-blur-sm transition-colors duration-200 hover:border-primary-border"
            >
              <span className="rounded-full bg-primary px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide text-primary-fg">
                Live
              </span>
              <span className="text-fg-muted transition-colors group-hover:text-fg">
                ONDC rail is on — Ola and Rapido now reachable through one call
              </span>
              <ArrowRight
                aria-hidden
                className="size-3.5 text-fg-subtle transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <SplitHeading
            as="h1"
            text="One integration. Every delivery network."
            highlight={["Every", "delivery", "network"]}
            mode="lines"
            scroll={false}
            play={ready}
            delay={0.3}
            className="mt-8 text-4xl font-semibold leading-[1.02] tracking-[-0.038em] md:text-6xl lg:text-7xl"
          />

          <p
            data-hero="lede"
            className="mt-7 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg"
          >
            Adloggs, Shiprocket Quick, Flash by Shadowfax, Pidge, Quicka, Owter,
            Ek Bharath, Pro Routing and ONDC — carrying Ola and Rapido. Nine
            networks, one API call. We price it, fund it, route it and hand you
            back a tracking link. You never manage a courier again.
          </p>

          <div
            data-hero="cta"
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <span ref={ctaRef} className="inline-block">
              <Button asChild size="lg" data-cursor="start">
                <Link href="/contact">
                  Book a demo
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </span>
            <Button asChild variant="outline" size="lg">
              <Link href="/developers">
                <Terminal aria-hidden />
                Read the API docs
              </Link>
            </Button>
          </div>

          <p data-hero="note" className="mt-6 text-xs text-fg-subtle">
            Sandbox access in minutes · No fleet contracts · Pay per delivery
          </p>
        </div>

        {/* ---------- the system, drawn ---------- */}
        <div
          data-hero="panel"
          className="relative mx-auto mt-20 max-w-6xl md:mt-24"
        >
          <div className="glass relative rounded-3xl p-4 shadow-e3 md:p-8">
            <OrchestrationCanvas />
          </div>
          <div
            aria-hidden
            className="absolute -inset-x-10 -bottom-14 -z-10 h-40 rounded-full opacity-70 blur-[90px]"
            style={{
              background:
                "radial-gradient(closest-side, var(--spot-1), transparent 75%)",
            }}
          />
        </div>
      </div>

      {/* ---------- the network we aggregate ---------- */}
      <div data-hero="rail" className="relative mt-24">
        <NetworkRail />
      </div>
    </section>
  );
}
