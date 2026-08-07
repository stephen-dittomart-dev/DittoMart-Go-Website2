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
 * The two fixed points of the crossing, as timeline positions.
 *
 * `CLIMB` is where the film band's overlap begins — one viewport before the
 * end of a 520vh runway. Three things are made to coincide there: the tail
 * line lands dead centre, the last card meets the box, and the next band
 * starts rising. Everything else about the train is solved backwards from it.
 *
 * There are no geometry constants any more. The old pair described a single
 * flex row whose declared width had to be kept in step by hand every time an
 * item was added or resized — which it was not, twice. Positions are measured
 * from the DOM instead, so the layout is the single source of truth.
 */
const CLIMB = 0.872;
const TRAIN_IN = 0.333;

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
    const at = [0, 0.033, 0.073];
    const dur = [0.033, 0.047, 0.047];
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
      // Parked far off the left edge from the first frame, for the same
      // reason the sheet is: server HTML has no GSAP in it.
      gsap.set(q("[data-hero='rider']"), { x: -3000 });
      gsap.set(q("[data-hero='train']"), { x: -8000 });

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
        .to(q("[data-hero='cue']"), { autoAlpha: 0, ease: "none", duration: 0.067 }, 0)

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
          { autoAlpha: 0, filter: "blur(10px)", ease: "power1.in", duration: 0.06 },
          0.107
        )

        // 2 · the mesh zooms. Less far than the photo went: a canvas
        //     magnified past ~2× is visibly resampled, and the graph already
        //     gains depth from its own perspective divide.
        .to(q("[data-hero='art']"), { scale: 2.05, ease: "power1.in", duration: 0.267 }, 0)
        .to(q("[data-hero='scrim']"), { autoAlpha: 0, ease: "none", duration: 0.107 }, 0.04)

        /* 3 · the dissolve — phones only.

           On desktop the white sheet is the handover, and an iris filling
           with sand underneath a rising white sheet showed as a band of the
           wrong colour above it. The element is `lg:hidden`, so this tween
           has nothing to do there; below `lg` it is still the whole exit. */
        .fromTo(
          q("[data-hero='iris']"),
          { autoAlpha: 0, scale: 0.05 },
          { autoAlpha: 1, scale: 1, ease: "power2.in", duration: 0.7 },
          0.3
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
          { yPercent: 0, ease: EASE.inOut3, duration: 0.187 },
          0.2
        )

        /* ---------------------------------------------------------------
           5 · the crossing, in three parts

           The wordmark sweeps through and leaves. The rider follows, reaches
           the right edge and stops. The train keeps coming, and each card is
           folded into the box on his back as it arrives.

           Everything below is measured, not written. Three things have to
           land on the same frame — the tail line dead centre, the last card
           meeting the box, and the film band starting its climb — and the
           only way to guarantee that is to solve for it rather than to tune
           three numbers until they look close.

           The travel is linear, so the position of the train at any point in
           the timeline is a straight line and can be inverted: given where a
           card must be, we can say exactly when. `CLIMB` is where the film
           band's overlap begins; everything else is derived from it.
           --------------------------------------------------------------- */
        .add(() => {}, 0.44);

      const rider = q("[data-hero='rider']")[0];
      const train = q("[data-hero='train']")[0];
      const tail = q("[data-tail]")[0];
      const cards = q("[data-card]");

      if (rider && train && tail && cards.length) {
        const W = window.innerWidth;
        const riderW = rider.offsetWidth;

        /* The mouth of the pannier, as a fraction of the rider's width.

           The art is mirrored, so the box that was on the right of the
           photograph is on the left of what the reader sees. Its near edge —
           the one a card would be posted through — sits about a fifth in. That
           edge is the slot: everything a card does is measured from it. */
        const SLOT_IN = riderW * 0.2;

        const centreOf = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2;
        const first = cards[0] as HTMLElement;

        /* The gap between the closing line and the last card is computed, not
           written.

           It is the one number that decides where the rider can park. Three
           things must land on the same frame — the line dead centre, the last
           card meeting the box, the film band starting its climb — and that is
           only true if the box sits as far right of centre as the last card
           sits ahead of the line. Fix the gap in CSS and the rider has to park
           wherever that happens to put him, which is what left a wide margin
           down the right of the frame.

           So it is solved the other way round: decide the rider belongs near
           the edge, and derive the gap that puts him there. On a wide monitor
           that opens a generous run between the last card and the line; on a
           narrow one the floor keeps it from collapsing, and the rider parks a
           little further in instead. */
        const rightOf = (el: HTMLElement) => el.offsetLeft + el.offsetWidth;

        /* The rider parks near the right edge — chosen, not derived. */
        const riderParked = 0.96 * W - riderW;
        const slotAt = riderParked + SLOT_IN;

        /* The gap between the last card and the closing line is solved, not
           picked.

           What has to be true: the moment the last card has *finished* going
           in — its left edge past the slot — is the moment the line reaches
           the middle of the frame. The line sits behind the card by the gap,
           so that condition fixes the gap exactly:

               gap = slot − centre − half the line's width

           Which on a wide monitor opens a long, deliberately empty run
           between the last card and the line, and on a narrow one a shorter
           one — in both cases exactly as long as it needs to be. Picking a
           number instead is what left the line arriving while the card was
           still being posted. */
        first.style.marginLeft = `${Math.max(
          120,
          Math.round(slotAt - W / 2 - tail.offsetWidth / 2)
        )}px`;

        const cTail = centreOf(tail);

        /* The train's travel. `x0` puts every item off the left edge;
           `xAtClimb` is where it must be at CLIMB for the closing line to be
           centred. `x1` keeps that same straight line running to the end of
           the runway, so nothing freezes once the band is over it. */
        const x0 = -train.scrollWidth;
        const xAtClimb = W / 2 - cTail;
        const span = (CLIMB - TRAIN_IN) / (1 - TRAIN_IN);
        const x1 = x0 + (xAtClimb - x0) / span;

        const RIDE_IN = 0.307;
        const RIDE_DUR = 0.2;

        exit
          // the rider — wordmark and all — in, and then not moved again until
          // the very end
          .fromTo(
            rider,
            { x: -(riderW + 60) },
            { x: riderParked, ease: "power2.out", duration: RIDE_DUR },
            RIDE_IN
          )
          // the train: one straight line the whole way
          .fromTo(
            train,
            { x: x0 },
            { x: x1, ease: "none", duration: 1 - TRAIN_IN },
            TRAIN_IN
          );

        /* Each card is posted through the slot.

           The card is not scaled away and not rotated. It is *clipped* — its
           right edge onward is hidden — and the clip is pinned to the slot, so
           what the reader sees is a card sliding into a letterbox while the
           rest of it is still outside. Nothing about the card changes; only
           how much of it is still in the world.

           That is why it is exact rather than eased. The train travels at a
           constant rate, so the moment a card's right edge crosses the slot
           and the moment its left edge does are both solvable, and between
           them the hidden fraction is precisely the fraction that has passed:

               t_in   → right edge at the slot → inset(0 0% 0 0)
               t_out  → left edge at the slot  → inset(0 100% 0 0)

           Linear in between, so the boundary never drifts off the slot by a
           pixel at any scroll position. An eased clip would slide the seam
           around and give the illusion away instantly.

           The small \`scaleX\` is the only liberty: anchored at the left edge it
           squeezes the card by six per cent as it goes in, which is what makes
           it read as being pressed through an opening rather than merely
           passing behind something. Six per cent is small enough that the seam
           stays on the slot, and the rider's artwork covers that region in any
           case — he is \`z-30\`, the train is \`z-10\`.

           Solved per card, not staggered by a fixed interval: the gaps in the
           row are not equal, so an even stagger would post some of them into
           thin air. */
        const timeAt = (trainX: number) =>
          TRAIN_IN + (1 - TRAIN_IN) * ((trainX - x0) / (x1 - x0));

        cards.forEach((card) => {
          const el = card as HTMLElement;
          const tIn = timeAt(slotAt - rightOf(el));
          const tOut = timeAt(slotAt - el.offsetLeft);

          exit.fromTo(
            el,
            { clipPath: "inset(0% 0% 0% 0%)", scaleX: 1 },
            {
              clipPath: "inset(0% 100% 0% 0%)",
              scaleX: 0.94,
              transformOrigin: "0% 50%",
              ease: "none",
              duration: Math.max(0.01, tOut - tIn),
            },
            tIn
          );
        });

        /* He sets off again on the frame the last card finishes going in.

           That is `CLIMB` — the same instant the closing line lands in the
           middle and the film band starts its climb, because the gap above was
           solved to make all three the same moment. Nothing here is timed
           against anything else; they are one number.

           This is the only tween that touches him after he parks, which is why
           he is genuinely stationary in between rather than being animated to
           hold still. */
        exit.to(
          rider,
          { x: W + riderW + 40, ease: "power1.in", duration: 0.12 },
          CLIMB
        );
      }

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
      <div ref={runway} className="relative h-[168vh] lg:h-[780vh]">
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
                background: [
                  /* 1 · a warm lift low on the left, so the column has a
                        light source instead of being an even slab */
                  "radial-gradient(ellipse 62% 78% at 6% 82%, rgba(224,78,15,0.16), transparent 68%)",
                  /* 2 · a crimson bloom high on the left, the logo's other
                        colour, kept far enough from the copy to stay behind it */
                  "radial-gradient(ellipse 46% 52% at 2% 12%, rgba(180,22,27,0.20), transparent 70%)",
                  /* 3 · the column itself — warm near-black rather than the
                        neutral one it was, so it belongs to the same page as
                        the ember in the graph beside it */
                  "linear-gradient(94deg, rgba(21,10,13,0.95) 0%, rgba(24,12,15,0.9) 24%, rgba(23,12,16,0.7) 40%, rgba(20,10,14,0.3) 54%, transparent 70%)",
                  /* 4 · top and bottom, so the copy never runs into an edge */
                  "linear-gradient(180deg, rgba(10,6,8,0.55) 0%, transparent 26%, transparent 70%, rgba(10,6,8,0.72) 100%)",
                ].join(", "),
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
                Three actors, layered.

                `z-30` on the rider, `z-10` on the train: the cards have to
                disappear *behind* him, and a card that vanishes in front of
                the box it is supposed to be entering reads as a card being
                deleted. Stacking order is the whole difference.

                They used to be a single flex row translated as a unit, which
                is why the rider could never stop: anything that halted him
                halted the cards behind him too. Splitting them lets the rider
                arrive, park at the right edge and stay there while the train
                keeps feeding cards into the box on his back.

                Positions and travel are measured after mount rather than
                written here, because three separate things have to coincide on
                one frame — the tail line centred, the last card meeting the
                box, and the next band starting its climb. That is arithmetic,
                not a set of numbers to guess at. See the timeline above.
              */}

              {/*
                The rider. Enters from the left, parks near the right edge, and
                is never tweened again until the very end — which is what makes
                him stop. The bob is a nested element so the scroll tween and
                the idle tween never share a transform.
              */}
              <div
                data-hero="rider"
                className="absolute left-0 top-1/2 z-30 w-[22rem] -translate-y-1/2 will-change-transform xl:w-[26rem] 2xl:w-[30rem]"
              >
                {/*
                  The wordmark, carried by him rather than chasing him.

                  It had its own tween before, and two tweens moving two things
                  along the same path is a promise the easing cannot keep: his
                  arrival decelerates, its pass does not, so it slipped behind
                  his shoulder and then pulled ahead again as the two curves
                  crossed. Attached at `left-full` there is no relative motion
                  to get wrong — it is exactly one rider-length in front of him
                  at every scroll position, by construction.

                  He parks near the right edge, so being in front of him means
                  being off the right of the frame by then. That is the whole
                  arc: it leads him in, and it is gone by the time he stops.
                */}
                <div
                  aria-hidden
                  className="absolute left-full top-1/2 ml-14 w-max -translate-y-1/2 leading-[0.82]"
                >
                <span className="relative block">
                  {/*
                    Two stacked copies, not one element.

                    The face is a gradient, which needs `background-clip: text`
                    and a transparent fill — and a transparent fill is exactly
                    what would swallow a `text-shadow` extrusion. So the depth
                    is its own layer underneath, in the darkest red of the ramp,
                    and the gradient sits on top of it. Eight one-pixel offsets
                    build the extruded body; one soft shadow sets it on the
                    sheet.

                    The ramp is the wordmark's own two colours — the crimson of
                    DITTO into the ember of MART — run across both words rather
                    than one colour per word, so it reads as a single object
                    lit from one side.
                  */}
                  <span
                    aria-hidden
                    className="absolute inset-0 block whitespace-pre text-[7.5rem] font-black tracking-[-0.045em]"
                    style={{
                      color: "#7d1a14",
                      textShadow: [
                        "1px 1px 0 #74170f",
                        "2px 2px 0 #6a140d",
                        "3px 3px 0 #5f110b",
                        "4px 4px 0 #540e09",
                        "5px 5px 0 #490b07",
                        "6px 6px 0 #3e0905",
                        "7px 7px 0 #330704",
                        "8px 8px 0 #290503",
                        "14px 20px 26px rgba(41,5,3,0.3)",
                      ].join(", "),
                    }}
                  >
                    {"OUR\nVISION"}
                  </span>
                  <span
                    className="relative block whitespace-pre text-[7.5rem] font-black tracking-[-0.045em]"
                    style={{
                      backgroundImage:
                        "linear-gradient(104deg, #ee4a3f 0%, #e04e0f 38%, #f4661f 68%, #fb8038 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {"OUR\nVISION"}
                  </span>
                </span>
                </div>

                <div data-hero="bob" className="w-full">
                  {/* mirrored — the source art faces left */}
                  <Image
                    src={scooty}
                    alt=""
                    sizes="(max-width: 1279px) 416px, (max-width: 1535px) 480px, 544px"
                    quality={78}
                    className="h-auto w-full -scale-x-100 object-contain drop-shadow-[0_36px_50px_rgba(36,29,24,0.28)]"
                  />
                </div>
              </div>

              {/*
                The train. Reading order left to right is the tail line, then
                the cards in reverse — so on screen the lead card arrives at the
                box first and the tail line is the last thing through.

                `perspective` here rather than on each card, so the twist as a
                card folds into the box is a real rotation in one shared space.
              */}
              <div
                data-hero="train"
                className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center will-change-transform"
              >
                {/*
                  The closing line. Narrow on purpose: its width sets how far
                  right of centre the rider has to park, and a wide one pushes
                  him off the edge of a 1280px desktop.
                */}
                <div data-tail className="w-[17rem] shrink-0 text-right">
                  <span
                    aria-hidden
                    className="ml-auto block h-[3px] w-16 rounded-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #ee4a3f, #fb8038)",
                    }}
                  />
                  <span className="mt-4 block font-mono text-2xs font-semibold uppercase tracking-[0.22em] text-[#b93a0f]">
                    And then
                  </span>
                  <p
                    className="mt-3 text-[2.1rem] font-black leading-[1.06] tracking-[-0.03em]"
                    style={{
                      backgroundImage:
                        "linear-gradient(102deg, #ee4a3f 0%, #e04e0f 46%, #fb8038 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    Turning Vision into Reality
                  </p>
                </div>

                {[...VISION_CARDS].reverse().map((c) => (
                  <div
                    key={c.title}
                    data-card
                    className={cn(
                      "ml-[20rem] shrink-0 rounded-[26px] border border-[#241d18]/10 bg-white shadow-[0_26px_70px_-28px_rgba(36,29,24,0.42)] first:ml-8",
                      c.lead ? "w-[430px] px-9 py-8" : "w-[330px] px-8 py-7"
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
              </div>
            </div>
          </div>

          {/* ---------- copy ---------- */}
          <div className="container-page relative w-full">
            {/*
              The column is wider than it was and no longer hard against the
              container's left padding.

              At `max-w-2xl` starting at the gutter it sat in the outer eighth
              of a wide monitor and read as pinned to the edge rather than
              placed. A third of a screen in from the left, up to `3xl`, still
              clears the graph — the scrim behind it does not fade out until
              70% across, and the mesh's own centre is at 63%.
            */}
            <div
              data-hero="copy"
              className="max-w-3xl lg:ml-[3vw] xl:ml-[5vw]"
            >
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
                className="mt-7 max-w-2xl text-base leading-relaxed text-white/82 [text-shadow:0_1px_14px_rgba(0,0,0,0.7)] md:text-lg"
              >
                Adloggs, Shiprocket Quick, Flash by Shadowfax, Pidge, Quicka,
                Qwqer, Ek Bharath, Pro Routing and ONDC — carrying Ola and
                Rapido. Nine networks, one API call. The money moves with it. 
                Top up your wallet by UPI, Razorpay
                or PhonePe; every order deducts at your contracted rate before a rider is ever called.
                Monthly GST invoice raised automatically, weekly NEFT settlement, and no receivables to chase.
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
                className="mt-7 font-mono text-2xs uppercase tracking-[0.16em] text-white/60"
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
