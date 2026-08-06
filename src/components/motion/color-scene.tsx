"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { sceneVars, type SceneName } from "@/lib/scenes";
import { cn } from "@/lib/utils";

/**
 * A scene — one band of the page with its own colour world.
 *
 * The background is a sticky layer that stays put while the content scrolls
 * over it, so the page stops feeling like one long uniform scroll. When the
 * next scene arrives it slides up *over* the current one, which is what makes
 * the colour change read as a deliberate cut rather than a fade.
 *
 * Content inside animates in three beats — fade in from below, hold, then
 * sweep out sideways — so each screenful has a beginning and an end instead
 * of just passing by.
 */
export function Scene({
  scene,
  children,
  id,
  className,
  sticky = true,
  sweep = "left",
  padded = true,
}: {
  scene: SceneName;
  children: ReactNode;
  id?: string;
  className?: string;
  /** Pin the background while content scrolls over it. */
  sticky?: boolean;
  /** Direction content leaves in. `none` holds it in place. */
  sweep?: "left" | "right" | "none";
  padded?: boolean;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      const blocks = gsap.utils.toArray<HTMLElement>("[data-scene-block]", el);
      if (!blocks.length) return;

      blocks.forEach((block) => {
        // in
        gsap.fromTo(
          block,
          { autoAlpha: 0, y: 54, filter: "blur(12px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: EASE.out4,
            scrollTrigger: { trigger: block, start: "top 82%", once: true },
          }
        );

        // out — the sweep
        if (sweep !== "none") {
          gsap.to(block, {
            xPercent: sweep === "left" ? -14 : 14,
            autoAlpha: 0,
            filter: "blur(8px)",
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "bottom 46%",
              end: "bottom 6%",
              scrub: 0.6,
            },
          });
        }
      });
    },
    { scope: root, dependencies: [sweep] }
  );

  return (
    <section
      ref={root}
      id={id}
      data-scene={scene}
      style={sceneVars(scene)}
      className={cn(
        "relative isolate scroll-mt-24 text-fg",
        // The scene's own colour. Each band paints itself, so the next one
        // scrolling up over it is a hard, intentional cut.
        "bg-bg",
        padded && "py-24 md:py-32",
        className
      )}
    >
      {sticky ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="sticky top-0 h-dvh w-full">
            <div className="absolute inset-0 bg-bg" />
            <div className="bg-grid absolute inset-0 opacity-60" />
            <div
              className="absolute -top-1/4 left-1/2 h-[70vh] w-[80vw] -translate-x-1/2 rounded-full blur-[120px]"
              style={{
                background:
                  "radial-gradient(closest-side, var(--spot-1), transparent 72%)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 h-[50vh] w-[50vw] rounded-full blur-[110px]"
              style={{
                background:
                  "radial-gradient(closest-side, var(--spot-2), transparent 72%)",
              }}
            />
          </div>
        </div>
      ) : null}

      {children}
    </section>
  );
}

/** A block inside a Scene — fades in, holds, then sweeps out. */
export function SceneBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-scene-block className={cn("relative", className)}>
      {children}
    </div>
  );
}
