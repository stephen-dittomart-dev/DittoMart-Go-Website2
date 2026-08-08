"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { Logo } from "@/components/brand/logo";
import { navigation } from "@/lib/site";

/**
 * Navigation feedback and prefetching.
 *
 * Two separate problems, solved together here.
 *
 * 1. The lag. App Router `<Link>` only prefetches the shared layout by
 *    default, so the first click on any nav item had to fetch that route's
 *    payload before anything could render — which on these heavy, animation-
 *    laden pages is the second or two you were seeing. This warms every
 *    top-level route once the browser goes idle after first paint, and warms
 *    anything else the moment the pointer touches it. After that a click has
 *    nothing left to wait for.
 *
 * 2. The silence. A navigation that takes half a second with no
 *    acknowledgement does not read as slow, it reads as broken — the click
 *    did nothing, so the reader clicks again. A click now raises the loader
 *    below, after a grace period, so genuinely instant navigations never
 *    flash anything and slow ones are visibly working.
 *
 * The grace period and the fade are **not here**. They are the transition on
 * `[data-route-loader]` in globals.css, because a navigation is slow exactly
 * when the main thread is busy, and anything expressed in JavaScript is
 * therefore starved at the one moment it is needed. That file has the full
 * account. Nothing in this component may reintroduce a timer or a tween for
 * the loader's own timing.
 *
 * Deliberately observational: this listens to clicks, it never calls
 * preventDefault. An earlier version of the transition did, and swallowed
 * every click that landed while its animation was running.
 */

/**
 * The loading screen, off.
 *
 * It works — it is the panel with the mark, the dots and the blurred page
 * behind it, and it appears only when a navigation takes longer than the
 * grace period. It is switched off because a loader that shows on a routine
 * click makes the site feel slower than it is: the reader stops seeing a site
 * and starts seeing a thing that is loading.
 *
 * Kept whole rather than deleted, because the reason it exists has not gone
 * away — a navigation that genuinely stalls should say so. Flip this to
 * `true` and everything comes back; nothing else has to change.
 *
 * The prefetching in this file is NOT part of the switch. That runs either
 * way and is what actually makes navigation quick.
 */
const LOADER = false;

/** Only a runaway navigation needs a timer, and only to uncover the page. */
const SAFETY_MS = 8000;

export function RouteProgress() {
  const pathname = usePathname();
  const router = useRouter();
  const overlay = useRef<HTMLDivElement>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetched = useRef(new Set<string>());

  /*
   * Show and hide are single attribute writes, deliberately.
   *
   * Not React state. A state flip has to be scheduled, reconciled and
   * committed, and all three want the main thread that the navigation is
   * already using — so the old version's timer fired late, its re-render
   * queued behind the transition, and its 240ms tween never got to ramp. One
   * `setAttribute` is the most that can be relied upon to happen while React
   * is rendering the next page. Everything after it — the grace period, the
   * fade, the dots — is CSS, which the compositor keeps running when script
   * cannot. See `[data-route-loader]` in globals.css.
   */
  const hide = useCallback(() => {
    overlay.current?.setAttribute("data-route-loader", "");
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
  }, []);

  const show = useCallback(() => {
    if (!LOADER) return;
    overlay.current?.setAttribute("data-route-loader", "on");
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    // A navigation that never resolves must not leave the page covered.
    safetyTimer.current = setTimeout(hide, SAFETY_MS);
  }, [hide]);

  /* ---------- warm the top-level routes once the browser is idle -------- */
  useEffect(() => {
    const warm = () => {
      for (const item of navigation) {
        if (!item.href || prefetched.current.has(item.href)) continue;
        prefetched.current.add(item.href);
        router.prefetch(item.href);
      }

    };

    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      const id = idle(warm, { timeout: 2500 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warm, 1800);
    return () => window.clearTimeout(t);
  }, [router]);

  /* ---------- prefetch on intent, and acknowledge the click ------------- */
  useEffect(() => {
    const internal = (a: HTMLAnchorElement | null) => {
      if (!a) return null;
      const href = a.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        a.target === "_blank" ||
        a.hasAttribute("download")
      )
        return null;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return null;
        if (url.pathname === window.location.pathname) return null;
        return url.pathname + url.search;
      } catch {
        return null;
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = internal(
        (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>("a[href]") ?? null
      );
      if (!target || prefetched.current.has(target)) return;
      prefetched.current.add(target);
      router.prefetch(target);
    };

    const onClick = (e: MouseEvent) => {
      /* No `defaultPrevented` check, and the listener below is in the capture
         phase — the two go together.

         Next's `<Link>` calls `preventDefault()` on the click so it can route
         on the client instead of letting the browser load the page. Its
         handler sits on the anchor, so in the bubble phase it has always run
         by the time a document-level listener sees the event: every internal
         navigation arrived here already marked as prevented and was skipped.
         That is why this loader never appeared once. Capturing puts us ahead
         of the anchor, where the flag means what it looks like it means. */
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const target = internal(
        (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>("a[href]") ?? null
      );
      if (!target) return;

      /* Never block the navigation — just start showing feedback for it.
         The grace period is the CSS transition-delay, not a timer here, so a
         navigation that lands inside it never flashes anything. */
      show();
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("focusin", onOver as unknown as EventListener);
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onOver as unknown as EventListener);
      document.removeEventListener("click", onClick, true);
    };
  }, [router, show]);

  /* ---------- the destination arrived ---------------------------------- */
  /* The destination arrived. Also bound to `pageshow`, because a back or
     forward navigation restored from the bfcache never runs the click path
     and would otherwise come back with the loader still up. */
  useEffect(() => {
    hide();
    window.addEventListener("pageshow", hide);
    return () => window.removeEventListener("pageshow", hide);
  }, [pathname, hide]);

  if (!LOADER) return null;

  return (
    <div
      ref={overlay}
      data-route-loader=""
      role="status"
      aria-live="polite"
      className={[
        "fixed inset-0 z-[9997] flex items-center justify-center",
        // The blur is the point: the page you are leaving goes soft behind the
        // panel, so the wait reads as the site working rather than as a screen
        // that has stopped.
        "bg-[color-mix(in_oklab,var(--bg)_72%,transparent)]",
        "backdrop-blur-md backdrop-saturate-150",
      ].join(" ")}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          {/* a soft breath behind the mark, purely so the panel is never
              completely static while it waits */}
          <span
            aria-hidden
            className="absolute size-32 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--color-ember-500) 42%, transparent), transparent 72%)",
              animation: "dm-loading-pulse 2.4s ease-in-out infinite",
            }}
          />
          <Logo className="relative scale-125" />
        </div>

        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-fg-muted">
          Loading
          <span aria-hidden className="flex items-end gap-[3px] pb-[2px]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block size-[3px] rounded-full bg-primary"
                style={{
                  animation: "dm-loading-dot 1.05s ease-in-out infinite",
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
