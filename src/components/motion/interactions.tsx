"use client";

import { useGSAP } from "@gsap/react";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
   Spotlight — cursor-tracked radial highlight on a card surface.

   Writes two CSS custom properties on pointermove and lets the compositor do
   the rest. No animation library involved, no React state, no re-render.
   ------------------------------------------------------------------------- */
export function Spotlight({
  children,
  className,
  radius = 420,
  strength = 0.1,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={cn("group relative", className)}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || prefersReducedMotion()) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      }}
      style={
        {
          "--spot-r": `${radius}px`,
          "--spot-a": `${strength * 100}%`,
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(var(--spot-r) circle at var(--spot-x, -9999px) var(--spot-y, -9999px), color-mix(in oklab, var(--primary) var(--spot-a), transparent), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Marquee — infinite rail. Pure CSS transform, duplicated track.
   ------------------------------------------------------------------------- */
export function Marquee({
  children,
  className,
  duration = 46,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div className={cn("mask-fade-x overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused]"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center gap-14">{children}</div>
        <div className="flex shrink-0 items-center gap-14" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   ScrollProgress — the thin bar at the top of the viewport.
   ------------------------------------------------------------------------- */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { scaleX: 0 });
      return;
    }

    gsap.set(el, { scaleX: 0, transformOrigin: "left center" });

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.to(el, {
          scaleX: self.progress,
          duration: 0.25,
          ease: "power2.out",
          overwrite: true,
        });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-ember-500 via-teal-400 to-crimson-400"
    />
  );
}

/* -------------------------------------------------------------------------
   Parallax — scrub-linked translate wrapper.
   ------------------------------------------------------------------------- */
export function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const el = inner.current;
    const trigger = ref.current;
    if (!el || !trigger || prefersReducedMotion()) return;

    const tween = gsap.fromTo(
      el,
      { y: distance },
      {
        y: -distance,
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [distance]);

  return (
    <div ref={ref} className={className}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
