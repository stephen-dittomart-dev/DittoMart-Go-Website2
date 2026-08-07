"use client";

import { useGSAP } from "@gsap/react";
import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { networkMarks } from "@/lib/network-marks";
import { providers } from "@/lib/providers";
import { sceneVars } from "@/lib/scenes";
import { cn } from "@/lib/utils";

/**
 * The nine networks.
 *
 * A carton sits at the bottom of the frame. Its flaps open, and one by one
 * each network's mark is thrown out of it, arcs over like a palm frond
 * bending under its own weight, and lands on alternating sides — left, right,
 * left — building two leaning stacks while the name in the middle changes.
 *
 * Five decisions worth recording:
 *
 *  · Held on a CSS `sticky` runway, not a GSAP `pin`. A pin injects a spacer
 *    and rewrites the section's box, which is what threw the page dimensions
 *    out twice before. Sticky is measured by the browser and cannot surprise
 *    the layout — and it is the same mechanism on mobile, so there is one
 *    behaviour to reason about rather than two.
 *
 *  · The box is built, not drawn. It is real CSS 3D — a lid plane laid back
 *    in perspective with four flaps hinged on its edges — because a picture
 *    of a box cannot open, and an SVG one only fakes opening in two
 *    dimensions, which reads as flat next to marks flying in perspective.
 *
 *  · The arc is a genuine parabola in two tweens: up decelerating, over, down
 *    accelerating. A single tween to the resting spot travels in a straight
 *    line however it is eased, and reads as a slide rather than a throw.
 *
 *  · Every distance is `vw`/`vh`, never pixels, so the flight lands in the
 *    same relationship to the frame on a 13" laptop and a 32" monitor and
 *    survives a resize without recomputing a tween.
 *
 *  · Below `lg` the marks and the box are not rendered at all. Nine cards
 *    crossing a 390px frame is illegible at any speed; there the runway just
 *    steps the copy through the nine names.
 */

/**
 * In provider order, resolved by id from the shared map.
 *
 * Derived rather than hand-listed: a parallel array quietly pairs the wrong
 * logo with the wrong network the first time anyone reorders `providers`,
 * and nothing about the page would look broken enough to notice.
 */
const MARKS: StaticImageData[] = providers.map((p) => networkMarks[p.id]);

/* --------------------------------------------------------------------------
   Timeline shape, in abstract units. The scrub maps the whole thing across
   the runway, so these are ratios rather than seconds — but keeping them as
   named numbers means the copy index below can be derived from the same
   arithmetic the tweens use, instead of being guessed at separately.
   -------------------------------------------------------------------------- */
/**
 * How long the carton takes to arrive and open before anything is thrown.
 * The box fades in over the first half-unit, the flaps swing over the next,
 * and only then does the first mark leave.
 */
const OPEN = 1.7;
/** Gap between one mark launching and the next. */
const STEP = 0.92;
/** Launch → apex → land → settle, for one mark. */
const FLIGHT = 1.5;
/** The carton shutting again once the last mark has landed. */
const CLOSE = 1;
/**
 * Dead scroll at the very end, and it is load-bearing.
 *
 * The band after this one is pulled up a viewport so it can climb over the
 * held burst — which means it starts covering the frame a viewport before the
 * runway ends. Without a tail, that viewport was the last mark still in
 * flight: ONDC was thrown, and the next screen began rising over it before it
 * had landed.
 *
 * 2.4 units against a 700vh runway is very close to that one viewport, so the
 * climb now happens entirely after the ninth mark has settled and the carton
 * has shut.
 */
const TAIL = 2.4;
/** When the last mark has finished flying — where the closing begins. */
const EMPTY = OPEN + (MARKS.length - 1) * STEP + FLIGHT;
const TOTAL = EMPTY + CLOSE + TAIL;

/**
 * Where mark `i` comes to rest, and how it gets there.
 *
 * Sides alternate, so `k` counts how many are already resting on this side.
 * Each new arrival lands further out and higher, which is what turns a
 * pile-up into a stack you can still read.
 *
 * The resting spots were pushed well away from the carton after the first
 * pass landed everything on top of it — a mark that stops a hand's width from
 * where it launched does not read as having been thrown.
 */
