"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Ambient telemetry field.
 *
 * A fixed canvas behind the entire site carrying a coordinate grid, a small
 * routing graph, and teal packets travelling between nodes. It is the
 * product's own metaphor rendered as atmosphere: capacity constantly moving
 * across a network.
 *
 * Cost control: capped at ~30fps, paused when the tab is hidden, packet count
 * scales down on small screens, and it draws exactly one static frame under
 * reduced motion.
 */

type Node = { x: number; y: number; pulse: number };
type Route = { a: number; b: number };
type Packet = { route: number; t: number; speed: number; hue: "blue" | "mint" };

const NODES: [number, number][] = [
  [0.08, 0.22],
  [0.2, 0.62],
  [0.31, 0.34],
  [0.42, 0.78],
  [0.5, 0.16],
  [0.58, 0.52],
  [0.69, 0.28],
  [0.78, 0.7],
  [0.9, 0.4],
  [0.95, 0.82],
];

const ROUTES: [number, number][] = [
  [0, 2],
  [2, 4],
  [4, 6],
  [6, 8],
  [1, 2],
  [1, 3],
  [3, 5],
  [5, 6],
  [5, 7],
  [7, 8],
  [7, 9],
  [8, 9],
  [0, 1],
  [3, 7],
];

export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    /* ---------- theme-aware palette, re-read when the theme flips ------- */
    // Brand packets: ember orange and the logo's crimson.
    let ink = "47, 41, 38";
    let blue = "#e04e0f";
    let mint = "#d42027";
    let gridAlpha = 0.05;

    const readTheme = () => {
      const dark = document.documentElement.classList.contains("theme-dark");
      ink = dark ? "255, 255, 255" : "47, 41, 38";
      blue = dark ? "#fb8038" : "#e04e0f";
      mint = dark ? "#f8756c" : "#d42027";
      gridAlpha = dark ? 0.045 : 0.05;
    };
    readTheme();

    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    /* ---------- geometry ------------------------------------------------ */
    let nodes: Node[] = [];
    const routes: Route[] = ROUTES.map(([a, b]) => ({ a, b }));
    let packets: Packet[] = [];
    let maxPackets = 7;

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes = NODES.map(([nx, ny], i) => ({
        x: nx * width,
        y: ny * height,
        pulse: i * 0.7,
      }));

      maxPackets = width < 768 ? 3 : width < 1280 ? 5 : 8;
      packets = packets.slice(0, maxPackets);
    };
    layout();

    /* ---------- grain, pre-rendered once -------------------------------- */
    const grain = document.createElement("canvas");
    grain.width = 128;
    grain.height = 128;
    const gctx = grain.getContext("2d");
    let grainPattern: CanvasPattern | null = null;
    if (gctx) {
      const img = gctx.createImageData(128, 128);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 6;
      }
      gctx.putImageData(img, 0, 0);
      grainPattern = ctx.createPattern(grain, "repeat");
    }

    /* ---------- pointer parallax camera --------------------------------- */
    const cam = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      cam.tx = -((e.clientX / width) * 2 - 1) * 22;
      cam.ty = -((e.clientY / height) * 2 - 1) * 22;
    };

    /* ---------- packet spawning ----------------------------------------- */
    let lastSpawn = 0;
    const spawn = (now: number) => {
      if (packets.length >= maxPackets) return;
      if (now - lastSpawn < 1600) return;
      lastSpawn = now;
      packets.push({
        route: Math.floor(Math.random() * routes.length),
        t: 0,
        speed: 0.0035 + Math.random() * 0.005,
        hue: Math.random() > 0.45 ? "blue" : "mint",
      });
    };

    /* ---------- draw ----------------------------------------------------- */
    const drawGrid = (ox: number, oy: number) => {
      const size = 72;
      ctx.strokeStyle = `rgba(${ink}, ${gridAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const sx = ox % size;
      const sy = oy % size;
      for (let x = sx - size; x <= width + size; x += size) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, height);
      }
      for (let y = sy - size; y <= height + size; y += size) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
      }
      ctx.stroke();
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      cam.x += (cam.tx - cam.x) * 0.045;
      cam.y += (cam.ty - cam.y) * 0.045;
      const driftX = Math.sin(now * 0.00008) * 10;
      const driftY = Math.cos(now * 0.00006) * 8;
      const ox = cam.x + driftX;
      const oy = cam.y + driftY;

      drawGrid(ox, oy);

      ctx.save();
      ctx.translate(ox, oy);

      // routes
      ctx.strokeStyle = `rgba(${ink}, 0.055)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const r of routes) {
        const a = nodes[r.a];
        const b = nodes[r.b];
        if (!a || !b) continue;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();

      // nodes with breathing rings
      for (const n of nodes) {
        n.pulse += 0.012;
        const r = 2.4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${ink}, 0.22)`;
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = `rgba(${ink}, 0.07)`;
        ctx.lineWidth = 1;
        ctx.arc(n.x, n.y, 6 + Math.sin(n.pulse) * 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        const r = routes[p.route];
        const a = nodes[r.a];
        const b = nodes[r.b];
        if (!a || !b) {
          packets.splice(i, 1);
          continue;
        }

        p.t += p.speed;
        if (p.t >= 1) {
          packets.splice(i, 1);
          continue;
        }

        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const colour = p.hue === "blue" ? blue : mint;

        // trailing streak
        const tt = Math.max(0, p.t - 0.07);
        const tx = a.x + (b.x - a.x) * tt;
        const ty = a.y + (b.y - a.y) * tt;
        const grad = ctx.createLinearGradient(tx, ty, x, y);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, colour);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.fillStyle = colour;
        ctx.shadowBlur = 8;
        ctx.shadowColor = colour;
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      if (grainPattern) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      }
    };

    /* ---------- loop, throttled to ~30fps -------------------------------- */
    let last = 0;
    const FRAME = 1000 / 30;
    let paused = document.hidden;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (paused) return;
      if (now - last < FRAME) return;
      last = now;
      spawn(now);
      draw(now);
    };

    if (reduced) {
      // one static frame — the composition, none of the movement
      packets = [];
      draw(0);
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    const onVisibility = () => {
      paused = document.hidden;
    };
    const onResize = () => layout();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.55]"
    />
  );
}
