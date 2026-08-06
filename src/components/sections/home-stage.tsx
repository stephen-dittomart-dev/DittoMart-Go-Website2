"use client";

import { useState } from "react";
import { Hero } from "@/components/sections/hero";
import { HomeIntro } from "@/components/sections/home-intro";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Sequences the home opening: intro plays, then the hero runs its own
 * entrance underneath it.
 *
 * The handover is a plain piece of state rather than a shared event bus or a
 * module-level promise. Both of those survive navigation, which is exactly
 * wrong here — the intro has to replay every time the reader comes back to
 * the home page, and a remounted component with local state does that for
 * free.
 */
export function HomeStage() {
  // Under reduced motion there is no intro, so the hero is live immediately.
  const [introDone, setIntroDone] = useState(() =>
    typeof window === "undefined" ? false : prefersReducedMotion()
  );

  return (
    <>
      {!introDone ? <HomeIntro onDone={() => setIntroDone(true)} /> : null}
      <Hero ready={introDone} />
    </>
  );
}
