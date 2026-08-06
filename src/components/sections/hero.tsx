"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { media } from "@/lib/media";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { useMagnetic } from "@/hooks/use-motion";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { sceneVars } from "@/lib/scenes";

/** The colour the next scene opens on, so the handover is seamless. */
const NEXT_SCENE_BG = "#e7dfd2";

/**
 * Home hero.
 *
 * Held on a CSS `sticky` stage inside a tall runway rather than a GSAP pin.
 * Both produce the same "the page stops while this plays" effect, but sticky
 * changes no layout: GSAP's pin injects a spacer element and rewrites the
 * section's box, which is what threw the dimensions out last time. Sticky is
 * native, measured by the browser, and cannot surprise the layout.
 *
 * The exit is one continuous move rather than a cut. The copy leaves through
 * the left edge, the artwork pushes toward the viewer and keeps growing, and
 * as it passes the frame it dissolves from the middle outward — the next
 * section is already the colour underneath that dissolve, so it appears to
 * emerge from the centre of the image rather than scroll up from below.
 */
export function Hero({ ready = true }: { ready?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const ctaRef = useMagnetic<HTMLSpanElement>(0.34);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      const track = runway.current;
      if (!el || !track) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-hero]"), { opacity: 1, y: 0, clearProps: "all" });
        return;
      }

      if (!ready) {
        gsap.set(
          q(
            "[data-hero='badge'], [data-hero='lede'], [data-hero='note'], [data-hero='cue']"
          ),
          { opacity: 0 }
        );
        gsap.set(q("[data-hero='cta'] > *"), { opacity: 0 });
        return;
      }

      /* ---------- entrance ---------- */
      gsap.set(q("[data-hero='badge']"), { opacity: 0, x: -28 });
      gsap.set(q("[data-hero='lede']"), { opacity: 0, x: -24 });
      gsap.set(q("[data-hero='cta'] > *"), { opacity: 0, y: 18 });
      gsap.set(q("[data-hero='note']"), { opacity: 0 });
      gsap.set(q("[data-hero='cue']"), { opacity: 0, y: -10 });

      const tl = gsap.timeline({ defaults: { ease: EASE.out4 } });
      tl.to(q("[data-hero='badge']"), { opacity: 1, x: 0, duration: 0.7 }, 0.1)
        .to(q("[data-hero='lede']"), { opacity: 1, x: 0, duration: 0.8 }, 0.85)
        .to(
          q("[data-hero='cta'] > *"),
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          1.0
        )
        .to(q("[data-hero='note']"), { opacity: 1, duration: 0.5 }, 1.25)
        .to(q("[data-hero='cue']"), { opacity: 1, y: 0, duration: 0.5 }, 1.4);

      // idle drift so the frame is alive before anyone scrolls
      gsap.to(q("[data-hero='art']"), {
        xPercent: 1.5,
        duration: 16,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      /* ---------- the exit, scrubbed across the runway ---------- */
      const exit = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      // 1 · copy clears left, early
      exit
        .to(
          q("[data-hero='copy']"),
          { xPercent: -58, autoAlpha: 0, filter: "blur(12px)", ease: "power1.in" },
          0
        )
        .to(q("[data-hero='cue']"), { autoAlpha: 0, ease: "none" }, 0)

        // 2 · the artwork zooms the whole way through
        .to(q("[data-hero='art']"), { scale: 2.45, ease: "power1.in" }, 0)
        .to(q("[data-hero='scrim']"), { autoAlpha: 0, ease: "none" }, 0.1)

        // 3 · it dissolves from the middle outward, and the next colour is
        //     already sitting behind that dissolve
        .fromTo(
          q("[data-hero='iris']"),
          { autoAlpha: 0, scale: 0.05 },
          { autoAlpha: 1, scale: 1, ease: "power2.in", duration: 0.55 },
          0.45
        )
        .to(q("[data-hero='art']"), { autoAlpha: 0, ease: "none", duration: 0.2 }, 0.85);

      return () => {
        tl.kill();
        exit.scrollTrigger?.kill();
        exit.kill();
      };
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} style={sceneVars("ink")} className="relative bg-bg text-fg">
      {/* the runway — its height is the length of the exit sequence */}
      <div ref={runway} className="relative h-[230vh]">
        {/* the stage — held by sticky, never re-laid-out */}
        <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
          {/* ---------- artwork ---------- */}
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            <div
              data-hero="art"
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src={media.hero.src}
                alt=""
                fill
                priority
                sizes="100vw"
                placeholder="blur"
                className="scale-[1.06] object-cover object-[52%_58%]"
              />
            </div>

            {/*
              Readability. A calm overall darkening plus a strong left column
              under the copy. The words sit on near-solid ink; by the middle
              of the frame the scrim is gone and the artwork reads normally.
            */}
            <div
              data-hero="scrim"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(7,10,15,0.94) 0%, rgba(7,10,15,0.9) 24%, rgba(7,10,15,0.72) 38%, rgba(7,10,15,0.4) 50%, rgba(7,10,15,0.14) 62%, rgba(7,10,15,0.05) 74%), linear-gradient(180deg, rgba(7,10,15,0.55) 0%, rgba(7,10,15,0.12) 30%, rgba(7,10,15,0.2) 70%, rgba(7,10,15,0.75) 100%)",
              }}
            />

            {/* the dissolve the next section emerges from */}
            <div
              data-hero="iris"
              className="absolute left-1/2 top-1/2 aspect-square w-[260vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                opacity: 0,
                background: `radial-gradient(closest-side, ${NEXT_SCENE_BG} 55%, ${NEXT_SCENE_BG}e6 72%, transparent 88%)`,
              }}
            />
          </div>

          {/* ---------- copy ---------- */}
          <div className="container-page relative w-full">
            <div data-hero="copy" className="max-w-2xl">
              <div data-hero="badge">
                <Link
                  href="/network#ondc"
                  data-cursor="explore"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/18 bg-black/50 py-1.5 pl-1.5 pr-4 text-xs backdrop-blur-md transition-colors duration-200 hover:border-primary-border"
                >
                  <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-2xs font-semibold uppercase tracking-wide text-primary-fg">
                    Live
                  </span>
                  <span className="text-white/80 transition-colors group-hover:text-white">
                    ONDC rail is on — Ola and Rapido through one call
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 text-white/55 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <SplitHeading
                as="h1"
                text="One integration. Every delivery network."
                highlight={["Every", "delivery", "network."]}
                /* One flat brand orange. A gradient across three words fights
                   the artwork behind it and reads as decoration; a single
                   solid colour reads as emphasis. */
                highlightClassName="text-[#fb8038]"
                mode="lines"
                scroll={false}
                play={ready}
                delay={0.3}
                className="mt-8 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)] sm:text-[3.4rem] lg:text-[4.4rem]"
              />

              <p
                data-hero="lede"
                className="mt-7 max-w-xl text-base leading-relaxed text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg"
              >
                Adloggs, Shiprocket Quick, Flash by Shadowfax, Pidge, Quicka,
                Owter, Ek Bharath, Pro Routing and ONDC — carrying Ola and
                Rapido. Nine networks, one API call.
              </p>

              <div
                data-hero="cta"
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <span ref={ctaRef} className="inline-block">
                  <Button asChild size="lg" data-cursor="start">
                    <Link href="/contact">
                      Book a demo
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                </span>
                <Button
                  asChild
                  size="lg"
                  className="border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                >
                  <Link href="/developers">
                    <Terminal aria-hidden />
                    Read the API docs
                  </Link>
                </Button>
              </div>

              <p
                data-hero="note"
                className="mt-7 font-mono text-2xs uppercase tracking-[0.16em] text-white/50"
              >
                Sandbox in minutes · No fleet contracts · Pay per delivery
              </p>
            </div>

            {/* scroll affordance */}
            <div
              data-hero="cue"
              className="mt-14 flex items-center gap-3 md:absolute md:-bottom-2 md:left-1/2 md:mt-0 md:-translate-x-1/2"
            >
              <span className="font-mono text-2xs uppercase tracking-[0.24em] text-white/50">
                Scroll to route
              </span>
              <span className="relative h-10 w-px overflow-hidden bg-white/25">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[dm-cue-run_1.8s_ease-in-out_infinite] bg-primary" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
