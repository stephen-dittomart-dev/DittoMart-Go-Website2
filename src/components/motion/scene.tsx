"use client";

import { useGSAP } from "@gsap/react";
import { Pause, Play } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* =========================================================================
   Apple-style scene primitives.

   The pattern the Mac mini page uses is not scroll-jacking — it is a stack
   of full-bleed chapters where the media inside each one is scrubbed by
   scroll while the page keeps scrolling normally. That keeps the page
   readable, indexable and usable on a phone, which a hijacked scroll does
   not. Everything below implements that pattern.
   ========================================================================= */

/* -------------------------------------------------------------------------
   MediaPlate — a render on its plate.

   These illustrations are white-background PNGs, so they are never dropped
   straight onto the page: they sit on an explicit light plate with a soft
   brand wash behind. That makes them read as deliberate technical exhibits
   in both themes instead of white rectangles floating on a dark page.
   ------------------------------------------------------------------------- */
/**
 * Seven entrance choreographies.
 *
 * Every illustrated chapter is assigned a different one, so scrolling the
 * page never shows the same arrival twice. They are all transform-only, so
 * none of them cost layout.
 */
export type PlateMotion =
  | "rotate"
  | "flip"
  | "jump"
  | "swing"
  | "unfold"
  | "zoom"
  | "slide";

const PLATE_MOTION: Record<
  PlateMotion,
  { from: gsap.TweenVars; to: gsap.TweenVars }
> = {
  // spins up into place from a tilt
  rotate: {
    from: { opacity: 0, rotate: -9, scale: 0.86, y: 60 },
    to: { opacity: 1, rotate: 0, scale: 1, y: 0, duration: 1.25, ease: EASE.out4 },
  },
  // turns over on the Y axis like a card
  flip: {
    from: { opacity: 0, rotateY: 62, scale: 0.9, transformPerspective: 1400 },
    to: { opacity: 1, rotateY: 0, scale: 1, duration: 1.35, ease: EASE.out4 },
  },
  // drops in and settles with a bounce
  jump: {
    from: { opacity: 0, y: -90, scale: 0.88 },
    to: { opacity: 1, y: 0, scale: 1, duration: 1.15, ease: "back.out(1.7)" },
  },
  // swings in from a hinge on its top edge
  swing: {
    from: {
      opacity: 0,
      rotateX: -55,
      y: 40,
      transformOrigin: "50% 0%",
      transformPerspective: 1200,
    },
    to: { opacity: 1, rotateX: 0, y: 0, duration: 1.25, ease: "back.out(1.3)" },
  },
  // opens out from a folded edge
  unfold: {
    from: {
      opacity: 0,
      rotateY: -70,
      x: -60,
      transformOrigin: "0% 50%",
      transformPerspective: 1400,
    },
    to: { opacity: 1, rotateY: 0, x: 0, duration: 1.3, ease: EASE.out4 },
  },
  // pushes forward out of depth
  zoom: {
    from: { opacity: 0, scale: 0.6, z: -400, transformPerspective: 1000 },
    to: { opacity: 1, scale: 1, z: 0, duration: 1.2, ease: EASE.out4 },
  },
  // travels in from the side with a skew that settles
  slide: {
    from: { opacity: 0, x: 110, skewY: 5, scale: 0.94 },
    to: { opacity: 1, x: 0, skewY: 0, scale: 1, duration: 1.2, ease: EASE.out4 },
  },
};