function flight(i: number) {
  const side = i % 2 === 0 ? -1 : 1;
  const k = Math.floor(i / 2);
  return {
    side,
    /** apex of the arc, above the launch point */
    peak: -(44 - k * 1.4),
    restX: side * (32 + k * 2.6),
    restY: -(3 + k * 4.2),
    /** the lean it keeps once it has settled */
    rest: side * (7 + k * 1.7),
  };
}

export function NetworkBurst() {
  const root = useRef<HTMLElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      const track = runway.current;
      if (!el || !track) return;
      const q = gsap.utils.selector(el);

      const reduced = prefersReducedMotion();
      const small = window.innerWidth < 1024;

      /* ---------- the copy steps through the nine, everywhere ---------- */
      const stepper = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            // Derived from the same constants the tweens use, so the name in
            // the middle changes on the frame its mark leaves the box rather
            // than on some separately-tuned fraction of the scroll.
            const u = small || reduced ? self.progress * MARKS.length : (self.progress * TOTAL - OPEN) / STEP;
            setActive(gsap.utils.clamp(0, MARKS.length - 1, Math.floor(u)));
          },
        },
      });

      if (reduced || small) return () => stepper.scrollTrigger?.kill();

      const plates = gsap.utils.toArray<HTMLElement>("[data-mark]", el);
      gsap.set(plates, { autoAlpha: 0, scale: 0.42, x: 0, y: 0, rotate: 0 });
      // Nothing of the carton exists on screen until the section owns it.
      gsap.set(q("[data-box]"), { autoAlpha: 0, y: "7vh", scale: 0.88 });

      /* ---------- the throw ----------
         `scrub: 1.1` rather than a snappier number. The brief was butter, and
         the smoothness of a scroll-linked animation is set almost entirely by
         how much lag the scrub carries: it is what turns the reader's
         discrete wheel notches into one continuous motion. */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
        },
      });

      /* The carton arrives only once the section fills the frame — this is
         position 0 of a timeline that starts at `top top`. */
      tl.to(
        q("[data-box]"),
        { autoAlpha: 1, y: 0, scale: 1, ease: "power2.out", duration: 0.5 },
        0
      );

      /* The flaps — two, hinged left and right.

         Two rounds of getting the axis wrong here, both worth recording.

         First: `rotate`, which GSAP maps to `rotationZ`. The flaps spun in
         the plane of the lid like propeller blades instead of swinging out
         of it.

         Then `rotationY`, but with the signs inverted — which is what made
         them fold *into* the carton. In the lid plane's local space, a
         positive `rotateY` carries +X toward −Z, and −Z is down into the box.
         The left flap's body extends in +X from its hinge, so it needs a
         negative rotation to lift; the right flap's body extends in −X, so it
         needs a positive one. Getting that backwards is the difference
         between a box opening and a box swallowing itself.

         Past square (124°) because a real flap falls open under its own
         weight rather than stopping upright, and the two are offset slightly
         so they do not move as one lid. */
      const OPEN_L = -124;
      const OPEN_R = 124;

      tl.to(
        q("[data-flap='left']"),
        { rotationY: OPEN_L, ease: "power2.inOut", duration: 0.72 },
        0.5
      )
        .to(
          q("[data-flap='right']"),
          { rotationY: OPEN_R, ease: "power2.inOut", duration: 0.72 },
          0.58
        )
        .to(q("[data-glow]"), { autoAlpha: 1, ease: "none", duration: 0.5 }, 0.9);

      plates.forEach((plate, i) => {
        const f = flight(i);
        const at = OPEN + i * STEP;

        tl
          /* up, decelerating. It starts turning the moment it leaves, which
             is what gives the arc its palm-frond bend rather than a lob. */
          .to(
            plate,
            {
              autoAlpha: 1,
              x: `${f.restX * 0.42}vw`,
              y: `${f.peak}vh`,
              rotate: f.side * 26,
              scale: 1.04,
              ease: "power2.out",
              duration: 0.72,
            },
            at
          )
          // over the top and down, accelerating
          .to(
            plate,
            {
              x: `${f.restX}vw`,
              y: `${f.restY + 2.5}vh`,
              rotate: f.side * 15,
              scale: 1,
              ease: "power2.in",
              duration: 0.5,
            },
            at + 0.72
          )
          /* the landing. `power3.out` and no overshoot — a `back` ease here
             snaps, and one snap in nine is all it takes to lose the butter. */
          .to(
            plate,
            {
              y: `${f.restY}vh`,
              rotate: f.rest,
              ease: "power3.out",
              duration: 0.28,
            },
            at + 1.22
          )
          // the carton kicks as each one leaves
          .to(
            q("[data-carton]"),
            {
              keyframes: [
                { scaleY: 0.955, scaleX: 1.03, duration: 0.12 },
                { scaleY: 1, scaleX: 1, duration: 0.3, ease: "power2.out" },
              ],
              ease: "power2.out",
            },
            at
          );
      });

      /* ---------- and it shuts again ----------
         The glow goes out first — the carton is empty before it is closed —
         then the flaps fold back, right before left, mirroring the order they
         opened in. The last thing that moves is the carton settling, which
         gives the section a full stop instead of just running out of scroll
         with the box hanging open. */
      tl.to(q("[data-glow]"), { autoAlpha: 0, ease: "none", duration: 0.28 }, EMPTY)
        .to(
          q("[data-flap='right']"),
          { rotationY: 0, ease: "power2.inOut", duration: 0.62 },
          EMPTY + 0.14
        )
        .to(
          q("[data-flap='left']"),
          { rotationY: 0, ease: "power2.inOut", duration: 0.62 },
          EMPTY + 0.24
        )
        .to(
          q("[data-carton]"),
          {
            keyframes: [
              { scaleY: 0.97, scaleX: 1.02, duration: 0.14 },
              { scaleY: 1, scaleX: 1, duration: 0.26, ease: "power2.out" },
            ],
          },
          EMPTY + 0.78
        );

      return () => {
        stepper.scrollTrigger?.kill();
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
      data-scene="ink"
      style={sceneVars("ink")}
      className="relative isolate scroll-mt-24 bg-bg text-fg"
    >
      <div ref={runway} className="relative h-[360vh] lg:h-[700vh]">
        <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
          {/* wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 50% 50%, var(--spot-1), transparent 70%)",
            }}
          />
          <div aria-hidden className="bg-grid absolute inset-0 opacity-40" />
          <WaveField />

          {/* ---------- the carton and the marks ---------- */}
          <div aria-hidden className="absolute inset-0 hidden lg:block">
            <Carton />

            {MARKS.map((src, i) => (
              <div
                key={providers[i]?.id ?? i}
                data-mark
                style={{ zIndex: 10 + i }}
                className="absolute bottom-[13%] left-1/2 -ml-[7.5vw] w-[15vw] opacity-0 will-change-transform"
              >
                <figure className="overflow-hidden rounded-2xl border border-white/12 bg-white shadow-[0_30px_60px_-24px_rgba(0,0,0,0.75)]">
                  {/*
                    A light plate, and `object-contain`.

                    These marks arrive in wildly different shapes — one is a
                    thin wordmark strip, another a square with cream baked
                    into it. `object-cover` on a dark card would crop half of
                    them and leave the rest floating on the wrong background;
                    a white plate with the logo fitted inside treats all nine
                    the same.
                  */}
                  <div className="media-zoom relative aspect-[4/3] w-full">
                    <span data-zoom className="absolute inset-0 block">
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 1023px) 0px, 17vw"
                        quality={82}
                        className="object-contain p-5"
                      />
                    </span>
                  </div>
                  <figcaption className="border-t border-black/10 bg-[#f4f1ec] px-4 py-2.5 text-center font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-[#3a322b]">
                    {providers[i]?.name}
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>

          {/*
            The copy holds the centre.

            The network name is the largest thing on the screen and it sits
            above the framing line rather than under it. This section exists
            to say nine specific names — so the name currently in focus should
            be what the eye lands on.
          */}
          <div className="container-page relative z-40 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 font-mono text-2xs uppercase tracking-[0.16em] text-fg-muted backdrop-blur-md">
              The network
            </span>

            <div className="mx-auto mt-8 flex min-h-[9.5rem] max-w-5xl flex-col items-center md:min-h-[13rem]">
              <span
                key={current.id}
                className="font-mono text-2xs uppercase tracking-[0.24em] text-primary"
                style={{ animation: "dm-step-in 380ms var(--ease-out-expo)" }}
              >
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(providers.length).padStart(2, "0")}
              </span>

              <p
                key={`${current.id}-n`}
                className="mt-3 text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[5.2rem]"
                style={{ animation: "dm-step-in 520ms var(--ease-out-expo)" }}
              >
                {current.name}
              </p>

              <p
                key={`${current.id}-t`}
                className="mt-4 text-base text-fg-muted md:text-lg"
                style={{ animation: "dm-step-in 620ms var(--ease-out-expo)" }}
              >
                {current.tagline} · {current.coverage}
              </p>

              {/* the mark itself, on phones only — the marks never fly there */}
              <span className="relative mt-7 block h-20 w-40 overflow-hidden rounded-xl bg-white lg:hidden">
                <Image
                  key={`${current.id}-m`}
                  src={MARKS[active]}
                  alt=""
                  fill
                  sizes="160px"
                  quality={80}
                  className="object-contain p-3"
                  style={{ animation: "dm-step-in 520ms var(--ease-out-expo)" }}
                />
              </span>
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

            <SplitHeading
              as="h2"
              mode="lines"
              text="Nine delivery networks. You integrate with one."
              highlight={["Nine", "networks."]}
              className="mx-auto mt-10 max-w-xl text-base font-medium leading-[1.35] tracking-[-0.01em] text-fg-muted md:text-lg"
            />
          </div>
        </div>
      </div>

      {/*
        Only one network is in the DOM at a time up there, so the other eight
        would be invisible to a crawler and to a screen reader. This is the
        full list, for both.
      */}
      <ul className="sr-only">
        {providers.map((p) => (
          <li key={p.id}>
            {p.name} — {p.tagline}, {p.coverage}
          </li>
        ))}
      </ul>
    </section>
  );
}


