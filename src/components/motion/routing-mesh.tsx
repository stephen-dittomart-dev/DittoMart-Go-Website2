"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { providers } from "@/lib/providers";

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
  /**
   * Node count at desktop width. Halved automatically on small screens.
   *
   * Back to the full three hundred. It was thinned when the proximity lines
   * came out, on the theory that the ring could not be read through that many
   * dots — but what actually separates them is not scarcity, it is that the
   * ring's dots carry a hard white core and these do not. With that in place
   * the cloud can be as dense as it ever was and the ring still resolves.
   */
  count?: number;
  /** Blob centre as a fraction of the canvas box. */
  originX?: number;
  originY?: number;
  /**
   * Holds the arrival on its first frame until the caller says go.
   *
   * The home page opens behind a full-screen intro, and the mesh is mounted
   * underneath it the whole time. Left to start on mount, most of the flight
   * happens behind that overlay and the reader arrives to a cloud already
   * two-thirds of the way in — the one part of it worth watching is the part
   * nobody sees.
   *
   * Only the flight waits. The cloud is still simulated and still drawn from
   * the first frame, parked small and far out at the start of its arc, so
   * there is nothing to warm up at the handover and the first visible frame
   * of the flight is genuinely its first frame.
   *
   * Defaults to `true` so every other mount is unaffected.
   */
  play?: boolean;
  className?: string;
};

/** Node palette — brand orange carries it, teal is the accent minority. */
const PALETTE = ["#fb8038", "#f4661f", "#5bd9cb"] as const;
const LINK_RGB = "251,128,56";
const WIRE_RGB = "255,168,96";

/** Perspective focal length, in the same units as the blob radius. */
const FOV = 560;
/* --------------------------------------------------------------------------
   The orbit.

   Taken from the real provider list rather than written out here, so the ring
   is the networks — in the order the rest of the site meets them, ONDC first —
   and cannot drift out of step with the pages that list them.
   -------------------------------------------------------------------------- */
const ORBIT = providers.map((p) => p.short || p.name);
/** Ring radius, as a fraction of the nucleus's own scale. */
const ORBIT_R = 0.62;
/**
 * How far the ellipse is squashed vertically — the ring's apparent lean.
 *
 * Not lower than this. The nucleus carries a wordmark ring of its own, and at
 * 0.4 the orbit was wider than it horizontally but *shorter* vertically — so
 * its top and bottom dots sat inside that ring and the two read as one muddle.
 * The orbit has to enclose the nucleus on both axes to be a ring around it.
 */
const ORBIT_FLAT = 0.68;
/** How far behind the head the tail runs, in segments. */
const ORBIT_TRAIL = 2;
/**
 * Seconds per link. One connection is being made at any moment, never two.
 *
 * Nearly twice what it was. At 0.9s the line crossed faster than the eye
 * follows it, and the name attached to each arrival was gone before it could
 * be read. Everything else in here is expressed as a fraction of this, so
 * slowing it slows the whole figure in step — the travel, the dwell at each
 * dot and the name that goes with it.
 */
const ORBIT_HOP = 1.7;

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

/**
 * The three route chains, off.
 *
 * They did the same job the orbit does — draw a connection, name the thing it
 * reaches — but strung across the whole frame rather than around the core.
 * With both running, the canvas had two systems making connections and
 * labelling them, and the routes' long straight lines cut across everything
 * else with nothing to anchor them. That was the mess.
 *
 * The orbit inherits the job and does it in one place, at the centre, tied to
 * the actual network list. These are kept rather than deleted because the
 * copy they carry is good and the chains may earn their place again somewhere
 * with room for them. Flip to `true` and they come back exactly as they were.
 */
const ROUTES_ON = false;

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
 * Below this the cloud takes the middle of the frame.
 *
 * The origin the caller gives is off to one side because on a desktop the
 * cloud shares the frame with the copy column and has to keep out of its way.
 * Below `lg` there is no column beside it — the copy is above it, across the
 * full width — so an off-centre cloud is simply off centre, which is what it
 * looked like.
 *
 * Both axes, not just the horizontal one, because the hero's exit zooms this
 * canvas from its own middle. Centre the cloud in the frame and the thing that
 * grows is the thing you were looking at; leave it anywhere else and the zoom
 * pushes it further off as it goes.
 */
