"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * WebGL flow field, adapted from the supplied `shader.html`.
 *
 * Two changes from the original. First, the palette: the source painted
 * electric cyan on a deep blue plate, which belongs to a different brand —
 * this version emits ember orange and crimson instead. Second, and more
 * importantly, it renders with a transparent background and writes the flow
 * intensity into the alpha channel, so it composites *over* the page rather
 * than covering it. That is what keeps the hero copy fully legible: the
 * shader only ever adds light where the flow lines actually are.
 *
 * Falls back to nothing at all if WebGL is unavailable or motion is reduced —
 * the section beneath is designed to stand on its own.
 */

const VERT = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_intensity;
varying vec2  v_texCoord;

void main() {
  vec2 uv = v_texCoord;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // gentle pull toward the pointer so the field feels alive under the cursor
  vec2 m = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p += (m - p) * 0.06;

  float t = u_time * 0.16;
  vec3  color = vec3(0.0);
  float alpha = 0.0;

  // three braided flow lines — the "routes" running under the page
  for (float i = 1.0; i < 4.0; i++) {
    p.x += 0.30 / i * sin(i * 3.0 * p.y + t + i * 1.2) + 0.5;
    p.y += 0.30 / i * cos(i * 3.0 * p.x + t + i * 1.5) + 0.5;

    float pulse = 0.0022 / abs(p.y);

    // ember orange on the outer strands, crimson on the inner one
    vec3 ember   = vec3(0.957, 0.400, 0.122);
    vec3 crimson = vec3(0.831, 0.125, 0.153);
    vec3 tint    = mix(ember, crimson, i / 3.0);

    color += tint * pulse * (1.0 / i);
    alpha += pulse * (1.0 / i);
  }

  // sparse signal packets riding the field
  float sparkle = pow(max(sin(uv.x * 42.0 + t) * cos(uv.y * 42.0 - t), 0.0), 12.0);
  color += vec3(1.0, 0.69, 0.24) * sparkle * 0.5;
  alpha += sparkle * 0.35;

  alpha = clamp(alpha, 0.0, 1.0) * u_intensity;

  // premultiplied so it adds light instead of washing the page out
  gl_FragColor = vec4(color * alpha, alpha);
}`;

export function ShaderField({
  className,
  intensity = 0.85,
}: {
  className?: string;
  /** 0–1. Lower it wherever text sits directly on top. */
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    const gl =
      (canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
      }) as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;

    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");

    // Half-resolution buffer: this is an ambient layer, not a focal one, and
    // it halves the fill cost on high-DPI screens for no visible difference.
    const syncSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr * 0.5));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr * 0.5));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    syncSize();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncSize)
        : null;
    ro?.observe(canvas);

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      mouse.y = (1 - (e.clientY - rect.top) / rect.height) * canvas.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let paused = document.hidden;
    let visible = true;
    let last = 0;
    const FRAME = 1000 / 30;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    const onVisibility = () => {
      paused = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const render = (t: number) => {
      raf = requestAnimationFrame(render);
      if (paused || !visible) return;
      if (t - last < FRAME) return;
      last = t;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      if (uIntensity) gl.uniform1f(uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro?.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    />
  );
}