/**
 * The wave field.
 *
 * The band read as a poster pinned to a board: a flat colour, a flat grid and
 * nothing moving behind the subject. Three sine layers drifting at different
 * speeds give it a horizon instead — slow enough to be atmosphere rather than
 * decoration, and something for the carton to sit on.
 *
 * Each path carries exactly two periods across its viewBox and each layer is
 * twice its container's width, so translating by 50% lands period two
 * precisely where period one began. The loop has no seam and needs no
 * crossfade — and because it is a CSS animation on a transform, it composites
 * on the GPU and costs nothing per frame.
 *
 * Colours come from the scene's own spot tokens, so a band that changes scene
 * changes its water with no edit here. Reduced motion is handled globally:
 * `globals.css` collapses every animation duration under that query.
 */
const WAVES = [
  { h: "34vh", fill: "var(--spot-1)", opacity: 0.5, seconds: 42, reverse: false },
  { h: "26vh", fill: "var(--spot-2)", opacity: 0.55, seconds: 31, reverse: true },
  { h: "18vh", fill: "var(--spot-1)", opacity: 0.35, seconds: 24, reverse: false },
];

/** Two full periods across a 2400-unit box, so a 50% shift is seamless. */
const WAVE_PATH =
  "M0 120 C 200 75 400 75 600 120 S 1000 165 1200 120 S 1600 75 1800 120 S 2200 165 2400 120 V240 H0 Z";

