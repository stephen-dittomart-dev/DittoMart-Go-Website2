"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * The routing mesh — the home hero's living background.
 *
 * A rotating cloud of nodes on a noisy sphere, wired to whichever neighbours
 * are close enough on screen, with routes being drawn across it continuously:
 * a line reaches out from one node, arrives at another, carries something
 * across, and releases. That is the product drawn literally — separate
 * services being connected so one delivery can cross all of them.
 *
 * Six decisions that are worth writing down, because the obvious version of
 * this effect is a performance trap:
 *
 *  1 · It is genuinely three-dimensional. Nodes live on a Fibonacci sphere in
 *      spherical coordinates and are projected through a perspective divide,
 *      so depth drives scale, opacity and draw order. The common version of
 *      this animation places everything at `cx + cos(a) * r`, which is a flat
 *      ring — it reads as a fuzzy donut no matter how it is coloured.
 *
 *  2 · Glow is a pre-rendered sprite, not `ctx.shadowBlur`. Canvas shadow blur
 *      is unaccelerated; 300 shadowed arcs a frame is the single most
 *      expensive thing you can ask a 2D context to do. One radial-gradient
 *      sprite per colour, blitted with `drawImage`, is over an order of
 *      magnitude cheaper and looks the same.
 *
 *  3 · Proximity links come from a spatial hash rebuilt each frame, so the
 *      test is local instead of the 45,000 `hypot` calls a 300-node pairwise
 *      scan would need. Each cell only looks at four of its eight neighbours,
 *      which visits every pair exactly once.
 *
 *  4 · There is no `requestAnimationFrame` here. The site runs one loop —
 *      GSAP's ticker, which also drives Lenis — and a second loop would fight
 *      it for the frame and read layout twice.
 *
 *  5 · Motion is scaled by frame delta, so it runs at the same speed on a
 *      144Hz panel as on a 60Hz one.
 *
 *  6 · It stops when it is not being looked at, and it never starts under
 *      `prefers-reduced-motion` — a single static frame is drawn instead.
 */

type Props = {
  /** Node count at desktop width. Halved automatically on small screens. */
  count?: number;
  /** Blob centre as a fraction of the canvas box. */
  originX?: number;
  originY?: number;
  className?: string;
};

/** Node palette — brand orange carries it, teal is the accent minority. */
const PALETTE = ["#fb8038", "#f4661f", "#5bd9cb"] as const;
const LINK_RGB = "251,128,56";
const WIRE_RGB = "255,168,96";

/** Perspective focal length, in the same units as the blob radius. */
const FOV = 560;
/** Screen distance under which two nodes get an ambient proximity link. */
const LINK_DIST = 94;

/* --------------------------------------------------------------------------
   The routes.

   Three chains, not one. A single chain was too quiet — most of the time
   nothing was happening anywhere on the screen, and the one thing that did was
   easy to miss entirely. Three overlapping chains means something is always
   connecting somewhere, and because each carries a different subsystem the
   background ends up saying three true things instead of one.

   They are separated by band rather than by luck: the delivery chain runs
   across the top, the money chain across the middle, the evidence chain along
   the bottom. Overlapping them vertically would produce a tangle no offset
   could fix. Everything sits right of ~0.46 because the hero copy owns the
   left column.

   Each stop rides an actual node of the cloud, so it rotates, breathes and
   parallaxes with everything else — the route is part of the network rather
   than a diagram laid over it. The anchors are re-picked at the top of every
   cycle from front-facing nodes near the intended slots: the sphere turns
   about 31° in one cycle, so a node that starts well in front is still in
   front when the cycle ends, and the re-pick happens during the blank gap
   where nothing is drawn to jump.

   The offsets are deliberately not multiples of each other, so the three never
   fall into step and start reading as one animation with three parts.
   -------------------------------------------------------------------------- */
type Stop = { label: string; x: number; y: number };
type RouteSpec = {
  stops: Stop[];
  /** Seconds into the shared clock at which this route starts its cycle. */
  offset: number;
  /** `true` for the main route: larger type, brighter line, teal endpoint. */
  primary?: boolean;
};

