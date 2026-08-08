"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import scooty from "@/assets/scootyImg-removebg-preview.png";
import { useScrollControl } from "@/components/motion/scroll-provider";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

const WORD_TOP = "DittoMart";
const WORD_BOTTOM = "Go";

/**
 * The home intro.
 *
 * Runs on arrival at the home page — first load and every return visit,
 * because `template.tsx` remounts on navigation. The mark rides in from the
 * left while the letters fall like rain, each one bouncing once as it lands.
 * When the lockup has settled the whole overlay fades and the hero runs its
 * own entrance underneath, so the two never play at the same time.
 *
 * Scroll is locked for the duration — an intro the reader can scroll past
 * mid-fall looks broken rather than cinematic.
 */
export function HomeIntro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const { lockScroll } = useScrollControl();

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      // Reduced motion gets no intro at all — it would be a full-screen
      // block with nothing to justify it.
      if (prefersReducedMotion()) {
        gsap.set(el, { display: "none" });
        onDone();
        return;
      }

      const q = gsap.utils.selector(el);
      const letters = q("[data-intro-letter]");
      const mark = q("[data-intro-mark]");
      const glow = q("[data-intro-glow]");
      const rule = q("[data-intro-rule]");
      const tagline = q("[data-intro-tagline]");

      lockScroll(true);
      window.scrollTo(0, 0);

      const tl = gsap.timeline({
        onComplete: () => {
          lockScroll(false);
          gsap.set(el, { display: "none" });
          onDone();
        },
      });

      // everything starts off-stage
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(mark, { autoAlpha: 0, x: -90, rotate: -12, scale: 0.8 });
      gsap.set(glow, { autoAlpha: 0, scale: 0.6 });
      gsap.set(rule, { scaleY: 0, transformOrigin: "center" });
      gsap.set(tagline, { autoAlpha: 0, y: 12 });
      gsap.set(letters, {
        autoAlpha: 0,
        yPercent: -900,
        rotate: () => gsap.utils.random(-24, 24),
      });

      /* Everything is off-stage now, so the lockup can be uncovered. Still
         inside the layout effect, so this lands before the first paint after
         hydration and the assembled markup is never seen. */
      gsap.set(q("[data-intro-stage]"), { opacity: 1 });

      tl
        // the mark rides in
        .to(glow, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.7,
          ease: EASE.out3,
        })
        .to(
          mark,
          {
            autoAlpha: 1,
            x: 0,
            rotate: 0,
            scale: 1,
            duration: 0.9,
            ease: "back.out(1.5)",
          },
          0.05
        )
        .to(rule, { scaleY: 1, duration: 0.5, ease: EASE.out3 }, 0.45)

        // then the rain — each letter drops and bounces once on landing
        .to(
          letters,
          {
            autoAlpha: 1,
            yPercent: 0,
            rotate: 0,
            duration: 1.05,
            ease: "bounce.out",
            stagger: { each: 0.055, from: "start" },
          },
          0.4
        )
        // a squash on impact, offset to land with each letter
        .to(
          letters,
          {
            keyframes: [
              { scaleY: 0.82, scaleX: 1.12, duration: 0.08 },
              { scaleY: 1, scaleX: 1, duration: 0.22, ease: "elastic.out(1, 0.4)" },
            ],
            stagger: { each: 0.055, from: "start" },
          },
          1.2
        )
        .to(tagline, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.35")

        // hold, then clear the stage
        .to(
          el,
          {
            autoAlpha: 0,
            duration: 0.55,
            ease: EASE.inOut,
          },
          "+=0.45"
        )
        .to([mark, letters], { y: -26, duration: 0.55, ease: EASE.inOut }, "<");

      return () => {
        tl.kill();
        lockScroll(false);
      };
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      /*
        Opaque in the server-rendered markup, not transparent.

        It used to ship at `opacity: 0` and be switched on by the `gsap.set`
        below — but that set cannot run until React has hydrated, and the
        browser paints long before that. So the first thing on screen was the
        hero, sitting there uncovered for as long as hydration took, and the
        intro dropped over it afterwards. The animation is meant to be the
        first thing you see; it was the second.

        Opaque from the first byte fixes it, and costs nothing: the element is
        already in the SSR output, this only changes what it looks like before
        JavaScript arrives.
      */
      className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden bg-bg"
      style={{ opacity: 1 }}
      role="presentation"
      data-home-intro
    >
      {/*
        The one thing an opaque pre-hydration overlay must not do is stay.
        With scripting off nothing would ever take it down, so this is the
        only case that needs a way out that does not involve JavaScript.
      */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: "<style>[data-home-intro]{display:none!important}</style>",
        }}
      />

      {/* warm wash behind the lockup */}
      <div
        data-intro-glow
        aria-hidden
        className="pointer-events-none absolute size-[130vmin] rounded-full blur-[130px]"
        style={{
          opacity: 0,
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--color-ember-500) 34%, transparent), transparent 72%)",
        }}
      />
      <div aria-hidden className="bg-grid absolute inset-0 opacity-50 mask-radial-fade" />

      {/*
        Hidden until everything inside it has been parked off-stage.

        The overlay above is now opaque before hydration, which uncovers a
        second version of the same problem: the lockup's own markup is the
        *finished* lockup — mark in place, letters standing, rule drawn — and
        it is only pulled apart by the `gsap.set` calls on mount. Left visible
        it would show fully assembled for a frame and then fly apart, which
        gives the whole trick away.

        One opacity on the container rather than a seed on each piece, because
        the pieces are not uniform: the letters and the mark animate their own
        opacity and could be seeded individually, but the rule only animates
        `scaleY` — seed that one at zero opacity and it would never come back.
        Hiding the container sidesteps having to be right about each of them.

        Turned on inside the same layout effect that parks everything, so it
        happens before the browser paints and there is no frame in between.
      */}
      <div
        data-intro-stage
        style={{ opacity: 0 }}
        className="relative flex items-center gap-6 px-6 sm:gap-10 md:gap-14"
      >
        {/* the mark */}
        <div
          data-intro-mark
          className="relative w-[42vw] max-w-[420px] shrink-0 sm:w-[34vw] md:w-[30vw]"
        >
          <Image
            src={scooty}
            alt=""
            priority
            sizes="(max-width: 640px) 42vw, (max-width: 768px) 34vw, 420px"
            className="h-auto w-full object-contain mix-blend-multiply"
          />
        </div>

        <span
          data-intro-rule
          aria-hidden
          className="hidden h-28 w-px shrink-0 bg-gradient-to-b from-transparent via-line-strong to-transparent sm:block sm:h-36 md:h-44"
        />

        {/* the wordmark, letter by letter */}
        <div className="flex flex-col leading-[0.86]">
          <span
            aria-label="DittoMart Go"
            className="flex flex-col"
          >
            <span aria-hidden className="flex overflow-visible">
              {WORD_TOP.split("").map((ch, i) => (
                <span
                  key={`t-${i}`}
                  data-intro-letter
                  className="inline-block text-[9vw] font-bold tracking-[-0.03em] text-fg sm:text-[6.4vw] md:text-[4.6rem]"
                >
                  {ch}
                </span>
              ))}
            </span>

            <span aria-hidden className="mt-1 flex overflow-visible md:mt-2">
              {WORD_BOTTOM.split("").map((ch, i) => (
                <span
                  key={`b-${i}`}
                  data-intro-letter
                  className="inline-block text-[15vw] font-extrabold tracking-[-0.05em] text-[var(--color-ember-600)] sm:text-[11vw] md:text-[8rem]"
                >
                  {ch}
                </span>
              ))}
            </span>
          </span>

          <span
            data-intro-tagline
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-fg-subtle sm:text-xs md:mt-4"
          >
            We are on your route
          </span>
        </div>
      </div>
    </div>
  );
}
