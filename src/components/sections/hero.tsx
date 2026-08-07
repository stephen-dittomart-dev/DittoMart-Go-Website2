"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef } from "react";
import scooty from "@/assets/new/deliveryScooty2.png";
import { RoutingMesh } from "@/components/motion/routing-mesh";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { useMagnetic } from "@/hooks/use-motion";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { sceneVars } from "@/lib/scenes";
import { cn } from "@/lib/utils";

/** The colour the next scene opens on, so the handover is seamless. */
const NEXT_SCENE_BG = "#e7dfd2";

/**
 * The vision, as a train of cards that follows the rider across the white
 * intermission. The first is the statement; the rest are what it means.
 *
 * This lives inside the hero's own exit — there is no separate section and no
 * separate scroll trigger. The runway simply gets longer on desktop to give
 * the train room to pass.
 */
const VISION_CARDS = [
  {
    eyebrow: "Our vision",
    title: "Any parcel, any city — without owning a vehicle",
    lead: true,
  },
  { eyebrow: "01", title: "One integration, not nine contracts" },
  { eyebrow: "02", title: "Capacity you rent, not a fleet you own" },
  { eyebrow: "03", title: "Proof attached to every handover" },
];

/**
 * Convoy geometry, in px. Shared by the layout and by the tween, so the
 * travel can never drift out of step with the thing travelling.
 *
 * The row is `CONVOY_HALF * 2` wide and centred with a negative margin, so
 * everything below is measured from the middle of the row:
 *
 *   `CONVOY_LEAD` — how far right of the row's left edge the rider's back
 *     wheel sits. Start the travel at `-(LEAD + half a viewport)` and the
 *     rider is exactly one pixel off the left edge of the screen; use the
 *     row's full half-width instead and there is a dead run of empty scroll
 *     before anything appears.
 *
 * The travel runs the full width: from one half-viewport left of the rider to
 * one half-viewport right of the last card, so the convoy enters completely
 * and leaves completely. It used to stop with the last card centred, which
 * meant the train sat frozen mid-screen for the last fifth of the runway.
 *
 * The last card passes the middle of the screen at roughly 78% of that travel
 * — `(1445 + LEAD + vw/2) / (HALF + LEAD + vw)`, which lands between 0.74 and
 * 0.82 across every plausible viewport. The convoy's duration below is set so
 * that mark falls where the film band starts climbing, and the two then run
 * together to the end.
 *
 * Both numbers grew when the statement joined the head of the row: the box has
 * to be wide enough to hold every item, and the lead has to reach the
 * *rightmost* edge of the content — which is now the wordmark, not the rider.
 */
const CONVOY_HALF = 1600;
const CONVOY_LEAD = 1480;

/**
 * Home hero.
 *
 * Held on a CSS `sticky` stage inside a tall runway rather than a GSAP pin.
 * Both produce the same "the page stops while this plays" effect, but sticky
 * changes no layout: GSAP's pin injects a spacer element and rewrites the
 * section's box, which is what threw the dimensions out last time. Sticky is
 * native, measured by the browser, and cannot surprise the layout.
 *
 * The backdrop is the routing mesh — a live canvas rather than a photograph.
 * The section's whole claim is that nine networks resolve into one graph, and
 * a drawn graph says that in a way a picture of a van cannot. It also gives
 * the exit something real to zoom into: you fly through the mesh rather than
 * across a flat plate.
 *
 * The exit is one continuous move rather than a cut. The copy leaves through
 * the left edge, the mesh pushes toward the viewer and keeps growing, and as
 * it passes the frame it dissolves from the middle outward — the next section
 * is already the colour underneath that dissolve, so it appears to emerge
 * from the centre of the graph rather than scroll up from below.
 */