const ROUTES: RouteSpec[] = [
  {
    // the delivery
    primary: true,
    offset: 0,
    stops: [
      { label: "DittoMart Go", x: 0.475, y: 0.22 },
      { label: "3PL Network", x: 0.59, y: 0.35 },
      { label: "Rider", x: 0.7, y: 0.18 },
      { label: "Handover", x: 0.81, y: 0.32 },
      { label: "Customer", x: 0.92, y: 0.2 },
    ],
  },
  {
    // the money
    offset: 2.3,
    stops: [
      { label: "Order in", x: 0.5, y: 0.53 },
      { label: "Wallet gate", x: 0.63, y: 0.62 },
      { label: "Rate card", x: 0.77, y: 0.48 },
      { label: "Invoiced", x: 0.9, y: 0.57 },
    ],
  },
  {
    // the evidence
    offset: 4.1,
    stops: [
      { label: "Pickup photo", x: 0.54, y: 0.79 },
      { label: "Temp sensor", x: 0.71, y: 0.87 },
      { label: "Proof of freshness", x: 0.88, y: 0.76 },
    ],
  },
];

/** Seconds per hop, and the shape of one full cycle. */
const HOP = 0.66;
const ROUTE_START = 0.5;
const ROUTE_HOLD = 1.4;
const ROUTE_FADE = 0.7;
const ROUTE_GAP = 0.5;

const routeLit = (r: RouteSpec) => ROUTE_START + (r.stops.length - 1) * HOP;
const routeCycle = (r: RouteSpec) =>
  routeLit(r) + ROUTE_HOLD + ROUTE_FADE + ROUTE_GAP;

/**
 * Below this the routes are dropped and only the ambient cloud remains.
 * Labelled stops need horizontal room; squeezed onto a phone they overlap
 * each other and the headline, which is worse than not being there.
 */
const ROUTE_MIN_WIDTH = 768;

type Node = {
  theta: number;
  phi: number;
  baseR: number;
  seed: number;
  size: number;
  color: number;
  /** Eased screen position — trails the true projection, which is the lag
      that makes the cloud feel like fluid rather than rigid geometry. */
  x: number;
  y: number;
  depth: number;
};

