"use client";

import { useGSAP } from "@gsap/react";
import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useScrollControl } from "@/components/motion/scroll-provider";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Back to top.
 *
 * The ring around the button is the page's read progress, so the control
 * doubles as a position indicator — it earns its corner instead of just
 * sitting there. Routes through Lenis so the return journey is smooth rather
 * than an instant jump.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { scrollToTop } = useScrollControl();

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
      setVisible(y > window.innerHeight * 0.9);
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useGSAP(
    () => {
      registerGsap();
      const el = btnRef.current;
      if (!el || prefersReducedMotion()) return;

      gsap.to(el, {
        autoAlpha: visible ? 1 : 0,
        y: visible ? 0 : 18,
        scale: visible ? 1 : 0.8,
        duration: DUR.fast,
        ease: EASE.out3,
        pointerEvents: visible ? "auto" : "none",
      });
    },
    { dependencies: [visible] }
  );

  const R = 21;
  const C = 2 * Math.PI * R;

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={() => scrollToTop()}
      aria-label="Back to top"
      data-cursor="top"
      className={cn(
        "group fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full",
        "border border-line bg-[color-mix(in_oklab,var(--elevated)_88%,transparent)] backdrop-blur-md",
        "shadow-e2 transition-colors duration-300",
        "hover:border-primary-border",
        // Under reduced motion GSAP never runs, so fall back to a CSS toggle.
        "motion-reduce:transition-opacity",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 48 48"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="var(--line)"
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>

      <ArrowUp
        aria-hidden
        className="relative size-[18px] text-fg-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-primary"
      />
    </button>
  );
}
