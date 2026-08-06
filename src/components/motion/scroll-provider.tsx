"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/motion";

const HEADER_OFFSET = -88;

type ScrollApi = {
  lockScroll: (locked: boolean) => void;
  scrollToTop: (immediate?: boolean) => void;
  scrollToId: (id: string, immediate?: boolean) => void;
  ready: boolean;
};

const ScrollContext = createContext<ScrollApi>({
  lockScroll: () => {},
  scrollToTop: () => {},
  scrollToId: () => {},
  ready: false,
});

export const useScrollControl = () => useContext(ScrollContext);

/**
 * Single RAF loop for the whole site.
 *
 * Lenis is driven from the GSAP ticker rather than its own requestAnimationFrame,
 * and ScrollTrigger.update is wired to Lenis's scroll event. Running two
 * independent loops is the classic cause of ScrollTrigger lagging one frame
 * behind smooth scroll — pinned sections visibly judder.
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();

    /* ----------------------------------------------------------------------
       Land at the top on reload.

       A refresh was dropping the reader into the middle of the nine-network
       burst. Two things conspire:

       · Browsers default `history.scrollRestoration` to "auto", so a reload
         re-applies the previous scroll offset. Nothing here ever turned
         that off.
       · ScrollTrigger keeps its own per-URL scroll memory, and the burst is
         the one section still held by a real GSAP `pin`. The pin injects a
         spacer, so the document is shorter at the moment the offset is
         restored than it was when the offset was recorded — the restored
         pixel position therefore lands somewhere it did not come from, and
         once the pin builds, that somewhere is inside the burst. That is
         why it was always this section and never a different one.

       Both are switched to manual, and the position is forced to the top at
       each of the three moments the layout settles — mount, the 350ms
       settle, and `load` — because a single reset at mount is undone by
       whichever restoration fires afterwards.

       Two things it deliberately does not fight: a real hash in the URL
       (`/#network` has to work), and a reader who has already started
       scrolling. `userScrolled` latches on the first genuine input, after
       which the resets stop.
       ---------------------------------------------------------------------- */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    ScrollTrigger.clearScrollMemory("manual");

    const hasHash = window.location.hash.length > 1;
    let userScrolled = false;
    const markScrolled = () => {
      userScrolled = true;
    };
    window.addEventListener("wheel", markScrolled, { passive: true });
    window.addEventListener("touchstart", markScrolled, { passive: true });
    window.addEventListener("keydown", markScrolled);

    const toTop = () => {
      if (hasHash || userScrolled) return;
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    };
    toTop();

    const detachScrollWatch = () => {
      window.removeEventListener("wheel", markScrolled);
      window.removeEventListener("touchstart", markScrolled);
      window.removeEventListener("keydown", markScrolled);
    };

    if (prefersReducedMotion()) {
      setReady(true);
      return detachScrollWatch;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 0.95,
    });
    lenisRef.current = lenis;
    // Lenis keeps its own idea of the current offset, seeded at construction.
    toTop();

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Layout settles in three waves: hydration, webfonts, then full load.
    // `refresh()` re-measures every pin, which is the step that used to leave
    // the page parked mid-burst — so the reset runs after it, not before.
    const t = window.setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
      toTop();
    }, 350);
    const onLoad = () => {
      lenis.resize();
      ScrollTrigger.refresh();
      toTop();
    };
    document.fonts?.ready.then(onLoad).catch(() => {});
    window.addEventListener("load", onLoad);

    setReady(true);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", onLoad);
      detachScrollWatch();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Anchor links route through Lenis so in-page jumps stay smooth.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
      const anchor = (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;

      e.preventDefault();
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(el as HTMLElement, {
          offset: HEADER_OFFSET,
          duration: 1.15,
        });
      } else {
        const top =
          (el as HTMLElement).getBoundingClientRect().top +
          window.scrollY +
          HEADER_OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
      }
      history.replaceState(null, "", id);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // A route change invalidates Lenis's cached page height. The matching
  // ScrollTrigger.refresh() is deliberately left to PageEnter, which fires it
  // once the entrance tween has finished and the layout is actually final —
  // doing it here as well meant paying for two full refreshes per navigation,
  // and the first one measured a page that was still animating.
  useEffect(() => {
    lenisRef.current?.resize();
  }, [pathname]);

  const lockScroll = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, []);

  const scrollToTop = useCallback((immediate = false) => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(0, { immediate, duration: immediate ? 0 : 0.9 });
    else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
  }, []);

  const scrollToId = useCallback((id: string, immediate = false) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = lenisRef.current;
    lenis?.resize();
    if (lenis) lenis.scrollTo(el, { offset: HEADER_OFFSET, immediate });
    else
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET,
        behavior: immediate ? "auto" : "smooth",
      });
  }, []);

  const api = useMemo(
    () => ({ lockScroll, scrollToTop, scrollToId, ready }),
    [lockScroll, scrollToTop, scrollToId, ready]
  );

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