const CENTRE_BELOW = 1024;

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

/* --------------------------------------------------------------------------
   The arrival.

   The cloud used to be simply *there* on the first frame, at full size in its
   final position, already wired up. After the page's own opening that reads as
   a still image someone remembered to switch on — the hero animates in and the
   thing occupying most of it does not.

   So it flies in. It starts small and far out past the left edge, swings
   through a low arc, grows as it comes, and decelerates into its resting
   place. One object crossing the frame, which is a far stronger read than a
   fade, because a fade says "this appeared" and a curve says "this came from
   somewhere".

   Three things make it read as distance rather than as a scaling sprite:

    · the arc. A straight slide in from the left is a slide; the vertical bow
      is what turns the same motion into a path through space.

    · the spin. It turns much faster while it is far away and settles to its
      ambient rate as it lands, the way anything tumbling does as it is caught.

    · nothing is wired up until it stops. The proximity links and all three
      routes stay dark for the whole flight and only then come up. A network
      drawing itself *after* the nodes have settled is the product's own
      claim — the parts arrive first, the connections are made second — and it
      also keeps the busiest part of the frame out of the busiest moment.
   -------------------------------------------------------------------------- */

/** Seconds of stillness first, so the headline lands before this starts. */
const ARRIVE_DELAY = 0.45;
/** Seconds of flight. Long enough to read as travel, short enough to not wait. */
const ARRIVE_DUR = 2.6;
/** How far left of centre it starts, as a fraction of the frame. */
const ARRIVE_FROM = 0.82;
/** How deep the arc bows, as a fraction of the frame's height. */
const ARRIVE_BOW = 0.22;
/** Size on the first frame, relative to its resting size. */
const ARRIVE_SCALE = 0.1;
/** Fraction of the flight after which the links begin to come up. */
const REVEAL_AT = 0.86;
/** Seconds the links and routes take to fade in once they start. */
const REVEAL_DUR = 1.1;

/* --------------------------------------------------------------------------
   The nucleus.

   The cloud is a shell, so its middle is hollow — a bright ring of nodes
   around a hole. That hole is the one place on the whole canvas where
   something can be put without competing with anything, and it is also dead
   centre of the thing the eye is already tracking.

   So: a core, three electron shells around it, and the wordmark running the
   ring outside them. An atom is the right figure for what is underneath —
   separate networks bound around one centre — and it is the only element here
   that names the product rather than describing it.

   It lights at 85% of the flight and comes up slowly, over longer than the
   rest of the flight has left. Two reasons it is not simply switched on at
   the end: a core appearing at full strength on the frame the cloud stops
   reads as a second, unrelated event, and starting it while there is still
   travel left means it arrives *with* the cloud rather than after it.
   -------------------------------------------------------------------------- */

