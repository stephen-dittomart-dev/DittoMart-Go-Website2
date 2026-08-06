"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import scooty from "@/assets/scootyImg-removebg-preview.png";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { navigation } from "@/lib/site";
import { cn } from "@/lib/utils";

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
 * 2. The silence. Even a fast navigation feels broken with no acknowledgement.
 *    A click now raises a centred marker immediately — but only after a 140ms
 *    grace period, so genuinely instant navigations never flash a loader at
 *    you, which looks worse than no loader at all.
 *
 * Deliberately observational: this listens to clicks, it never calls
 * preventDefault. An earlier version of the transition did, and swallowed
 * every click that landed while its animation was running.
 */

const GRACE_MS = 140;
const SAFETY_MS = 8000;

export function RouteProgress() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetched = useRef(new Set<string>());

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
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)
        return;
      const target = internal(
        (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>("a[href]") ?? null
      );
      if (!target) return;

      // Never block the navigation — just start showing feedback for it.
      graceTimer.current = setTimeout(() => setPending(true), GRACE_MS);
      safetyTimer.current = setTimeout(() => setPending(false), SAFETY_MS);
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("focusin", onOver as unknown as EventListener);
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("focusin", onOver as unknown as EventListener);
      document.removeEventListener("click", onClick);
    };
  }, [router]);

  /* ---------- the destination arrived ---------------------------------- */
  useEffect(() => {
    if (graceTimer.current) clearTimeout(graceTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    setPending(false);
  }, [pathname]);

  useGSAP(
    () => {
      const el = overlay.current;
      if (!el) return;
      registerGsap();

      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: pending ? 1 : 0 });
        return;
      }

      gsap.to(el, {
        autoAlpha: pending ? 1 : 0,
        duration: pending ? 0.24 : 0.3,
        ease: EASE.out3,
      });
    },
    { dependencies: [pending] }
  );

  return (
    <div
      ref={overlay}
      aria-hidden={!pending}
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-0 z-[9997] flex items-center justify-center",
        "bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-sm"
      )}
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative size-28 sm:size-32">
          {/* the mark keeps riding while the route resolves */}
          <Image
            src={scooty}
            alt=""
            fill
            sizes="128px"
            className="animate-float object-contain mix-blend-multiply"
          />
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.34em] text-fg-muted">
            Routing
            <span className="ml-0.5 inline-flex">
              <span className="animate-breathe">.</span>
              <span className="animate-breathe [animation-delay:200ms]">.</span>
              <span className="animate-breathe [animation-delay:400ms]">.</span>
            </span>
          </span>

          <span className="h-px w-24 overflow-hidden bg-line">
            <span className="block h-full w-1/3 animate-[dm-route-run_1.1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-ember-500 to-transparent" />
          </span>
        </div>
      </div>
    </div>
  );
}
