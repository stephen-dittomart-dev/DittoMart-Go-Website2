"use client";

import { CanvasHost, useCanvasScene } from "@/components/motion/canvas-scene";

/**
 * One hero visual per inner page.
 *
 * The brief was "a unique animation on every page", and the trap in that brief
 * is to build one effect and recolour it five times — which reads as one
 * effect, recoloured five times. So each of these is a different *kind* of
 * drawing, not a different palette:
 *
 *   network     orbital mechanics — structured rings, depth-sorted
 *   platform    a circuit schematic — orthogonal traces and gates
 *   developers  typography — a live request log, drawn as text
 *   cold chain  a line graph — a temperature trace with a tolerance band
 *   contact     a radar sweep — polar, one moving arm
 *
 * None of them resembles the home hero's organic node cloud, which is the
 * point: the reader should be able to tell which page they are on from a
 * thumbnail of the top-right corner.
 *
 * All five read their colours from the surrounding `Scene` palette, so a page
 * that changes scene changes its visual with no edit here.
 */

/** Any CSS colour → an "r,g,b" triple usable inside rgba(). */
function rgb(input: string) {
  const s = input.trim();
  if (s.startsWith("#")) {
    const hex =
      s.length === 4
        ? s
            .slice(1)
            .split("")
            .map((c) => c + c)
            .join("")
        : s.slice(1, 7);
    const n = parseInt(hex, 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  const m = s.match(/-?\d+\.?\d*/g);
  return m && m.length >= 3 ? `${m[0]},${m[1]},${m[2]}` : "251,128,56";
}

const CANVAS = "absolute inset-0 h-full w-full";

/* ==========================================================================
   /network — orbital constellation
   A hub with three supply rails around it and nine carriers riding them.
   Depth comes from where a node is on its ellipse, so nodes at the front are
   larger, brighter and drawn last.
   ========================================================================== */

export function NetworkOrbitScene() {
  const ref = useCanvasScene((ctx, w, h, v) => {
    const P = rgb(v("--primary"));
    const A = rgb(v("--accent", "#5bd9cb"));
    const L = rgb(v("--fg-subtle", "#748394"));

    const cx = w * 0.5;
    const cy = h * 0.52;
    const R = Math.min(w, h) * 0.44;
    const tilt = -0.34;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    // three rails — 3PL fleets, direct agency fleets, the ONDC network
    const rails = [
      { rx: R * 0.52, ry: R * 0.19, speed: 0.42, count: 3, colour: P },
      { rx: R * 0.78, ry: R * 0.29, speed: -0.3, count: 3, colour: P },
      { rx: R * 1.04, ry: R * 0.39, speed: 0.21, count: 3, colour: A },
    ];

    const nodes = rails.flatMap((rail, ri) =>
      Array.from({ length: rail.count }, (_, i) => ({
        rail,
        angle: (i / rail.count) * Math.PI * 2 + ri * 0.8,
        size: 3.4 - ri * 0.35,
        /** phase of the packet currently running hub → node */
        pulse: Math.random(),
      }))
    );

    return (t, dt) => {
      ctx.clearRect(0, 0, w, h);

      // rails
      ctx.lineWidth = 1;
      for (const rail of rails) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, rail.rx, rail.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${L},0.2)`;
        ctx.stroke();
        ctx.restore();
      }

      // hub — a slow breath so the centre is never quite still
      const breath = 1 + Math.sin(t * 1.4) * 0.07;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 * breath, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${P},0.4)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${P},0.95)`;
      ctx.fill();

      const placed = nodes.map((n) => {
        n.angle += n.rail.speed * 0.004 * dt;
        n.pulse = (n.pulse + 0.0055 * dt) % 1;
        const ex = Math.cos(n.angle) * n.rail.rx;
        const ey = Math.sin(n.angle) * n.rail.ry;
        return {
          n,
          x: cx + ex * cosT - ey * sinT,
          y: cy + ex * sinT + ey * cosT,
          // +1 at the front of the ellipse, 0 at the back
          depth: (Math.sin(n.angle) + 1) / 2,
        };
      });

      placed.sort((a, b) => a.depth - b.depth);

      ctx.globalCompositeOperation = "lighter";
      for (const p of placed) {
        const c = p.n.rail.colour;
        // spoke back to the hub
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(${c},${(0.06 + p.depth * 0.14).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // the packet in transit on that spoke
        const e = p.n.pulse;
        ctx.beginPath();
        ctx.arc(
          cx + (p.x - cx) * e,
          cy + (p.y - cy) * e,
          1.8,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(${A},${(Math.sin(e * Math.PI) * 0.85).toFixed(3)})`;
        ctx.fill();

        // the carrier itself
        const s = p.n.size * (0.62 + p.depth * 0.7);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 5);
        grad.addColorStop(0, `rgba(255,255,255,${0.5 + p.depth * 0.45})`);
        grad.addColorStop(0.25, `rgba(${c},${0.5 + p.depth * 0.4})`);
        grad.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
  });

  return (
    <CanvasHost>
      <canvas ref={ref} className={CANVAS} />
    </CanvasHost>
  );
}

/* ==========================================================================
   /platform — the engine pipeline
   Four lanes, one per engine, wired like a board. Work enters on the left and
   steps through gates; some of it drops a lane, which is what the allocation
   engine actually does to an order.
   ========================================================================== */

export function EnginePipelineScene() {
  const ref = useCanvasScene((ctx, w, h, v) => {
    const P = rgb(v("--primary"));
    const A = rgb(v("--accent", "#5bd9cb"));
    const L = rgb(v("--fg-subtle", "#748394"));

    const LANES = 4;
    const x0 = w * 0.08;
    const x1 = w * 0.92;
    const laneY = (i: number) => h * (0.2 + i * 0.2);
    const gateX = [0.2, 0.46, 0.72].map((f) => x0 + (x1 - x0) * f);
    const dropX = [0.33, 0.59, 0.85].map((f) => x0 + (x1 - x0) * f);

    const flash = gateX.map(() => new Array(LANES).fill(0));

    const packets = Array.from({ length: 11 }, () => {
      const lane = Math.floor(Math.random() * LANES);
      return {
        lane,
        y: laneY(lane),
        x: x0 + Math.random() * (x1 - x0),
        speed: 0.7 + Math.random() * 0.9,
        hot: Math.random() < 0.3,
        lastDrop: -1,
      };
    });

    return (_t, dt) => {
      ctx.clearRect(0, 0, w, h);

      // lane tracks
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${L},0.22)`;
      for (let i = 0; i < LANES; i++) {
        const y = laneY(i);
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
      }

      // the elbows a packet can take down to the next engine
      ctx.strokeStyle = `rgba(${L},0.14)`;
      for (const dx of dropX) {
        for (let i = 0; i < LANES - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(dx, laneY(i));
          ctx.lineTo(dx, laneY(i + 1));
          ctx.stroke();
        }
      }

      // gates
      for (let g = 0; g < gateX.length; g++) {
        for (let i = 0; i < LANES; i++) {
          const f = (flash[g][i] = Math.max(0, flash[g][i] - 0.045 * dt));
          const x = gateX[g];
          const y = laneY(i);
          ctx.beginPath();
          ctx.rect(x - 5, y - 5, 10, 10);
          ctx.strokeStyle = `rgba(${P},${(0.28 + f * 0.7).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          if (f > 0.01) {
            ctx.fillStyle = `rgba(${P},${(f * 0.5).toFixed(3)})`;
            ctx.fillRect(x - 5, y - 5, 10, 10);
          }
        }
      }

      // packets
      ctx.globalCompositeOperation = "lighter";
      for (const p of packets) {
        const prev = p.x;
        p.x += p.speed * dt;

        for (let g = 0; g < gateX.length; g++) {
          if (prev < gateX[g] && p.x >= gateX[g]) flash[g][p.lane] = 1;
        }
        for (let d = 0; d < dropX.length; d++) {
          if (prev < dropX[d] && p.x >= dropX[d] && d !== p.lastDrop) {
            if (Math.random() < 0.42 && p.lane < LANES - 1) {
              p.lane += 1;
              p.lastDrop = d;
            }
          }
        }
        if (p.x > x1) {
          p.x = x0;
          p.lane = Math.floor(Math.random() * 2);
          p.lastDrop = -1;
          p.hot = Math.random() < 0.3;
        }

        // the vertical move is eased, so a lane change reads as a decision
        p.y += (laneY(p.lane) - p.y) * 0.12 * dt;

        const c = p.hot ? A : P;
        const trail = ctx.createLinearGradient(p.x - 34, 0, p.x, 0);
        trail.addColorStop(0, `rgba(${c},0)`);
        trail.addColorStop(1, `rgba(${c},0.55)`);
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p.x - 34, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11);
        g2.addColorStop(0, "rgba(255,255,255,0.9)");
        g2.addColorStop(0.3, `rgba(${c},0.8)`);
        g2.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
  });

  return (
    <CanvasHost>
      <canvas ref={ref} className={CANVAS} />
    </CanvasHost>
  );
}

/* ==========================================================================
   /developers — the request log
   Typography rather than particles. This page's subject is the API surface,
   and the most honest picture of an API is its traffic.
   ========================================================================== */

const ROUTES = [
  ["POST", "/v1/orders"],
  ["GET", "/v1/orders/{id}"],
  ["POST", "/v1/quotes"],
  ["GET", "/v1/orders/{id}/track"],
  ["POST", "/v1/orders/{id}/cancel"],
  ["GET", "/v1/providers"],
  ["POST", "/v1/wallet/recharge"],
  ["GET", "/v1/wallet/balance"],
  ["POST", "/v1/webhooks/test"],
] as const;

export function RequestLogScene() {
  const ref = useCanvasScene((ctx, w, h, v) => {
    const P = rgb(v("--primary"));
    const A = rgb(v("--accent", "#5bd9cb"));
    const M = rgb(v("--fg-muted", "#a6b3c2"));
    const L = rgb(v("--fg-subtle", "#748394"));

    const rowH = 30;
    const padX = Math.max(16, w * 0.06);
    const rows = Math.max(6, Math.floor((h - 24) / rowH));
    const barX = w - padX - Math.min(150, w * 0.34);
    const barW = Math.min(96, w * 0.22);

    type Row = { method: string; path: string; ms: number; code: number };
    const make = (): Row => {
      const [method, path] = ROUTES[Math.floor(Math.random() * ROUTES.length)];
      // A realistic spread: mostly fast, with the occasional long tail.
      const ms =
        Math.random() < 0.87
          ? 90 + Math.round(Math.random() * 110)
          : 240 + Math.round(Math.random() * 400);
      const code = Math.random() < 0.94 ? (method === "POST" ? 201 : 200) : 402;
      return { method, path, ms, code };
    };

    const log: Row[] = Array.from({ length: rows + 1 }, make);
    let scroll = 0;
    let since = 0;

    return (_t, dt) => {
      since += dt;
      if (since > 26) {
        since = 0;
        log.push(make());
        if (log.length > rows + 2) log.shift();
        scroll = rowH; // slide up from the new row's height
      }
      scroll += (0 - scroll) * 0.16 * dt;

      ctx.clearRect(0, 0, w, h);
      ctx.textBaseline = "middle";

      for (let i = 0; i < log.length; i++) {
        const r = log[i];
        const y = 18 + i * rowH + scroll - rowH;
        if (y < -rowH || y > h + rowH) continue;

        // fade at both ends so the list has no hard edge
        const edge = Math.min(1, y / 46, (h - y) / 46);
        const a = Math.max(0, Math.min(1, edge));
        if (a <= 0) continue;

        const isNew = i === log.length - 1;
        const accent = r.code === 402 ? P : r.method === "POST" ? P : A;

        // method chip
        ctx.font =
          "600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        const mw = ctx.measureText(r.method).width + 14;
        ctx.fillStyle = `rgba(${accent},${(a * 0.16).toFixed(3)})`;
        ctx.fillRect(padX, y - 8, mw, 16);
        ctx.fillStyle = `rgba(${accent},${(a * 0.95).toFixed(3)})`;
        ctx.fillText(r.method, padX + 7, y + 1);

        // path
        ctx.font =
          "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.fillStyle = `rgba(${M},${(a * (isNew ? 0.95 : 0.6)).toFixed(3)})`;
        ctx.fillText(r.path, padX + mw + 10, y + 1);

        // latency bar — 500ms is full width
        const frac = Math.min(1, r.ms / 500);
        ctx.fillStyle = `rgba(${L},${(a * 0.18).toFixed(3)})`;
        ctx.fillRect(barX, y - 2.5, barW, 5);
        ctx.fillStyle = `rgba(${accent},${(a * 0.8).toFixed(3)})`;
        ctx.fillRect(barX, y - 2.5, barW * frac, 5);

        // reading
        ctx.font =
          "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = `rgba(${r.code === 402 ? P : M},${(a * 0.75).toFixed(3)})`;
        ctx.fillText(`${r.code}  ${r.ms}ms`, w - padX, y + 1);
        ctx.textAlign = "left";
      }
    };
  });

  return (
    <CanvasHost>
      <canvas ref={ref} className={CANVAS} />
    </CanvasHost>
  );
}

/* ==========================================================================
   /cold-chain — the temperature trace
   A line graph, because that is literally the artefact this page sells: a
   retained trace with a tolerance band, and a visible consequence when the
   reading leaves it.
   ========================================================================== */

export function ColdTraceScene() {
  const ref = useCanvasScene((ctx, w, h, v) => {
    const P = rgb(v("--primary"));
    const A = rgb(v("--accent", "#7ef0dd"));
    const L = rgb(v("--fg-subtle", "#74aca4"));

    const N = 150;
    const MIN = -6;
    const MAX = -2;
    const LO = -10;
    const HI = 2;
    const top = h * 0.16;
    const bottom = h * 0.84;
    const toY = (temp: number) =>
      bottom - ((temp - LO) / (HI - LO)) * (bottom - top);

    let phase = Math.random() * 10;
    const series: number[] = [];
    const next = () => {
      phase += 0.09;
      // a calm carrier, plus a rare excursion above the band
      const drift = Math.sin(phase) * 0.9 + Math.sin(phase * 0.37) * 0.6;
      const spike = Math.sin(phase * 0.11) > 0.93 ? 3.4 : 0;
      return -4 + drift + spike + (Math.random() - 0.5) * 0.35;
    };
    for (let i = 0; i < N; i++) series.push(next());

    const frost = Array.from({ length: 34 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.4,
      vy: 0.12 + Math.random() * 0.3,
      sway: Math.random() * Math.PI * 2,
    }));

    let acc = 0;

    return (t, dt) => {
      acc += dt;
      while (acc >= 3) {
        acc -= 3;
        series.push(next());
        series.shift();
      }

      ctx.clearRect(0, 0, w, h);
      const stepX = w / (N - 1);

      // tolerance band
      ctx.fillStyle = `rgba(${A},0.09)`;
      ctx.fillRect(0, toY(MAX), w, toY(MIN) - toY(MAX));
      ctx.strokeStyle = `rgba(${A},0.28)`;
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1;
      for (const b of [MIN, MAX]) {
        ctx.beginPath();
        ctx.moveTo(0, toY(b));
        ctx.lineTo(w, toY(b));
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // graticule
      ctx.strokeStyle = `rgba(${L},0.12)`;
      for (let i = 1; i < 6; i++) {
        const x = (w / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
      }

      // area under the trace
      const area = ctx.createLinearGradient(0, top, 0, bottom);
      area.addColorStop(0, `rgba(${A},0.2)`);
      area.addColorStop(1, `rgba(${A},0)`);
      ctx.beginPath();
      ctx.moveTo(0, bottom);
      for (let i = 0; i < N; i++) ctx.lineTo(i * stepX, toY(series[i]));
      ctx.lineTo(w, bottom);
      ctx.closePath();
      ctx.fillStyle = area;
      ctx.fill();

      // the trace, segment-coloured so a breach is visible rather than annotated
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      for (let i = 1; i < N; i++) {
        const a = series[i - 1];
        const b = series[i];
        const bad = b > MAX || b < MIN;
        ctx.strokeStyle = bad ? `rgba(${P},0.95)` : `rgba(${A},0.8)`;
        ctx.beginPath();
        ctx.moveTo((i - 1) * stepX, toY(a));
        ctx.lineTo(i * stepX, toY(b));
        ctx.stroke();
      }

      // the live head
      const head = series[N - 1];
      const hy = toY(head);
      const pulse = 4 + Math.sin(t * 4) * 1.6;
      ctx.beginPath();
      ctx.arc(w - 1, hy, pulse + 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${A},0.13)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w - 1, hy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${A},1)`;
      ctx.fill();

      // frost
      for (const f of frost) {
        f.y += f.vy * dt;
        f.sway += 0.02 * dt;
        if (f.y > h + 4) {
          f.y = -4;
          f.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(f.x + Math.sin(f.sway) * 6, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fill();
      }
    };
  });

  return (
    <CanvasHost>
      <canvas ref={ref} className={CANVAS} />
    </CanvasHost>
  );
}

/* ==========================================================================
   /contact — the radar sweep
   Polar, with one moving part. Contact is the quietest page on the site and
   its visual should be the quietest too.
   ========================================================================== */

export function RadarScene() {
  const ref = useCanvasScene((ctx, w, h, v) => {
    const P = rgb(v("--primary"));
    const A = rgb(v("--accent", "#5bd9cb"));
    const L = rgb(v("--fg-subtle", "#748394"));

    const cx = w * 0.5;
    const cy = h * 0.52;
    const R = Math.min(w, h) * 0.42;

    const pings = Array.from({ length: 9 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: R * (0.24 + Math.random() * 0.72),
      /** 0 → just hit by the sweep, 1 → fully faded */
      age: 1,
      hot: Math.random() < 0.3,
    }));

    let sweep = 0;

    return (_t, dt) => {
      const prev = sweep;
      sweep = (sweep + 0.011 * dt) % (Math.PI * 2);
      const wrapped = sweep < prev;

      ctx.clearRect(0, 0, w, h);

      // rings and crosshair
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${L},0.16)`;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(${L},0.1)`;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(a) * R, cy - Math.sin(a) * R);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
      }

      // the trail, as wedges rather than a conic gradient — conic gradients
      // are still missing on enough browsers to be worth avoiding here
      const SLICES = 26;
      for (let i = 0; i < SLICES; i++) {
        const a0 = sweep - (i + 1) * 0.032;
        const a1 = sweep - i * 0.032;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, a0, a1);
        ctx.closePath();
        ctx.fillStyle = `rgba(${A},${(0.055 * (1 - i / SLICES)).toFixed(4)})`;
        ctx.fill();
      }

      // the arm
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      ctx.strokeStyle = `rgba(${A},0.55)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // contacts light as the arm crosses them, then decay
      for (const p of pings) {
        const crossed = wrapped
          ? p.a > prev || p.a <= sweep
          : p.a > prev && p.a <= sweep;
        if (crossed) p.age = 0;
        p.age = Math.min(1, p.age + 0.004 * dt);

        const x = cx + Math.cos(p.a) * p.r;
        const y = cy + Math.sin(p.a) * p.r;
        const c = p.hot ? P : A;
        const live = 1 - p.age;

        if (live > 0.01) {
          ctx.beginPath();
          ctx.arc(x, y, 4 + p.age * 26, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${c},${(live * 0.4).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${(0.24 + live * 0.72).toFixed(3)})`;
        ctx.fill();
      }

      // origin
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${P},0.95)`;
      ctx.fill();
    };
  });

  return (
    <CanvasHost>
      <canvas ref={ref} className={CANVAS} />
    </CanvasHost>
  );
}