/** Clamp helper — used enough below that inlining it obscures the intent. */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** A radial-gradient glow, rendered once per colour and then blitted. */
function makeSprite(color: string, dpr: number) {
  const size = Math.round(64 * dpr);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.14, color);
  grad.addColorStop(0.4, `${color}59`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export function RoutingMesh({
  count = 300,
  originX = 0.62,
  originY = 0.48,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const roundRectOk = typeof ctx.roundRect === "function";
    const sprites = PALETTE.map((c) => makeSprite(c, dpr));

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // Draw in CSS pixels; the transform handles the device ratio.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ---------- the cloud ---------- */

    const n = width < 768 ? Math.round(count * 0.42) : count;
    const scale = Math.min(width, height) / 900;
    const spread = Math.max(190, Math.min(width, height) * 0.42);

    const nodes: Node[] = [];
    // Fibonacci placement gives an even shell; the jitter keeps it organic.
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      nodes.push({
        theta: i * golden,
        phi: Math.acos(y) + (Math.random() - 0.5) * 0.22,
        baseR: spread * (0.66 + Math.random() * 0.42),
        seed: Math.random() * 100,
        size: (Math.random() * 2.4 + 1) * Math.max(0.75, scale),
        color: i % 11 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
        x: width * originX,
        y: height * originY,
        depth: 1,
      });
    }

    /* ---------- pointer parallax ---------- */

    let pointerX = 0;
    let pointerY = 0;
    let driftX = 0;
    let driftY = 0;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const onPointer = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / rect.width - 0.5;
      pointerY = (e.clientY - rect.top) / rect.height - 0.5;
    };
    if (fine && !reduced)
      window.addEventListener("pointermove", onPointer, { passive: true });

    /* ---------- the frame ---------- */

    const cells = new Map<number, number[]>();
    const order: number[] = nodes.map((_, i) => i);
    let t = 0;
    let yaw = 0;
    /** One shared clock, in seconds. Each route reads it through its offset. */
    let clock = 0;
    /** Which cloud node each stop of each route is currently riding. */
    const anchors: number[][] = ROUTES.map(() => []);
    /** Last frame's cycle position per route, used to detect the wrap. */
    const lastT: number[] = ROUTES.map(() => 0);
    /** Nodes currently spoken for, so two stops never land on the same one. */
    const claimed = new Set<number>();
    /** Frames spent letting the cloud reach its positions before binding. */
    let warmup = 0;

    /**
     * Bind one route's stops to fresh cloud nodes.
     *
     * A full scan of the cloud per stop — 300 comparisons each — but a route
     * rebinds once per cycle, every six seconds or so, so the cost is
     * irrelevant and the quality of the pick is not: a sampled guess
     * regularly lands two stops on top of each other and the route stops
     * reading as a sequence.
     *
     * `depth > 1.05` keeps the choice to the front half of the sphere. Nodes
     * behind it are the ones that would rotate out of view mid-cycle.
     *
     * `claimed` spans all three routes, and this route's own nodes are
     * released before it re-picks — otherwise the set only ever grows and by
     * the third cycle there is nothing left to choose from.
     */
    const reanchor = (r: number) => {
      for (const i of anchors[r]) claimed.delete(i);

      anchors[r] = ROUTES[r].stops.map((stop) => {
        const tx = width * stop.x;
        const ty = height * stop.y;
        let best = -1;
        let bestScore = -Infinity;
        for (let i = 0; i < n; i++) {
          if (claimed.has(i)) continue;
          const p = nodes[i];
          if (p.depth < 1.05) continue;
          // nearest the slot wins, with a nudge toward nodes further forward
          const score = -Math.hypot(p.x - tx, p.y - ty) + (p.depth - 1) * 260;
          if (score > bestScore) {
            bestScore = score;
            best = i;
          }
        }
        if (best === -1) best = Math.floor(Math.random() * n);
        claimed.add(best);
        return best;
      });
    };

    const reanchorAll = () => ROUTES.forEach((_, r) => reanchor(r));

    const draw = () => {
      const cx = width * originX + driftX;
      const cy = height * originY + driftY;

      // project
      for (let i = 0; i < n; i++) {
        const p = nodes[i];
        const r =
          p.baseR +
          Math.sin(p.seed + t * 0.9) * 30 * scale +
          Math.cos(t * 0.62 + p.seed * 1.7) * 20 * scale;

        const sinPhi = Math.sin(p.phi);
        const a = p.theta + yaw;
        const x3 = r * sinPhi * Math.cos(a);
        const y3 = r * Math.cos(p.phi) * 0.86;
        const z3 = r * sinPhi * Math.sin(a);

        const persp = FOV / (FOV + z3);
        p.depth = persp;

        const tx = cx + x3 * persp;
        const ty = cy + y3 * persp;

        // easing toward the true position — the fluid lag
        p.x += (tx - p.x) * 0.075;
        p.y += (ty - p.y) * 0.075;
      }

      ctx.clearRect(0, 0, width, height);

      /* --- the quiet proximity haze, via a spatial hash --- */
      cells.clear();
      const cs = LINK_DIST;
      for (let i = 0; i < n; i++) {
        const key = ((p: Node) =>
          ((p.x / cs) | 0) * 73856093 + ((p.y / cs) | 0) * 19349663)(nodes[i]);
        const bucket = cells.get(key);
        if (bucket) bucket.push(i);
        else cells.set(key, [i]);
      }

      ctx.lineWidth = 0.7;
      // Only four of the eight neighbours, so every pair is visited once.
      const NEIGHBOURS = [
        [0, 0],
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ];
      for (const [key, bucket] of cells) {
        for (const [dx, dy] of NEIGHBOURS) {
          const other =
            dx === 0 && dy === 0
              ? bucket
              : cells.get(key + dx * 73856093 + dy * 19349663);
          if (!other) continue;
          const same = other === bucket;
          for (let a = 0; a < bucket.length; a++) {
            for (let b = same ? a + 1 : 0; b < other.length; b++) {
              const p1 = nodes[bucket[a]];
              const p2 = nodes[other[b]];
              const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
              if (d >= LINK_DIST) continue;
              // fade with distance, and with how far back the pair sits
              const alpha =
                (1 - d / LINK_DIST) * 0.16 * Math.min(p1.depth, p2.depth);
              ctx.strokeStyle = `rgba(${LINK_RGB},${alpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      /* --- nodes, back to front, additively --- */
      order.sort((a, b) => nodes[a].depth - nodes[b].depth);
      ctx.globalCompositeOperation = "lighter";
      for (let k = 0; k < n; k++) {
        const p = nodes[order[k]];
        const s = p.size * p.depth * 7.5;
        ctx.globalAlpha = Math.max(0, Math.min(1, (p.depth - 0.55) * 1.5)) * 0.85;
        ctx.drawImage(sprites[p.color], p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      ROUTES.forEach((_, r) => drawRoute(r));
    };

    /**
     * One route, drawn over the cloud.
     *
     * A single clock per route drives everything, and every stage is a slice
     * of it. Stop `i` lights at `ROUTE_START + i * HOP`; the segment leaving
     * it draws over the following 80% of a hop, so the line has fully arrived
     * before the next stop wakes — otherwise the chain reads as a handful of
     * things blinking rather than one thing travelling.
     *
     * The two secondary routes are drawn at reduced weight. Three chains at
     * equal strength is a tangle with no subject; one lead and two supporting
     * gives the eye somewhere to start.
     */
    function drawRoute(r: number) {
      const spec = ROUTES[r];
      const stops = spec.stops;
      if (width < ROUTE_MIN_WIDTH || anchors[r].length !== stops.length) return;
      const g = ctx!;

      const cycle = routeCycle(spec);
      const rt = (clock + spec.offset) % cycle;

      // whole-route opacity: solid through the hold, then out, then dark
      const fadeFrom = routeLit(spec) + ROUTE_HOLD;
      const alpha =
        (rt < fadeFrom ? 1 : 1 - clamp01((rt - fadeFrom) / ROUTE_FADE)) *
        (spec.primary ? 1 : 0.72);
      if (alpha <= 0.001) return;

      /* Positions come straight off the anchored nodes, so every stop
         inherits the cloud's rotation, breathing and pointer parallax without
         a line of extra motion code. `pd` is the anchor's depth, used to size
         the stop — a stop further forward is a larger stop. */
      const px: number[] = [];
      const py: number[] = [];
      const pd: number[] = [];
      for (let i = 0; i < stops.length; i++) {
        const node = nodes[anchors[r][i]];
        px.push(node.x);
        py.push(node.y);
        pd.push(node.depth);
      }

      /* --- segments --- */
      g.lineCap = "round";
      for (let i = 0; i < stops.length - 1; i++) {
        const from = ROUTE_START + i * HOP;
        const p = clamp01((rt - from) / (HOP * 0.8));
        if (p <= 0) continue;
        const e = 1 - (1 - p) ** 3;

        g.beginPath();
        g.moveTo(px[i], py[i]);
        g.lineTo(px[i] + (px[i + 1] - px[i]) * e, py[i] + (py[i + 1] - py[i]) * e);
        g.strokeStyle = `rgba(${WIRE_RGB},${(0.62 * alpha).toFixed(3)})`;
        g.lineWidth = spec.primary ? 1.6 : 1.2;
        g.stroke();

        // the payload riding the segment as it draws
        if (p < 1) {
          const s = spec.primary ? 20 : 15;
          g.globalCompositeOperation = "lighter";
          g.globalAlpha = alpha;
          g.drawImage(
            sprites[2],
            px[i] + (px[i + 1] - px[i]) * e - s / 2,
            py[i] + (py[i + 1] - py[i]) * e - s / 2,
            s,
            s
          );
          g.globalAlpha = 1;
          g.globalCompositeOperation = "source-over";
        }
      }

      /* --- stops --- */
      const fs = spec.primary ? 11 : 10;
      g.font = `600 ${fs}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      g.textAlign = "center";
      g.textBaseline = "middle";

      for (let i = 0; i < stops.length; i++) {
        const lit = clamp01((rt - (ROUTE_START + i * HOP)) / 0.32);
        if (lit <= 0) continue;
        const a = alpha * lit;
        // only the lead route ends somewhere that is not us, so only the lead
        // route has a stop in the other colour
        const isEnd = spec.primary === true && i === stops.length - 1;

        // arrival ring, once
        if (lit < 1) {
          g.beginPath();
          g.arc(px[i], py[i], 4 + lit * 16, 0, Math.PI * 2);
          g.strokeStyle = `rgba(${isEnd ? "126,240,221" : WIRE_RGB},${((1 - lit) * 0.55 * alpha).toFixed(3)})`;
          g.lineWidth = 1;
          g.stroke();
        }

        // the glow, then a hard core so the dot has an edge at any size
        const gs = (spec.primary ? 26 : 20) * pd[i];
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = a;
        g.drawImage(sprites[isEnd ? 2 : 0], px[i] - gs / 2, py[i] - gs / 2, gs, gs);
        g.globalAlpha = 1;
        g.globalCompositeOperation = "source-over";

        g.beginPath();
        g.arc(px[i], py[i], (spec.primary ? 3.4 : 2.6) * pd[i], 0, Math.PI * 2);
        g.fillStyle = `rgba(255,255,255,${(0.95 * a).toFixed(3)})`;
        g.fill();

        /* label — kept inside the canvas rather than allowed to run off the
           right edge, which is where the last stops sit */
        const text = stops[i].label.toUpperCase();
        const half = g.measureText(text).width / 2;
        const lx = Math.min(Math.max(px[i], half + 14), width - half - 14);
        const ly = py[i] - (spec.primary ? 22 : 19);

        /* A backing plate, because the cloud behind is bright and uneven.

           `roundRect` is missing on Safari below 16, and an exception thrown
           inside the ticker does not just lose the plate — it kills the frame
           and every frame after it, so the whole hero freezes. A square plate
           on an old browser is a fine outcome; a dead canvas is not. */
        g.fillStyle = `rgba(7,9,13,${(0.62 * a).toFixed(3)})`;
        g.beginPath();
        if (roundRectOk) {
          g.roundRect(lx - half - 8, ly - 9, half * 2 + 16, 18, 9);
          g.fill();
        } else {
          g.fillRect(lx - half - 8, ly - 9, half * 2 + 16, 18);
        }

        g.fillStyle = isEnd
          ? `rgba(126,240,221,${(0.95 * a).toFixed(3)})`
          : `rgba(255,236,220,${((spec.primary ? 0.92 : 0.8) * a).toFixed(3)})`;
        g.fillText(text, lx, ly);
      }

      g.textAlign = "left";
      g.textBaseline = "alphabetic";
    }

    /* ---------- the loop, on the site's single ticker ---------- */

    const tick = (_time: number, deltaTime: number) => {
      // clamped so a stalled tab does not resume with one enormous step
      const ratio = Math.min(deltaTime / 16.667, 3);
      t += 0.006 * ratio;
      yaw += 0.0016 * ratio;
      driftX += (pointerX * 46 - driftX) * 0.045;
      driftY += (pointerY * 30 - driftY) * 0.045;

      // in seconds, so the route constants read as the timings they are
      clock += ratio / 60;

      /* Each route rebinds when its own cycle wraps — which, because the
         offsets differ, is a different moment for each of the three. The wrap
         lands inside that route's blank gap, so there is nothing on screen to
         jump when its stops move to new nodes. */
      for (let r = 0; r < ROUTES.length; r++) {
        const rt = (clock + ROUTES[r].offset) % routeCycle(ROUTES[r]);
        if (rt < lastT[r]) reanchor(r);
        lastT[r] = rt;
      }

      /* The first bind waits for the cloud to reach its positions. Nodes are
         seeded at the centre and ease outward, so anchoring on frame one
         would pick every stop from the same pile at the origin. */
      if (warmup < 34) {
        warmup++;
        if (warmup === 34) reanchorAll();
      }

      draw();
    };

    let running = false;
    const start = () => {
      if (running || reduced) return;
      gsap.ticker.add(tick);
      running = true;
    };
    const stop = () => {
      if (!running) return;
      gsap.ticker.remove(tick);
      running = false;
    };

    if (reduced) {
      // Park the clock inside the primary route's hold so the single static
      // frame shows completed routes rather than an empty stretch of cycle.
      clock = routeLit(ROUTES[0]) + ROUTE_HOLD * 0.5;
      // settle the eased positions, bind the stops, then draw the one frame
      for (let i = 0; i < 40; i++) draw();
      reanchorAll();
      draw();
    } else {
      start();
    }

    // only animate while the hero is actually on screen
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "120px" }
    );
    io.observe(host);

    const onVisibility = () =>
      document.hidden ? stop() : io.takeRecords().length === 0 && start();
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(host);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [count, originX, originY]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