function WaveField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 overflow-hidden"
    >
      {WAVES.map((w, i) => (
        <div
          key={i}
          className="absolute inset-x-0 bottom-0 w-[200%] will-change-transform"
          style={{
            height: w.h,
            opacity: w.opacity,
            animation: `dm-wave ${w.seconds}s linear infinite${w.reverse ? " reverse" : ""}`,
          }}
        >
          <svg
            viewBox="0 0 2400 240"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path d={WAVE_PATH} fill={w.fill} />
          </svg>
        </div>
      ))}
    </div>
  );
}

/**
 * The carton, in CSS 3D.
 *
 * A front panel, and above it a lid plane laid back 66° in perspective so the
 * reader is looking down into the opening. Two flaps are hinged on the left
 * and right edges of that plane and swing up out of it. Because the plane
 * carries `preserve-3d`, they rotate inside the same space the perspective
 * applies to, which is what makes them foreshorten as they swing instead of
 * merely getting shorter.
 *
 * Two flaps, not four. Four is what a real carton has, but four half-lids
 * folding out of an object this small is a lot of movement in a small space —
 * and the near flap in particular spends its whole swing in front of the
 * mouth, hiding the one thing the box exists to show. Two reads cleaner and
 * leaves the opening clear.
 *
 * Every flap is two-sided. A single div rotated past 90° shows the reader its
 * own front face again, mirrored — cardboard the same colour inside and out,
 * lit the same way, which is the tell that gives away a fake box. So each
 * flap holds two faces with `backface-visibility: hidden`: printed kraft
 * facing out, darker unbleached board facing in. Past square, the inside is
 * what you see, and it is a different colour because it should be.
 */