export function Hero({ ready = true }: { ready?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const ctaRef = useMagnetic<HTMLSpanElement>(0.34);
  /** The exit timeline, so the line sweep can be added to it once split. */
  const exitRef = useRef<gsap.core.Timeline | null>(null);
  const sweptRef = useRef(false);

  /**
   * Add the per-line sweep to the exit timeline.
   *
   * Called both when the timeline is built and again when `SplitHeading`
   * reports that it has split — whichever happens second is the one that
   * finds both halves present and does the work. That ordering is genuinely
   * unknown: splitting waits on `document.fonts.ready`, which resolves before
   * the timeline on a warm cache and long after it on a cold one.
   */
  const addLineSweep = useCallback(() => {
    const el = root.current;
    const exit = exitRef.current;
    if (!el || !exit || sweptRef.current) return;

    const lines = Array.from(
      el.querySelectorAll<HTMLElement>("[data-hero='copy'] .split-line")
    );
    if (!lines.length) return;
    sweptRef.current = true;

    // The first line goes hard and the other two chase it. Equal speeds read
    // as a list animating; a lead and two followers reads as one gesture.
    const at = [0, 0.05, 0.11];
    const dur = [0.05, 0.07, 0.07];
    lines.forEach((line, i) => {
      exit.to(
        line,
        {
          xPercent: -118,
          autoAlpha: 0,
          filter: "blur(10px)",
          ease: "power2.in",
          duration: dur[Math.min(i, dur.length - 1)],
        },
        at[Math.min(i, at.length - 1)] + Math.max(0, i - 2) * 0.06
      );
    });
  }, []);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      const track = runway.current;
      if (!el || !track) return;
      const q = gsap.utils.selector(el);

      /*
        Park the convoy off the left edge before anything else runs.

        It has to happen here, ahead of every early return, because the tween
        that moves it lives on a scrubbed timeline that does not exist until
        `ready`. Without this the rig sits at its natural position — dead
        centre of the hero — from first paint until the reader scrolls, which
        is exactly the "it just shows up in the hero" problem.
      */
      gsap.set(q("[data-hero='sheet']"), {
        yPercent: 100,
        visibility: "visible",
      });
      gsap.set(q("[data-hero='convoy']"), {
        x: () => -(CONVOY_LEAD + window.innerWidth / 2),
      });

      if (prefersReducedMotion()) {
        gsap.set(q("[data-hero]"), { opacity: 1, y: 0, clearProps: "all" });
        // No exit timeline under reduced motion, so nothing would ever drive
        // the intermission. Better absent than parked across the hero.
        gsap.set(q("[data-hero='sheet']"), { autoAlpha: 0, yPercent: 100 });
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

      // The mesh supplies its own idle life — rotation, breathing, packets —
      // so the old drifting tween on the art wrapper is gone. Two sources of
      // ambient motion on the same element read as drift, not intent.

      /* The rider idles on its own clock, not on the scroll. Something that
         only moves while you are scrolling is a sticker, not a vehicle. */
      gsap.to(q("[data-hero='bob']"), {
        y: -12,
        duration: 1.5,
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

      /* 1 · the headline leaves a line at a time.

           The whole copy block used to sweep as one object, which is why it
           read as a panel being pushed rather than as writing being cleared.
           The three lines now go individually — the first fast, the other two
           chasing it — and only once they are gone does the rest of the
           column fade.

           The line tweens are not added here. The lines do not exist yet:
           SplitText runs after webfonts resolve, so at this moment the
           headline is still one text node. `addLineSweep` below drops them
           into this same timeline the instant they appear, at fixed
           positions, so the timeline's length never changes and the
           ScrollTrigger never needs re-measuring. */
      exitRef.current = exit;
      sweptRef.current = false;
      addLineSweep();

      exit
        .to(q("[data-hero='cue']"), { autoAlpha: 0, ease: "none", duration: 0.1 }, 0)

        /* Everything else in the column fades where it stands. It follows the
           last line out rather than travelling with it — the headline is what
           leaves, the supporting copy is what is left behind.

           The heading itself is in this group as a fallback: if webfonts
           never resolve and the split never happens, the line tweens are
           never added and this is the only thing that clears the headline. */
        .to(
          q(
            "[data-hero='badge'], [data-hero='lede'], [data-hero='cta'], [data-hero='note'], [data-hero='copy'] h1"
          ),
          { autoAlpha: 0, filter: "blur(10px)", ease: "power1.in", duration: 0.09 },
          0.16
        )

        // 2 · the mesh zooms. Less far than the photo went: a canvas
        //     magnified past ~2× is visibly resampled, and the graph already
        //     gains depth from its own perspective divide.
        .to(q("[data-hero='art']"), { scale: 2.05, ease: "power1.in", duration: 0.4 }, 0)
        .to(q("[data-hero='scrim']"), { autoAlpha: 0, ease: "none", duration: 0.16 }, 0.06)

        /* 3 · the dissolve — phones only.

           On desktop the white sheet is the handover, and an iris filling
           with sand underneath a rising white sheet showed as a band of the
           wrong colour above it. The element is `lg:hidden`, so this tween
           has nothing to do there; below `lg` it is still the whole exit. */
        .fromTo(
          q("[data-hero='iris']"),
          { autoAlpha: 0, scale: 0.05 },
          { autoAlpha: 1, scale: 1, ease: "power2.in", duration: 0.58 },
          0.42
        )

        /* ---------------------------------------------------------------
           4 · the white intermission

           A sheet rises from the bottom edge and takes the screen. The rider
           comes in through the left edge while it is still rising, and the
           vision follows him through as a train of cards.

           Desktop only. The sheet is `hidden lg:block`: there is no room to
           run a 2500px train across a 390px screen, and a train that shows
           one card at a time is a slideshow.
           --------------------------------------------------------------- */
        .to(
          q("[data-hero='sheet']"),
          { yPercent: 0, ease: EASE.inOut3, duration: 0.28 },
          0.3
        )

        /* The convoy sets off at 0.44 — exactly half way through the sheet's
           rise, so the rider enters the left edge onto a screen that is still
           moving rather than onto a finished blank one.

           Rider and cards are one element. They were separate before, which
           is why the rider sat still in the middle while the cards flew past
           him: two tweens, two clocks, no relationship. One element means the
           cards trail him because they are physically behind him, not because
           a second tween was told to look like it.

           It runs the whole way out, and the duration is what synchronises it
           with the band climbing over it.

           0.44 + 0.75 × 0.49 ≈ 0.81, which is exactly where the film band's
           overlap begins. So the last card reaches the middle of the screen
           on the same frame the next section starts rising, and from there
           both keep going — the card carries on to the right edge underneath
           while the band climbs over it. Ending the travel early instead left
           the train parked mid-screen for the last fifth of the runway.

           Both ends are functions of the viewport; `ease: "none"` because a
           vehicle under scroll control should track the scroll exactly, and
           easing reads as wheelspin. */
        .fromTo(
          q("[data-hero='convoy']"),
          { x: () => -(CONVOY_LEAD + window.innerWidth / 2) },
          {
            x: () => CONVOY_HALF + window.innerWidth / 2,
            ease: "none",
            duration: 0.49,
          },
          0.44
        );

      /* The sheet is never lifted by a tween, and that is the point.

         It used to animate to `yPercent: -100` over the last tenth of the
         runway. What that uncovered was not the next section — it was the
         hero's own background, still sitting under the sheet, for the whole
         length of the lift. That was the blank screen after the cards.

         The sheet now simply stays. When the runway runs out, the sticky
         stage stops sticking and the whole hero — sheet included — scrolls
         away under the page's own scroll, with the film section coming up
         directly behind it. One less tween, and no gap that a tween could
         accidentally open. */

      return () => {
        tl.kill();
        exit.scrollTrigger?.kill();
        exit.kill();
        exitRef.current = null;
        sweptRef.current = false;
      };
    },
    { scope: root, dependencies: [ready, addLineSweep] }
  );

  return (
    <section
      ref={root}
      data-scene="ink"
      style={sceneVars("ink")}
      className="relative bg-bg text-fg"
    >
      {/*
        The runway — its height is the length of the exit sequence, and
        nothing more. Every extra viewport here is scroll the reader spends
        looking at a finished animation.

        Desktop gets nearly twice the length because the white intermission
        happens inside it: the sheet has to rise, the whole card train has to
        pass, and the sheet has to leave. Phones never run that, so their
        runway stays at the length of the original dissolve.
      */}
      <div ref={runway} className="relative h-[168vh] lg:h-[520vh]">
        {/* the stage — held by sticky, never re-laid-out */}
        <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
          {/* ---------- artwork ---------- */}
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            {/* the ink floor the graph is drawn on */}
            <div className="absolute inset-0 bg-[#07090d]" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 58% 62% at 62% 48%, rgba(244,102,31,0.20), transparent 70%), radial-gradient(ellipse 40% 45% at 78% 78%, rgba(91,217,203,0.10), transparent 72%)",
              }}
            />
            <div className="bg-grid absolute inset-0 opacity-40" />

            <div
              data-hero="art"
              className="absolute inset-0 will-change-transform"
            >
              <RoutingMesh
                className="absolute inset-0 h-full w-full"
                originX={0.63}
                originY={0.47}
              />
            </div>

            {/*
              Readability. The mesh is bright and additive, so the copy column
              still needs a floor under it — but far less of one than the
              photograph needed. The gradient clears by the middle of the
              frame, which is where the graph is densest and should be seen.
            */}
            <div
              data-hero="scrim"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(7,9,13,0.9) 0%, rgba(7,9,13,0.82) 26%, rgba(7,9,13,0.5) 42%, rgba(7,9,13,0.16) 56%, transparent 70%), linear-gradient(180deg, rgba(7,9,13,0.5) 0%, transparent 26%, transparent 72%, rgba(7,9,13,0.7) 100%)",
              }}
            />

            {/* the dissolve the next section emerges from */}
            <div
              data-hero="iris"
              /* Phones only. On desktop the white sheet is the handover, and
                 an iris filling with sand under a rising white sheet showed
                 as a band of the wrong colour above it. */
              className="absolute left-1/2 top-1/2 aspect-square w-[260vmax] -translate-x-1/2 -translate-y-1/2 rounded-full lg:hidden"
              style={{
                opacity: 0,
                background: `radial-gradient(closest-side, ${NEXT_SCENE_BG} 55%, ${NEXT_SCENE_BG}e6 72%, transparent 88%)`,
              }}
            />

            {/*
              The white intermission.

              A sheet, not an overlay: it is opaque and it arrives by moving,
              which is what makes it read as a scene change rather than a
              fade. It sits above the artwork and above the dissolve, so on
              desktop it is what the reader sees for the whole middle of the
              exit; on phones it never renders and the dissolve underneath is
              still the handover.
            */}
            <div
              data-hero="sheet"
              /*
                Hidden until hydration, with `visibility` — never with a
                transform.

                Server-rendered markup has no GSAP in it, so until hydration
                fires the `gsap.set` above, the sheet sits at its natural
                position: `inset-0`, opaque, covering the whole hero. That is
                the second of white intermission every reload used to show.

                The first attempt at this seeded `translate3d(0,100%,0)`
                inline, which broke the band outright. GSAP reads an existing
                transform back from the *computed* style, where a percentage
                has already been resolved to pixels — so it recorded `y: 800px`
                and then added `yPercent: 100` on top. The sheet ended up two
                screens down and never came back.

                `visibility` is not part of the transform, so there is nothing
                to double-count. GSAP switches it on in the same set that parks
                the sheet, and both land before the first post-hydration paint.
              */
              className="invisible absolute inset-0 z-20 hidden overflow-hidden bg-[#efece4] will-change-transform lg:block"
            >
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(36,29,24,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(36,29,24,0.045) 1px, transparent 1px)",
                  backgroundSize: "76px 76px",
                }}
              />
              {/* the road the rider is on */}
              <div className="absolute inset-x-0 top-[68%] h-px bg-[linear-gradient(90deg,transparent,rgba(36,29,24,0.18)_12%,rgba(36,29,24,0.18)_88%,transparent)]" />

              {/*
                The convoy — rider and cards in one row, one element, one
                tween. Centred with a negative margin rather than a transform,
                because GSAP owns `x` here and a Tailwind `-translate-x-1/2`
                would be wiped the moment the first tween ran.

                Reading order left to right is 03, 02, 01, the statement, then
                the rider: so on screen the rider arrives first and the cards
                come through behind him in order.
              */}
              <div
                data-hero="convoy"
                className="absolute left-1/2 top-1/2 flex -translate-y-1/2 items-center gap-[150px] will-change-transform"
                style={{ width: CONVOY_HALF * 2, marginLeft: -CONVOY_HALF }}
              >
                {[...VISION_CARDS].reverse().map((c) => (
                  <div
                    key={c.title}
                    className={cn(
                      "shrink-0 rounded-[26px] border border-[#241d18]/10 bg-white shadow-[0_26px_70px_-28px_rgba(36,29,24,0.42)]",
                      c.lead ? "w-[430px] px-9 py-8" : "w-[310px] px-8 py-7"
                    )}
                  >
                    {/* a rule rather than a filled chip: on a light card a
                        block of colour competes with the words on it */}
                    <span
                      aria-hidden
                      className={cn(
                        "block h-[3px] rounded-full bg-[#e04e0f]",
                        c.lead ? "w-14" : "w-8"
                      )}
                    />
                    <span className="mt-5 block font-mono text-2xs font-semibold uppercase tracking-[0.2em] text-[#b93a0f]">
                      {c.eyebrow}
                    </span>
                    <p
                      className={cn(
                        "mt-3 font-semibold leading-[1.16] tracking-[-0.02em] text-[#1b1713]",
                        c.lead ? "text-[1.9rem]" : "text-[1.15rem]"
                      )}
                    >
                      {c.title}
                    </p>
                  </div>
                ))}

                {/*
                  The rider, at the head of the convoy. Two nested elements on
                  purpose: the row carries the scroll-driven travel, the inner
                  one carries the idle bob, and keeping them apart means
                  neither tween ever clobbers the other's transform.
                */}
                <div className="relative z-10 -ml-[40px] size-[34rem] shrink-0">
                  <div data-hero="bob" className="size-full">
                    {/* mirrored — the source art faces left */}
                    <Image
                      src={scooty}
                      alt=""
                      sizes="544px"
                      quality={78}
                      className="h-full w-full -scale-x-100 object-contain drop-shadow-[0_36px_50px_rgba(36,29,24,0.28)]"
                    />
                  </div>
                </div>

                {/*
                  The statement, riding at the head of the convoy.

                  It sits to the *right* of the rider, which is what puts it
                  first: the row travels left to right, so its rightmost
                  element is the one that comes through the left edge of the
                  frame first. The reader gets the words, then the rider, then
                  the cards he is pulling.

                  Sized against the rider rather than in absolute units — half
                  its 34rem, so the two stay in proportion at any zoom.

                  The depth is stacked `text-shadow`s, not a filter or an SVG.
                  Eight one-pixel offsets darkening as they recede build the
                  extruded face, and a single soft shadow underneath sits it on
                  the sheet. It costs one paint, scales cleanly, and stays
                  selectable text — a rasterised 3D word would do none of that.
                */}
                <div
                  aria-hidden
                  className="-ml-[3rem] shrink-0 pb-[6rem] leading-[0.82]"
                  style={{
                    color: "#7c3aed",
                    textShadow: [
                      "1px 1px 0 #6d28d9",
                      "2px 2px 0 #6423cf",
                      "3px 3px 0 #5b21b6",
                      "4px 4px 0 #501c9e",
                      "5px 5px 0 #451787",
                      "6px 6px 0 #3b1370",
                      "7px 7px 0 #310f5b",
                      "8px 8px 0 #280c49",
                      "14px 20px 26px rgba(40,12,73,0.28)",
                    ].join(", "),
                  }}
                >
                  <span className="block text-[8.5rem] font-black tracking-[-0.045em]">
                    OUR
                  </span>
                  <span className="block text-[8.5rem] font-black tracking-[-0.045em]">
                    VISION
                  </span>
                </div>
              </div>
            </div>
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
                /* No idle wave here. `mask: "lines"` gives each line an
                   overflow-clipped box, so nudging the words inside it up and
                   down crops them against that box — which reads as the lines
                   shrinking, not breathing. The life in this hero comes from
                   the mesh behind it instead. */
                onReady={addLineSweep}
                delay={0.3}
                className="mt-8 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.04em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)] sm:text-[3.4rem] lg:text-[4.4rem]"
              />

              <p
                data-hero="lede"
                className="mt-7 max-w-xl text-base leading-relaxed text-white/75 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)] md:text-lg"
              >
                Adloggs, Shiprocket Quick, Flash by Shadowfax, Pidge, Quicka,
                Qwqer, Ek Bharath, Pro Routing and ONDC — carrying Ola and
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