export function MediaPlate({
  entry,
  src: srcProp,
  alt: altProp,
  caption: captionProp,
  className,
  priority = false,
  parallax = 34,
  glow = "primary",
  motion = "rotate",
  spin = false,
  variant: variantProp,
  aspect = "square",
  sizes = "(max-width: 1024px) 92vw, 46vw",
}: {
  /**
   * Preferred form — pass the whole manifest entry and the plate takes its
   * source, alt text, caption and framing from it. That keeps the "is this a
   * photograph or a render" decision in one place instead of being repeated,
   * and occasionally forgotten, at every call site.
   */
  entry?: {
    src: StaticImageData;
    alt: string;
    caption: string;
    variant: "render" | "photo";
  };
  src?: StaticImageData;
  alt?: string;
  caption?: string;
  className?: string;
  priority?: boolean;
  parallax?: number;
  glow?: "primary" | "accent" | "ai";
  motion?: PlateMotion;
  /** Adds a slow continuous scroll-linked rotation to the render itself. */
  spin?: boolean;
  /**
   * `render` — a white-background illustration, multiplied into a warm plate.
   * `photo`  — a full-bleed photograph, shown untouched on a dark frame.
   *
   * These need genuinely different treatment. Multiplying a photograph into
   * a sand plate turns it to mud, and dropping a white-background render onto
   * a dark frame leaves a white rectangle floating on the page.
   */
  variant?: "render" | "photo";
  aspect?: "square" | "wide" | "portrait";
  sizes?: string;
}) {
  const src = entry?.src ?? srcProp;
  const alt = entry?.alt ?? altProp ?? "";
  const caption = captionProp ?? entry?.caption;
  const isPhoto = (variantProp ?? entry?.variant ?? "render") === "photo";
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const img = el.querySelector("[data-plate-img]");
      const plate = el.querySelector("[data-plate]");
      if (!img || !plate || !src) return;

      if (prefersReducedMotion()) {
        gsap.set(plate, { opacity: 1, clearProps: "transform" });
        return;
      }

      const spec = PLATE_MOTION[motion];
      gsap.fromTo(plate, spec.from, {
        ...spec.to,
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      });

      // The render itself keeps moving inside its frame as the page scrolls.
      gsap.fromTo(
        img,
        { yPercent: parallax / 5, scale: 1.1, rotate: spin ? -7 : 0 },
        {
          yPercent: -parallax / 5,
          scale: 1,
          rotate: spin ? 7 : 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        }
      );

      // Pointer tilt — the plate leans toward the cursor.
      if (!window.matchMedia("(pointer: coarse)").matches) {
        const rx = gsap.quickTo(plate, "rotateX", { duration: 0.6, ease: EASE.out3 });
        const ry = gsap.quickTo(plate, "rotateY", { duration: 0.6, ease: EASE.out3 });
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          rx(-((e.clientY - r.top) / r.height - 0.5) * 9);
          ry(((e.clientX - r.left) / r.width - 0.5) * 9);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
      }
    },
    { scope: root, dependencies: [motion] }
  );

  const glowVar =
    glow === "accent" ? "var(--spot-2)" : glow === "ai" ? "var(--spot-3)" : "var(--spot-1)";

  if (!src) return null;

  return (
    <div ref={root} className={cn("relative [perspective:1400px]", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 -bottom-8 -top-8 rounded-[2rem] opacity-80 blur-[70px]"
        style={{
          background: `radial-gradient(closest-side, ${glowVar}, transparent 72%)`,
        }}
      />

      <figure
        data-plate
        className={cn(
          "relative overflow-hidden rounded-3xl border shadow-e3 [transform-style:preserve-3d]",
          isPhoto
            ? "border-white/12 bg-[#0d0a08]"
            : "border-line bg-[#f2ede5]"
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden",
            aspect === "wide"
              ? "aspect-[16/10]"
              : aspect === "portrait"
                ? "aspect-[4/5]"
                : "aspect-square"
          )}
        >
          <Image
            data-plate-img
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            /* Photographs carry detail that survives compression far better
               than flat illustration does, so they can afford a lower quality
               setting — and on a page holding a dozen of them that is the
               difference between a fast first paint and a slow one. */
            quality={isPhoto ? 68 : 80}
            placeholder="blur"
            className={cn(
              "object-cover will-change-transform",
              !isPhoto && "mix-blend-multiply"
            )}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0",
              isPhoto
                ? "bg-[linear-gradient(180deg,rgba(0,0,0,0.12),transparent_35%,rgba(0,0,0,0.35))]"
                : "bg-[radial-gradient(circle_at_30%_20%,transparent_40%,rgba(60,45,30,0.08))]"
            )}
          />
        </div>

        {caption ? (
          <figcaption
            className={cn(
              "flex items-center justify-between gap-3 border-t px-5 py-3.5",
              isPhoto
                ? "border-white/10 bg-[#151110]"
                : "border-line bg-[#ece5da]"
            )}
          >
            <span
              className={cn(
                "font-mono text-2xs uppercase tracking-[0.14em]",
                isPhoto ? "text-white/65" : "text-[#574e45]"
              )}
            >
              {caption}
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5 font-mono text-2xs",
                isPhoto ? "text-white/40" : "text-[#7c7166]"
              )}
            >
              <span className="size-1.5 animate-breathe rounded-full bg-[#e04e0f]" />
              LIVE
            </span>
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Chapter — a full-bleed band with a media side and a copy side.

   Alternating `flip` gives the page the left/right rhythm Apple uses so no
   two consecutive chapters read the same, and the band always fills the
   viewport width edge to edge so there is never an empty gutter.
   ------------------------------------------------------------------------- */
export function Chapter({
  id,
  eyebrow,
  children,
  media,
  flip = false,
  tone = "default",
  className,
  compact = false,
}: {
  id?: string;
  eyebrow?: ReactNode;
  children: ReactNode;
  media: ReactNode;
  flip?: boolean;
  tone?: "default" | "tint" | "deep";
  className?: string;
  compact?: boolean;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      const copy = el.querySelectorAll("[data-chapter-copy] > *");
      if (!copy.length) return;

      gsap.fromTo(
        copy,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: EASE.out4,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 76%", once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id={id}
      className={cn(
        "relative scroll-mt-24 overflow-hidden border-b border-line",
        compact ? "py-20 md:py-24" : "py-24 md:py-32",
        tone === "tint" && "bg-bg-subtle",
        tone === "deep" &&
          "bg-[linear-gradient(155deg,var(--primary-soft),transparent_65%)]",
        className
      )}
    >
      <div className="container-page">
        <div
          className={cn(
            "grid items-center gap-12 lg:grid-cols-12 lg:gap-16",
            flip && "lg:[&>*:first-child]:order-2"
          )}
        >
          <div data-chapter-copy className="lg:col-span-6">
            {eyebrow}
            {children}
          </div>
          <div className="lg:col-span-6">{media}</div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   ScrubVideo — Apple's signature move.

   The film does not autoplay on a loop; its playhead is tied to scroll
   position, so the viewer scrubs it. Falls back to a normal muted autoplay
   loop on touch (where scrubbing a video element is unreliable) and to a
   single poster frame under reduced motion.
   ------------------------------------------------------------------------- */
export function ScrubVideo({
  src,
  className,
  poster,
  label,
}: {
  src: string;
  className?: string;
  poster?: string;
  label?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  /**
   * Plays whenever it is on screen, pauses when it leaves.
   *
   * An earlier version tied `currentTime` to scroll position. That looked
   * great in theory and was broken in practice: seeking a progressive MP4
   * only works once enough of it is buffered and the moov atom is at the
   * front, so on a cold load the film simply never moved. Autoplay-in-view
   * always works, and the frame still gets its own scroll parallax below.
   */
  useEffect(() => {
    const el = root.current;
    const video = videoRef.current;
    if (!el || !video) return;

    if (prefersReducedMotion()) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video
            .play()
            .then(() => {
              setPlaying(true);
              setNeedsTap(false);
            })
            .catch(() => {
              // Some browsers still refuse muted autoplay — offer a control.
              setNeedsTap(true);
            });
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.35 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el.querySelector("[data-video-frame]"),
        { opacity: 0, scale: 0.94, y: 48, rotateX: 6, transformPerspective: 1200 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          duration: 1.3,
          ease: EASE.out4,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );

      // The frame drifts as the section passes — depth, not playback.
      gsap.fromTo(
        el.querySelector("[data-video-frame]"),
        { yPercent: 4 },
        {
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        }
      );
    },
    { scope: root }
  );

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => {
        setPlaying(true);
        setNeedsTap(false);
      }).catch(() => setNeedsTap(true));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div ref={root} className={cn("relative", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -bottom-10 -top-10 rounded-[3rem] opacity-70 blur-[90px]"
        style={{
          background: "radial-gradient(closest-side, var(--spot-1), transparent 72%)",
        }}
      />
      <div
        data-video-frame
        className="relative overflow-hidden rounded-3xl border border-line bg-[var(--color-ink-975)] shadow-e3"
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          aria-label={label ?? "DittoMart Go introduction film"}
          className="block h-auto w-full"
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause film" : "Play film"}
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            needsTap ? "bg-black/35 opacity-100" : "opacity-0 hover:opacity-100"
          )}
        >
          <span className="flex size-16 items-center justify-center rounded-full border border-white/40 bg-black/40 backdrop-blur-sm">
            {playing && !needsTap ? (
              <Pause aria-hidden className="size-6 text-white" />
            ) : (
              <Play aria-hidden className="size-6 translate-x-0.5 text-white" />
            )}
          </span>
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 to-transparent px-5 py-4">
          <span className="font-mono text-2xs uppercase tracking-[0.16em] text-white/75">
            {label ?? "DittoMart Go — the film"}
          </span>
          <span className="hidden items-center gap-1.5 font-mono text-2xs text-white/55 sm:flex">
            <span
              className={cn(
                "size-1.5 rounded-full",
                playing ? "animate-breathe bg-[#f4661f]" : "bg-white/40"
              )}
            />
            {playing ? "PLAYING" : "PAUSED"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   StatStrip — a dense edge-to-edge band. Used to close chapters so the page
   never leaves a wide empty gutter between sections.
   ------------------------------------------------------------------------- */
export function StatStrip({
  items,
  className,
}: {
  items: { value: string; label: string }[];
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el.querySelectorAll("[data-strip-item]"),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: EASE.out3,
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className={cn(
        "grid gap-px border-y border-line bg-line",
        items.length === 4
          ? "grid-cols-2 lg:grid-cols-4"
          : "grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((s) => (
        <div key={s.label} data-strip-item className="bg-bg px-6 py-8 text-center">
          <div className="text-3xl font-semibold tracking-[-0.03em] tnum md:text-4xl">
            {s.value}
          </div>
          <div className="mt-2 font-mono text-2xs uppercase tracking-[0.14em] text-fg-subtle">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