const KRAFT_OUT = "linear-gradient(155deg,#e0a970,#c1854c 45%,#a06a37)";
const KRAFT_IN = "linear-gradient(155deg,#8c5c30,#6f4622)";

function Flap({ side }: { side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div
      data-flap={side}
      className={`absolute inset-y-0 ${
        left ? "left-0 origin-left" : "right-0 origin-right"
      } w-1/2 [transform-style:preserve-3d]`}
    >
      <span
        className="absolute inset-0 [backface-visibility:hidden]"
        style={{ background: KRAFT_OUT }}
      />
      <span
        className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
        style={{ background: KRAFT_IN }}
      />
      {/* the crease it folds on */}
      <span
        className={`absolute inset-y-0 w-px bg-black/25 ${left ? "left-0" : "right-0"}`}
      />
    </div>
  );
}

function Carton() {
  return (
    <div
      data-box
      /* `opacity-0` as a class, not an inline style: GSAP writes opacity
         inline and therefore always wins it back, but the class is in the
         server HTML — so the carton is invisible on the first painted frame
         instead of sitting at the bottom of the section until hydration. */
      className="absolute bottom-[7%] left-1/2 -ml-[5.5vw] w-[11vw] opacity-0 will-change-transform [perspective:800px]"
    >
      <div data-carton className="relative [transform-style:preserve-3d]">
        {/* the lid plane, laid back so we look down into the box */}
        <div className="absolute inset-x-0 bottom-full h-[6vw] origin-bottom [transform:rotateX(66deg)] [transform-style:preserve-3d]">
          {/* the mouth */}
          <div className="absolute inset-0 bg-[#241407] shadow-[inset_0_0_1.6vw_rgba(0,0,0,0.9)]" />
          <div
            data-glow
            className="absolute inset-[10%] rounded-full opacity-0 blur-[0.9vw]"
            style={{
              background:
                "radial-gradient(closest-side,#ffc247,rgba(244,102,31,0.4) 58%,transparent)",
            }}
          />

          <Flap side="left" />
          <Flap side="right" />
        </div>

        {/* the front panel */}
        <div
          className="relative h-[7.5vw] overflow-hidden rounded-b-[2px] shadow-[0_1.4vw_3vw_-0.8vw_rgba(0,0,0,0.65)]"
          style={{ background: KRAFT_OUT }}
        >
          {/* corrugation, just enough to stop it reading as flat colour */}
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg,rgba(60,32,10,0.9) 0 1px,transparent 1px 6px)",
            }}
          />
          <div className="absolute inset-y-0 left-1/2 w-px bg-black/15" />
          {/* tape across the top edge */}
          <div className="absolute inset-x-0 top-0 h-[1vw] bg-[#efe3cc]/70" />

          {/* the label */}
          <div className="absolute left-1/2 top-1/2 w-[7.4vw] -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-[#faf7f1] py-[0.5vw] text-center shadow-sm">
            <span className="block text-[0.66vw] font-bold leading-none tracking-[0.02em]">
              <span className="text-[var(--color-crimson-500)]">DITTO</span>
              <span className="text-[var(--color-ember-400)]">MART</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