/** Fraction of the flight at which the core begins to light. */
const CORE_AT = 0.85;
/** Seconds it takes to come fully up. Deliberately the slowest thing here. */
const CORE_DUR = 1.9;
/** Repeated around the ring. The separator is what keeps repeats legible. */
const CORE_WORD = "DITTOMART GO • ";

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
  play = true,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Read through a ref rather than a dependency. `play` flips once, at the
     handover, and rebuilding the effect there would tear down the canvas and
     reseed all 300 nodes on the exact frame the flight is meant to begin. */
  const playRef = useRef(play);
  playRef.current = play;

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

    /* Read through a function rather than captured once, so a rotation or a
       window drag across the breakpoint moves the cloud without the canvas
       having to be rebuilt. */
    const ox = () => (width < CENTRE_BELOW ? 0.5 : originX);
    const oy = () => (width < CENTRE_BELOW ? 0.5 : originY);

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
        x: width * ox(),
        y: height * oy(),
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

    /* The arrival's own clock, in seconds, running from mount. Under reduced
       motion it starts already spent, so the single static frame is drawn with
       the cloud at rest and everything wired up. */
    let flight = reduced ? ARRIVE_DELAY + ARRIVE_DUR + REVEAL_DUR : 0;
    /** Flight progress, 0 → 1. Read by both `draw` and `tick`. */
    let arrive = reduced ? 1 : 0;
    /** How wired-up the cloud is, 0 → 1. Gates the links and all three routes. */
    let reveal = reduced ? 1 : 0;
    /** How far up the nucleus is, 0 → 1. */
    let core = reduced ? 1 : 0;
    /** The wordmark ring's own angle, in radians. */
    let ring = 0;
    /** The orbit's own angle. Slower than the wordmark, and the other way. */
    let orbitA = 0;

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

    /**
     * The orbit — the networks, ringed around the core.
     *
     * This replaced the proximity haze that used to live here: every node in
     * the cloud wired to whichever neighbours happened to be near it on
     * screen. That said "things are connected" but nothing more, and with
     * three hundred nodes it said it very loudly — a permanent web of faint
     * lines that the routes and the nucleus both had to compete with.
     *
     * A ring of nine says something specific instead. Nine is the number of
     * networks, the names are the networks, and they are drawn *around* the
     * core because that is the actual shape of the product: one thing in the
     * middle, nine reachable through it.
     *
     * The dots are only dots. Nothing joins them permanently — a nine-sided
     * outline sitting there is a shape, and a shape is not what this is about.
     * The one line on screen is the connection currently being made, crawling
     * from dot to dot, and it is short: the tail lets go of the segment behind
     * as the head takes the one ahead.
     *
     * One name at a time, on the dot the head has reached, in and out with the
     * arrival. Nine names on a ring is the messy version and no amount of
     * placement fixes it.
     */
    const drawOrbit = (cx: number, cy: number, base: number) => {
      const g = ctx!;
      const N = ORBIT.length;
      const R = base * ORBIT_R;

      /* A true ellipse centred on the core, not a projected circle.
      
         The first version put the ring in a tilted plane and pushed it through
         the same perspective divide the cloud uses. That is honest 3D and it
         is exactly why it looked wrong: perspective maps a tilted circle to an
         ellipse whose centre is *not* the projection of the circle's centre —
         it slides toward the near side. So the ring sat off the nucleus, and
         its radius was visibly larger on the near half than the far half.
      
         Here the position is a plain ellipse: constant radius, squashed
         vertically, centred on `cx`/`cy` by construction. Depth survives as a
         number used only for size, brightness and paint order, which is what
         was carrying the three-dimensionality anyway. */
      const pts: { x: number; y: number; d: number }[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + orbitA;
        pts.push({
          x: cx + Math.cos(a) * R,
          y: cy + Math.sin(a) * R * ORBIT_FLAT,
          // 1 at the near (lower) edge, 0 at the far edge
          d: (Math.sin(a) + 1) / 2,
        });
      }

      /* The head, in segments, eased inside each one.
      
         `floor` picks the segment and the ease shapes the crossing, so the
         head accelerates away from a dot and settles onto the next rather than
         sliding at a constant rate past both. That settling is what makes each
         arrival read as an arrival. */
      const raw = clock / ORBIT_HOP;
      const seg = Math.floor(raw);
      const f = raw - seg;
      const eased = f < 0.5 ? 4 * f ** 3 : 1 - (-2 * f + 2) ** 3 / 2;
      const headAt = seg + eased;
      const tailAt = headAt - ORBIT_TRAIL;

      const at = (t: number) => {
        const i = Math.floor(t);
        const k = t - i;
        const A = pts[((i % N) + N) % N];
        const B = pts[(((i + 1) % N) + N) % N];
        return { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k };
      };

      /* The connection: a length of line that crawls the ring rather than a
         ring that fills in.
      
         Head and tail are the same distance apart at all times — `ORBIT_TRAIL`
         segments — so the line is always exactly that long. When the head
         settles on a dot the tail is settling on the dot two back, and it
         releases the segment behind it as the head takes the one ahead. There
         is never a completed polygon on screen, which is the whole point: the
         dots are dots, and the only line is the connection currently being
         made. */
      g.lineCap = "round";
      g.lineJoin = "round";
      g.strokeStyle = `rgba(${WIRE_RGB},${(0.8 * reveal).toFixed(3)})`;
      g.lineWidth = 1.6;
      g.beginPath();
      const start = at(tailAt);
      g.moveTo(start.x, start.y);
      // through every node the line currently spans, then to the head
      for (let k = Math.ceil(tailAt); k < headAt; k++) {
        const q = pts[((k % N) + N) % N];
        g.lineTo(q.x, q.y);
      }
      const tip = at(headAt);
      g.lineTo(tip.x, tip.y);
      g.stroke();

      // the head itself, a bright point riding the end of the line
      const hs = 20;
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = reveal;
      g.drawImage(sprites[2], tip.x - hs / 2, tip.y - hs / 2, hs, hs);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";

      /* Dots, back to front, each lit by how close the head is to it.
      
         A dot ahead of the head lights as it is approached — inside the last
         part of a segment — and dots behind fade out over the length of the
         trail. That is the sequence asked for: one lights, the line travels to
         it, and the next lights as it arrives. */
      const glowAt = (i: number) => {
        let d = i - headAt;
        d -= Math.round(d / N) * N;              // shortest way round the ring
        return d >= 0 ? clamp01(1 - d / 0.55) : clamp01(1 + d / ORBIT_TRAIL);
      };

      const order2 = Array.from({ length: N }, (_, i) => i).sort(
        (a, b) => pts[a].d - pts[b].d
      );
      for (const i of order2) {
        const q = pts[i];
        const lit2 = glowAt(i);
        const depth = 0.68 + 0.32 * q.d;
        /* Brighter and larger than a cloud node on purpose. They occupy the
           same frame as three hundred other dots, and a ring made of the same
           dot as the backdrop is not a ring — it is more backdrop. */
        const gs = (32 + 26 * lit2) * depth;

        g.globalCompositeOperation = "lighter";
        g.globalAlpha = reveal * (0.62 + 0.38 * lit2) * depth;
        g.drawImage(sprites[lit2 > 0.5 ? 0 : 1], q.x - gs / 2, q.y - gs / 2, gs, gs);
        g.globalAlpha = 1;
        g.globalCompositeOperation = "source-over";

        g.beginPath();
        /* A hard white centre, which no cloud node has. The glow alone was
           not enough to tell them apart — the backdrop is made of glows — but
           a solid core reads as a different kind of object at any size, and it
           is what makes nine dots legible as a set rather than as nine more
           stars. */
        g.arc(q.x, q.y, (3.6 + 2.2 * lit2) * depth, 0, Math.PI * 2);
        g.fillStyle = `rgba(255,255,255,${((0.86 + 0.14 * lit2) * reveal).toFixed(3)})`;
        g.fill();
      }

      /* The name tag, on the dot the head is on.
      
         Up as the head arrives, out as it leaves — so exactly one name is on
         screen and only while its connection is being made. `f` is the
         position inside the current segment, which makes both edges free: the
         tag is absent while the line is crossing and present once it has
         landed. */
      /* The name of whichever dot the head is nearest — every one of the
         nine, all the way round.
      
         It used to be skipped for dots on the left, where the tag would land
         on the copy column, so those networks were never named. Naming some
         and not others is worse than a plate briefly over a line of text, so
         the plate is opaque enough to read wherever it lands and every dot
         gets its turn.
      
         Keyed to the head's distance from the dot rather than to a slice of
         the segment, which is what ties it to the travel: full while the head
         is settled on a dot, gone by the middle of a crossing, back as it
         settles on the next. Slow the crossing and the name simply stays
         longer — there is no second number to keep in step.
      
         Still nothing below `lg`: there the column is the full width and the
         ring is behind it, so a name is not a label, it is text over text. */
      if (width < 1024) return;

      const near = Math.round(headAt);
      const target = ((near % N) + N) % N;
      const q = pts[target];

      const name = ORBIT[target].toUpperCase();
      const la = reveal * clamp01(1 - Math.abs(headAt - near) / 0.4);
      if (la <= 0.002) return;
      g.font = "600 10.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      g.textAlign = "center";
      g.textBaseline = "middle";
      const half = g.measureText(name).width / 2;
      const lx = Math.min(Math.max(q.x, half + 14), width - half - 14);
      const ly = q.y - 22;

      g.fillStyle = `rgba(7,9,13,${(0.9 * la).toFixed(3)})`;
      g.beginPath();
      if (roundRectOk) {
        g.roundRect(lx - half - 9, ly - 9, half * 2 + 18, 18, 9);
        g.fill();
      } else {
        g.fillRect(lx - half - 9, ly - 9, half * 2 + 18, 18);
      }
      g.fillStyle = `rgba(255,236,220,${(0.95 * la).toFixed(3)})`;
      g.fillText(name, lx, ly);

      g.textAlign = "left";
      g.textBaseline = "alphabetic";
    };

    /**
     * The nucleus, at the centre of the cloud.
     *
     * `cx`/`cy` are the cloud's own centre, so this rides the arrival, the
     * pointer parallax and everything else for free rather than having a
     * position of its own to keep in sync.
     *
     * Everything is a fraction of `base`, which is the cloud's own radius
     * scaled by the flight. There is no fixed pixel size anywhere in here: the
     * atom is a constant proportion of the cloud at every viewport, and it
     * grows in with it rather than being composited on afterwards.
     */
    const drawNucleus = (cx: number, cy: number, s: number) => {
      if (core <= 0.002) return;
      const g = ctx!;
      const a = core;
      /* It opens outward as it lights, so the shells look like they are being
         drawn out of the core rather than fading up in place. */
      const base = spread * s * (0.72 + 0.28 * a);
      const pulse = 1 + Math.sin(t * 2.6) * 0.05;

      /* --- three electron shells ---

         Each is an ellipse whose minor axis is driven by its own spin, so it
         flattens to a line and opens out again — which is a circle seen from a
         rotating angle, and reads as three orbits in three planes rather than
         three flat rings stacked on top of each other. The floor of 0.14 stops
         one vanishing completely as it passes edge-on. */
      g.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const tilt = (i * Math.PI) / 3 + t * 0.13;
        const spin = t * 1.15 + i * 2.1;
        const rx = base * 0.2;
        const ry = rx * (0.14 + Math.abs(Math.cos(spin)) * 0.86);

        g.strokeStyle = `rgba(${WIRE_RGB},${(0.3 * a).toFixed(3)})`;
        g.beginPath();
        g.ellipse(cx, cy, rx, ry, tilt, 0, Math.PI * 2);
        g.stroke();

        // the electron, on the shell's own plane
        const ea = t * 2.1 + i * 2.4;
        const lx = Math.cos(ea) * rx;
        const ly = Math.sin(ea) * ry;
        const ex = cx + lx * Math.cos(tilt) - ly * Math.sin(tilt);
        const ey = cy + lx * Math.sin(tilt) + ly * Math.cos(tilt);
        const es = base * 0.045;
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = a;
        g.drawImage(sprites[2], ex - es / 2, ey - es / 2, es, es);
        g.globalAlpha = 1;
        g.globalCompositeOperation = "source-over";
      }

      /* --- the core: a wide glow, and a hard white centre inside it --- */
      const cs = base * 0.34 * pulse;
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = a;
      g.drawImage(sprites[0], cx - cs / 2, cy - cs / 2, cs, cs);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";

      g.beginPath();
      g.arc(cx, cy, base * 0.03 * pulse, 0, Math.PI * 2);
      g.fillStyle = `rgba(255,255,255,${(0.92 * a).toFixed(3)})`;
      g.fill();

      /* --- the wordmark, running the ring outside the shells ---

         Dropped below the width where the routes are dropped, for the same
         reason: it needs the room to stay legible, and it does not have it on
         a phone.

         The ring is filled by repeating the phrase, and how many times is
         solved rather than chosen. Monospace means every glyph occupies the
         same arc, so dividing the circle evenly by the character count places
         them exactly — and picking the repeat count from the circumference
         keeps the letter spacing identical at every viewport instead of
         stretching on a wide monitor and colliding on a laptop. */
      if (width < ROUTE_MIN_WIDTH) return;

      const R = base * 0.3;
      const fs = Math.max(10, Math.min(19, R * 0.2));
      const slots = Math.round((2 * Math.PI * R) / (fs * 0.62));
      const reps = Math.max(1, Math.round(slots / CORE_WORD.length));
      const text = CORE_WORD.repeat(reps);
      const step = (Math.PI * 2) / text.length;

      g.save();
      g.translate(cx, cy);
      g.rotate(ring);
      g.font = `700 ${fs.toFixed(1)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = `rgba(255,240,228,${(0.9 * a).toFixed(3)})`;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") continue;
        g.save();
        /* Rotate to the glyph's slot, step out to the ring, draw upright in
           that frame — which puts the letter tangent to the circle. Each one
           is rendered by the normal text pipeline at its full size, so it is
           as sharp as any other type on the page; nothing here is a scaled
           bitmap. */
        g.rotate(i * step);
        g.translate(0, -R);
        g.fillText(text[i], 0, 0);
        g.restore();
      }
      g.restore();

      g.textAlign = "left";
      g.textBaseline = "alphabetic";
    };

    const draw = () => {
      /* The flight, resolved into an offset and a size.

         `ease` decelerates hard — it covers most of the distance early and
         spends the last third of the time barely moving, which is what makes
         it arrive rather than stop. The bow is a half-sine of the *remaining*
         distance, so it is zero at both ends by construction: no arriving at
         the right place from the wrong height, at any duration.

         The size runs on a gentler curve than the position, so it is still
         visibly growing after the horizontal travel has all but finished. Tied
         to the same curve it would reach full size while still well out to the
         left, and the last of the flight would read as a slide. */
      const ease = 1 - (1 - arrive) ** 3.2;
      const left = 1 - ease;
      const arrX = -left * width * ARRIVE_FROM;
      const arrY = Math.sin(left * Math.PI * 0.85) * height * ARRIVE_BOW;
      const arrS = ARRIVE_SCALE + (1 - ARRIVE_SCALE) * (1 - (1 - arrive) ** 2);

      /* Pointer parallax is held off until it lands. Dragging a cloud that is
         still flying in toward the cursor fights the arc it is already on. */
      const cx = width * ox() + arrX + driftX * ease;
      const cy = height * oy() + arrY + driftY * ease;

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

        const tx = cx + x3 * persp * arrS;
        const ty = cy + y3 * persp * arrS;

        /* Easing toward the true position — the fluid lag.

           It has to be much stiffer during the flight. At the resting rate the
           cloud trails the arc by a third of a second, which at arrival speed
           is most of a screen: the nodes would still be strung out to the left
           long after the centre had stopped, and would then crawl into place.
           Stiff while travelling, slack once it lands. */
        const k = 0.075 + (1 - ease) * 0.3;
        p.x += (tx - p.x) * k;
        p.y += (ty - p.y) * k;
      }

      ctx.clearRect(0, 0, width, height);

      /* --- the quiet proximity haze, via a spatial hash ---

         Skipped outright while the cloud is still on its way in, which is both
         the effect that was asked for and, incidentally, the cheapest possible
         version of the most expensive frames: a cloud at a tenth of its size
         has every node inside every other node's link radius, so this is
         exactly when the pair test would degenerate into the full quadratic
         scan the spatial hash exists to avoid. */


      /* --- nodes, back to front, additively --- */
      order.sort((a, b) => nodes[a].depth - nodes[b].depth);
      ctx.globalCompositeOperation = "lighter";
      for (let k = 0; k < n; k++) {
        const p = nodes[order[k]];
        /* Never below about a third of its resting size, however far out the
           cloud is. Scaled honestly with the flight the nodes land under a
           pixel across, and a sub-pixel sprite does not read as a distant
           object — it reads as nothing at all, and the arrival begins with an
           empty frame. Slightly-too-large-when-far is the right lie. */
        /* The flash.
        
           Each node carries its own phase, so at any moment a handful of them
           are mid-spike and the rest are at rest — which is what reads as
           current running through the cloud rather than as everything
           breathing together. The spike is short against its cycle, a half
           sine so it has no corners, and it lifts size and brightness at once
           because a flash that only brightens looks like a fade.
        
           `seed` is reused as the phase. It is already a per-node random and
           is otherwise only used for the breathing, so the two are decorrelated
           by construction. */
        const fp = (t * 0.42 + p.seed) % 1;
        const fl = fp < 0.055 ? Math.sin((fp / 0.055) * Math.PI) : 0;

        const s = p.size * p.depth * 7.5 * (0.34 + 0.66 * arrS) * (1 + fl * 0.9);
        ctx.globalAlpha =
          Math.max(0, Math.min(1, (p.depth - 0.55) * 1.5)) * (0.85 + fl * 0.6);
        ctx.drawImage(sprites[p.color], p.x - s / 2, p.y - s / 2, s, s);

        /* A hard point at the peak of the spike only. It is what makes it a
           flash rather than a swell — but it must not persist, or the cloud
           acquires the very cores that tell the ring apart from it. */
        if (fl > 0.72) {
          ctx.globalAlpha = (fl - 0.72) * 3.5 * 0.9;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.05 * p.depth, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      /* Over the cloud, under the routes. The routes carry labels on solid
         plates and are the one thing here that must never be read through
         something else. */
      drawNucleus(cx, cy, arrS);
      if (reveal > 0.002) {
        // the same `base` the nucleus uses, so the ring is locked to it
        drawOrbit(cx, cy, spread * arrS * (0.72 + 0.28 * core));
      }

      if (ROUTES_ON) ROUTES.forEach((_, r) => drawRoute(r));
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
      if (reveal <= 0.002) return;
      const g = ctx!;

      const cycle = routeCycle(spec);
      const rt = (clock + spec.offset) % cycle;

      // whole-route opacity: solid through the hold, then out, then dark
      const fadeFrom = routeLit(spec) + ROUTE_HOLD;
      const alpha =
        (rt < fadeFrom ? 1 : 1 - clamp01((rt - fadeFrom) / ROUTE_FADE)) *
        (spec.primary ? 1 : 0.72) *
        reveal;
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

      /* The flight, and the two things derived from it.

         `arrive` is the travel; `reveal` starts near the end of it and runs on
         past the landing, so the links come up over a cloud that has already
         stopped rather than over one still moving. */
      // Held at zero until the caller releases it — see `play`.
      if (playRef.current) flight += ratio / 60;
      arrive = clamp01((flight - ARRIVE_DELAY) / ARRIVE_DUR);
      reveal = clamp01(
        (flight - (ARRIVE_DELAY + ARRIVE_DUR * REVEAL_AT)) / REVEAL_DUR
      );
      core = clamp01(
        (flight - (ARRIVE_DELAY + ARRIVE_DUR * CORE_AT)) / CORE_DUR
      );
      // one revolution in roughly seventeen seconds — moving, never busy
      ring += 0.006 * ratio;
      /* The orbit turns the other way and slower still. Two rings going the
         same way at similar rates read as one wobbling object. */
      orbitA -= 0.0022 * ratio;

      t += 0.006 * ratio;
      /* It tumbles on the way in and settles to its ambient rate as it lands.
         A cloud crossing the frame at a constant, sedate spin looks like a
         picture being panned; the extra rotation while it is far out is most
         of what sells the distance. */
      yaw += 0.0016 * ratio * (1 + (1 - arrive) ** 2 * 6);
      driftX += (pointerX * 46 - driftX) * 0.045;
      driftY += (pointerY * 30 - driftY) * 0.045;

      /* The route clock is held at zero until the cloud has landed, so the
         first cycle starts from its own beginning. Left running through the
         flight it would be several seconds in by the time anything was
         visible, and the first thing seen would be a route already half drawn
         or fading out. */
      if (warmup >= 34) clock += ratio / 60;

      /* Each route rebinds when its own cycle wraps — which, because the
         offsets differ, is a different moment for each of the three. The wrap
         lands inside that route's blank gap, so there is nothing on screen to
         jump when its stops move to new nodes. */
      if (ROUTES_ON) {
        for (let r = 0; r < ROUTES.length; r++) {
          const rt = (clock + ROUTES[r].offset) % routeCycle(ROUTES[r]);
          if (rt < lastT[r]) reanchor(r);
          lastT[r] = rt;
        }
      }

      /* The first bind waits for the cloud to reach its positions — and now
         also for it to have arrived at all. Stops are chosen as the nodes
         nearest their viewport slots, so binding mid-flight would pick every
         one of them out of a small bright huddle away to the left, and the
         routes would come up as a knot rather than as three chains crossing
         the frame. */
      if (arrive >= 1 && warmup < 34) {
        warmup++;
        if (warmup === 34 && ROUTES_ON) reanchorAll();
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
      if (ROUTES_ON) reanchorAll();
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
