"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/motion";

/**
 * Hold a band on its last screenful so the next one can climb over it, and
 * let it recede while that happens.
 *
 * Wraps a section without touching it. Nothing inside is restructured, no
 * class on the band changes, and no animation it owns is aware this exists.
 *
 * ---------------------------------------------------------------------------
 * Why the hold is built this way
 *
 * The obvious attempt is `position: sticky; bottom: 0` on the band itself. It
 * does nothing, and the reason is worth writing down because it looks like it
 * should work: `bottom` pulls a sticky box *up*, so that its bottom edge comes
 * into view early — it never pushes one down to hold it late. A band that is
 * already flush with the top of its containing block has no room to move up,
 * so the offset is always zero and it behaves exactly like `position: relative`.
 *
 * Holding the *end* of a box means pinning its *top* at a negative offset:
 *
 *     top: 100vh - height
 *
 * With a band taller than the screen that is a negative number, so the band
 * scrolls normally until its bottom edge reaches the bottom of the frame, and
 * then stops — which is the whole effect.
 *
 * CSS cannot express "my own height" in `top`, so the height is measured and
 * published as a custom property. That is the only reason this is a component
 * and not two utility classes.
 *
 * The empty screen after the stage is what bounds the hold. Sticky is limited
 * by its containing block, so the band releases the moment the wrapper's
 * bottom passes — one viewport later. That same viewport is what the next band
 * is pulled up by, so the hold and the climb are the same number by
 * construction and cannot drift apart.
 *
 * ---------------------------------------------------------------------------
 * Bands that fit the screen pin at the top instead
 *
 * `100vh - height` is *positive* for a band shorter than the frame, and the
 * clamp turns that into `top: 0` — the band pins as soon as its top edge
 * reaches the top of the screen, holds for one viewport, and the next band
 * climbs over it from below. That is the right behaviour: a band with nothing
 * left to scroll through has no "last screenful", so the moment it is fully
 * on screen is the moment to stop it.
 *
 * This was briefly disabled after a short band appeared to lose its UI. The
 * real cause was chaining, not height: the band *before* it was also held and
 * had already receded to a quarter opacity, so the area around the short
 * pinned band showed a ghost of it. Two consecutive holds where the first one
 * is short is the case to avoid — the height itself is fine.
 * ---------------------------------------------------------------------------
 *
 * Desktop only. Below `lg` the stage is not sticky, the spacer is not
 * rendered, and no tween is created — the band flows exactly as it did before.
 */
export function HoldToEnd({
  children,
  className,
}: {
  children: ReactNode;
  /** Applied to the outer wrapper — this is where a `-mt-[100vh]` belongs. */
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spacer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = stage.current;
      const run = spacer.current;
      if (!el || !run) return;

      let tween: gsap.core.Tween | null = null;

      const measure = () => {
        const h = el.offsetHeight;
        el.style.setProperty("--band-h", `${h}px`);

        /* Held on every desktop width. The clamp in `top` already picks the
           right pin for the height — negative for a band taller than the
           frame so it stops on its last screenful, zero for one that fits so
           it stops the moment it is fully on screen. */
        const holds = !prefersReducedMotion() && window.innerWidth >= 1024;

        // Inline `static` beats the `lg:sticky` class; clearing it hands
        // control back to the class, which is itself already lg-gated.
        el.style.position = holds ? "" : "static";

        if (holds && !tween) {
          /* Driven by the spacer, not by the band. The band is sticky, and
             ScrollTrigger measures a trigger's position in the document — for
             a stuck element that is the position it *would* have, not where it
             is. The spacer is a plain, never-offset box occupying exactly the
             hold, so this is precisely the window the band is held for, with
             no number repeated between the CSS and the tween.

             Scale and opacity only. A blur across a full-viewport band costs a
             full-screen filter pass every frame of a scrub and buys almost
             nothing once the band is at 90% and a quarter opacity. */
          tween = gsap.fromTo(
            el,
            { scale: 1, autoAlpha: 1 },
            {
              scale: 0.9,
              autoAlpha: 0.25,
              ease: "none",
              transformOrigin: "50% 42%",
              scrollTrigger: {
                trigger: run,
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            }
          );
        } else if (!holds && tween) {
          tween.scrollTrigger?.kill();
          tween.kill();
          tween = null;
          gsap.set(el, { clearProps: "transform,opacity,visibility" });
        }
      };

      measure();

      /* Observed rather than measured once: these bands hold images and video
         that change the height as they decode, and a wrong height means the
         band stops at the wrong line. Writing a custom property back to the
         observed element cannot loop — `top` does not affect height. */
      const ro = new ResizeObserver(measure);
      ro.observe(el);

      const onResize = () => {
        measure();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      return () => {
        ro.disconnect();
        window.removeEventListener("resize", onResize);
        tween?.scrollTrigger?.kill();
        tween?.kill();
      };
    },
    { scope: root }
  );

  return (
    <div ref={root} className={className}>
      <div
        ref={stage}
        className="lg:sticky"
        style={{ top: "min(0px, calc(100vh - var(--band-h, 0px)))" }}
      >
        {children}
      </div>
      <div ref={spacer} aria-hidden className="hidden lg:block lg:h-[100vh]" />
    </div>
  );
}
