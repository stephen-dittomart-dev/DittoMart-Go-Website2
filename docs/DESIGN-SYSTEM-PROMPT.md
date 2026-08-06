# Reusable Design-System Prompt — "Light Industrial Digital"

Copy everything below the line into your new project's AI prompt. It is content-free: only
theme, layout, motion, and widget specs. Replace the bracketed `[...]` placeholders with your
own brand/product details.

---

## ROLE

You are building a marketing/product website using the **"Light Industrial Digital"** design
system described below. Follow it exactly. Do **not** invent alternative colors, radii, fonts,
or motion timings. All content is mine — you only apply this visual and motion system.

Project: `[YOUR PRODUCT NAME]` — `[one-line description]`.

---

## 1. TECH STACK (use this exact stack)

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (CSS-first config via `@theme` in `src/index.css`, no `tailwind.config.js`)
  installed with `@tailwindcss/vite`
- **GSAP 3** + `ScrollTrigger` + `MotionPathPlugin` (all motion goes through GSAP)
- **Lenis** for smooth scroll, driven from the GSAP ticker
- **lucide-react** for all icons (`strokeWidth={1.9}`, sizes `h-4 w-4` / `h-3.5 w-3.5`)
- Custom hash/state router — no react-router. A single `Route` union type + `navigate()`.

---

## 2. DESIGN LANGUAGE — the one-sentence brief

> A **blueprint / engineering-terminal aesthetic**: warm off-white paper canvas, hairline
> technical grids, **zero border radius**, monospace micro-labels in ALL CAPS with wide letter
> spacing, huge condensed uppercase display headings, and a single hot-orange accent used
> sparingly as a signal color. Everything reads like an instrument panel, not a SaaS landing page.

Non-negotiable rules:
- **Radius is 0 everywhere.** `--radius-*: 0px`. No rounded cards, no rounded buttons.
  (Only status dots / pulse rings use `rounded-full`.)
- **No soft drop shadows.** Depth comes from **hard offset shadows** (`6px 6px 0 var(--color-line)`)
  and 1px borders only.
- **No gradients as decoration.** Gradients are used only for grid lines and mask fades.
- Every UI block is bounded by a `1px solid var(--color-line)` border.

---

## 3. DESIGN TOKENS — paste into `src/index.css`

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Light Industrial Digital palette */
  --color-canvas: #F7F7F2;   /* page background — warm paper */
  --color-soft:   #EFEFE8;   /* recessed panels, toolbars, chips */
  --color-ink:    #111312;   /* text + solid nodes */
  --color-dark:   #111312;
  --color-green:  #16352B;   /* deep inversion surface */
  --color-muted:  #68706B;   /* secondary text */
  --color-line:   #D9DCD5;   /* every border, every rule */

  --color-accent:      #FF6B00; /* hot orange — primary signal */
  --color-accent-lime: #C8FF3D; /* healthy / online */
  --color-accent-blue: #5B8CFF; /* informational */

  --color-success: #12b76a;
  --color-error:   #f04438;
  --color-info:    #5B8CFF;
  --color-surface: #111312;

  --text-xs: 12px;  --text-sm: 14px;  --text-md: 16px;
  --text-lg: 18px;  --text-xl: 20px;
  --text-tech: 11px;      /* mono body */
  --text-tech-sm: 10px;   /* mono micro-label */

  --heading-1: clamp(48px, 7.5vw, 108px);
  --heading-2: clamp(34px, 5vw, 68px);
  --heading-3: clamp(24px, 3.5vw, 42px);

  --radius-sm: 0px; --radius-md: 0px; --radius-lg: 0px; --radius-xl: 0px;

  --shadow-card: none;
  --shadow-lift: 4px 4px 0px 0px #D9DCD5;
}

@layer base {
  :root {
    --shell: 1280px;
    --gutter: clamp(20px, 5vw, 64px);
    --section-y: clamp(64px, 8vw, 128px);
  }
  * { border-color: var(--color-line); }
  html { -webkit-text-size-adjust: 100%; scroll-behavior: auto; }
  body {
    background-color: var(--color-canvas);
    font-family: var(--font-sans);
    color: var(--color-ink);
    overflow-x: hidden;
    font-feature-settings: 'cv02','cv03','cv04','ss01';
  }
  h1,h2,h3,h4 {
    font-family: var(--font-display);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 0.95;
    text-wrap: balance;
  }
  ::selection { background: rgba(255,107,0,.1); color: var(--color-accent); }
  :focus-visible { outline: 1px solid var(--color-accent); outline-offset: 3px; }

  /* squared scrollbar */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: var(--color-soft); }
  ::-webkit-scrollbar-thumb { background: var(--color-line); border-radius: 0; border: 2px solid var(--color-soft); }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-muted); }

  /* lenis */
  html.lenis, html.lenis body { height: auto; }
  .lenis.lenis-smooth { scroll-behavior: auto !important; }
  .lenis.lenis-stopped { overflow: hidden; }
}

@layer components {
  .shell   { width:100%; max-width:var(--shell); margin-inline:auto; padding-inline:var(--gutter); }
  .section { padding-block: var(--section-y); position: relative; }

  /* technical grid backgrounds */
  .grid-bg {
    background-image:
      linear-gradient(to right,  rgba(17,19,18,.045) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(17,19,18,.045) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .grid-bg-fine {
    background-image:
      linear-gradient(to right,  rgba(17,19,18,.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(17,19,18,.06) 1px, transparent 1px);
    background-size: 16px 16px;
  }
  .grid-fade {
    mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 100%);
  }

  .eyebrow {
    font-family: var(--font-mono); font-size: var(--text-tech-sm); font-weight: 600;
    text-transform: uppercase; color: var(--color-accent); letter-spacing: .2em;
  }
  .eyebrow-muted {
    font-family: var(--font-mono); font-size: var(--text-tech-sm); font-weight: 500;
    text-transform: uppercase; color: var(--color-muted); letter-spacing: .16em;
  }
  .tech { font-family: var(--font-mono); font-size: var(--text-tech); }
  .lede {
    font-size: 1.125rem; font-weight: 500; color: var(--color-muted);
    max-width: 50ch; text-wrap: pretty; line-height: 1.4;
  }

  .card {
    border-radius: 0 !important; border: 1px solid var(--color-line);
    background: var(--color-canvas); position: relative;
    transition: all .3s cubic-bezier(.16,1,.3,1);
  }
  /* signature hover: lift up-left + hard offset shadow */
  .card-hover:hover {
    border-color: var(--color-accent);
    box-shadow: 6px 6px 0 0 var(--color-line);
    transform: translate(-3px,-3px);
  }

  .tech-container { border:1px solid var(--color-line); background: var(--color-canvas); padding: 1.5rem; position: relative; }

  .chip {
    display:inline-flex; align-items:center; gap:.375rem; border-radius:0;
    border:1px solid var(--color-line); padding:.25rem .625rem;
    font-family: var(--font-mono); font-size: var(--text-tech-sm);
    font-weight:600; text-transform:uppercase; letter-spacing:.1em;
  }
  .chip-accent  { border-color: var(--color-accent);      background: rgba(255,107,0,.05); color: var(--color-accent); }
  .chip-success { border-color: var(--color-accent-lime); background: rgba(200,255,61,.05); color: #111312; }
  .chip-info    { border-color: var(--color-accent-blue); background: rgba(91,140,255,.05); color: var(--color-accent-blue); }
  .chip-error   { border-color: var(--color-error);       background: rgba(240,68,56,.05);  color: var(--color-error); }
  .chip-neutral { border-color: var(--color-line);        background: var(--color-soft);    color: var(--color-muted); }

  .tnum { font-variant-numeric: tabular-nums; font-feature-settings:'tnum'; }
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .mask-fade-r { mask-image: linear-gradient(to right, #000 78%, transparent 100%);
                 -webkit-mask-image: linear-gradient(to right, #000 78%, transparent 100%); }
  .mask-fade-y { mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
                 -webkit-mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent); }
  .will-reveal { will-change: transform, opacity; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important; animation-iteration-count: 1 !important;
    transition-duration: .001ms !important; scroll-behavior: auto !important;
  }
}
```

Fonts (preconnect + one `<link>` in `index.html`):
`Inter:wght@400;500;600` · `JetBrains+Mono:wght@400;500` · `Space+Grotesk:wght@500;600;700`

---

## 4. TYPOGRAPHY RULES

| Role | Spec |
|---|---|
| H1 hero | `font-display`, `font-black`, uppercase, `clamp(48px,7.5vw,108px)`, `leading-[0.95]`, `tracking-tighter`. Split into **3 separate `<span>` lines**; the last line is `text-accent` and `font-normal` for contrast. |
| H2 section | `text-3xl md:text-5xl font-bold uppercase leading-[0.95] max-w-[25ch]` |
| Body / lede | Inter 500, `text-muted`, `max-w-50ch`, `leading-relaxed` |
| **Eyebrow** | mono 10px, 600, uppercase, `tracking-[0.2em]`, accent color, preceded by a `h-px w-6 bg-accent` dash |
| Micro-label | mono 9–10px, `tracking-[0.14em]`–`[0.38em]`, `text-muted` uppercase |
| Numbers | always `.tnum` (tabular) + `font-display font-bold` |

Signature text motifs to reuse liberally:
- Numbered index prefixes: `01 /`, `02 /`, `03 /` in mono accent.
- Bracketed CTA labels: `[ TALK TO US ]`, `[ GET STARTED ]`.
- Fake telemetry readouts: `LOC: [CITY]_HQ`, `SYS_STATUS: ACTIVE`, `● ONLINE`,
  `LAT_COORD_00.0000`, `X:0A` / `Y:1F` grid tick labels.
- Arrow suffix on links: `→` and `→ [answers this question]`.

---

## 5. LAYOUT SYSTEM

- **Shell:** `.shell` = max-width 1280px + fluid gutter `clamp(20px,5vw,64px)`. Every section
  is `<section className="section">` with `.shell` inside.
- **Hero:** two-column asymmetric grid `lg:grid-cols-[1.1fr_1fr]`, gap 12→16.
  Left = typography stack; right = a live SVG "system diagram" panel.
  Full-bleed `grid-bg grid-fade` absolute layer behind it.
- **Section anatomy (repeat this):**
  1. `SectionHeader` (eyebrow + dash, H2, lede, optional `→ answers` line)
  2. Content grid at `mt-12 sm:mt-16`
  3. Optional bordered summary panel at the bottom
- **Grids:** `sm:grid-cols-2`, `md:grid-cols-3`, `lg:grid-cols-4`, `gap-3`/`gap-4`.
  Step rails use `grid-cols-7` on desktop, `flex flex-col` on tablet/mobile.
- **Sticky columns:** explanatory left column `sticky top-28` beside a scrolling visual.
- **Breakpoints:** mobile `<768`, tablet `<1024`. Horizontal flows become vertical below 1024.
- **Header:** fixed, `h-16 sm:h-20`, `bg-canvas/95 backdrop-blur-md`, `border-b border-line`.
- **Scroll offset for anchors:** `-84px`.

---

## 6. MOTION SYSTEM

### 6.1 Motion tokens (`src/lib/gsap.ts`)
```ts
export const DUR  = { micro: 0.22, reveal: 0.7, section: 1.1, system: 1.9 } as const
export const EASE = { out:'power2.out', out3:'power3.out', out4:'power4.out',
                      expo:'expo.out', inOut:'power2.inOut' } as const
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isMobile = () => window.innerWidth < 768
/** damp travel distance on small screens */
export const travel = (base = 28) => (isMobile() ? Math.round(base * 0.55) : base)
```
Every tween must pull duration + ease from these tokens. **Never hardcode a random duration.**

### 6.2 Required hooks (`src/hooks/useMotion.ts`)
Implement all of these; they are the whole animation vocabulary:

| Hook | Behaviour |
|---|---|
| `useGsap(setup, deps)` | Scopes a `gsap.context` to a ref; reverts on unmount so timelines never leak across routes. |
| `useReveal({y=28, stagger=0.07, start:'top 82%', duration:DUR.reveal})` | The workhorse. Any descendant with `data-reveal` fades + rises in DOM order, `once: true`, ease `out3`. Under reduced motion it just sets the end state. |
| `useCountUp(value, {duration:1.6, format, start:'top 88%'})` | Tweens a number into view with ease `out4`, writes `textContent`. |
| `useInView(rootMargin='-10% 0px')` | IntersectionObserver → `[ref, inView]`. Drives "only animate when visible". |
| `useSequence(steps, intervalMs, active)` | Self-resetting step counter (`(s+1) % (steps+1)`). **One shared cadence engine for every living diagram.** Pauses off-screen and under reduced motion (jumps to final step). |
| `useMediaQuery` / `useIsMobile` / `useIsTablet` | Reactive breakpoints used to swap horizontal↔vertical layouts. |

### 6.3 Smooth scroll (Lenis + GSAP, single RAF loop)
```ts
const lenis = new Lenis({
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true, touchMultiplier: 1.6, wheelMultiplier: 1,
})
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```
Rules: skip Lenis entirely under reduced motion; expose `lockScroll(bool)` (modals call
`lenis.stop()/start()`), `scrollToTop()` and `scrollToId(id,{immediate})` that call
`lenis.resize()` before cross-route jumps and use `offset: -84`.
Call `ScrollTrigger.refresh()` after `document.fonts.ready` + a 350ms timeout + `window.load`.

### 6.4 The named animations — implement each

1. **Hero cinematic timeline** (on mount, elements start at `opacity:0` inline):
   ```
   0.4s  label   y15 → 0, 0.4s
   0.6s  h1 lines y40 → 0, 0.8s, stagger 0.15   ← line by line
   0.8s  lede    y15 → 0, 0.6s
   0.9s  buttons y15 → 0, 0.5s, stagger 0.1
   0.9s  visual  opacity0 scale .95 y30 → 1/1/0, 1.2s power3.out
   ```
   Then a parallax: visual `yPercent:-10`, `ease:'none'`, `scrub: 0.5`, from `top top` to `bottom top`.

2. **Scroll reveal** — the default for all section content: `data-reveal` + `useReveal`.

3. **Pinned state-machine section** — `pin: true`, `end: '+=300%'`, `scrub: 0.3`.
   Steps animate `opacity .2 → 1, scale .85 → 1.25, y 50 → 0, color → accent`, then out to
   `opacity .15, scale .85, y -50, color → muted`, offset `idx * 1.5` on the timeline.
   A pulse dot's `top` is set to `progress * 90 + 5 + '%'`.

4. **Scrub-filled progress rail** — a `ScrollTrigger` from `top 78%` to `bottom 62%`, `scrub: 0.5`,
   sets `scaleX` (desktop) or `scaleY` (tablet) on a `bg-accent` fill with `origin-left`/`origin-top`;
   `onUpdate` also lights up the node index `floor(progress * steps)`.

5. **Page transition overlay** (route change):
   ```
   set overlay display:block, xPercent:-100
   → xPercent 0,   0.4s power3.inOut          (swipe in)
   → logo scale .8→1, opacity 0→1, 0.15s back.out(2)  (at -0.1)
   → swap route state + scrollToTop()
   → logo scale 1.1, opacity 0, 0.2s power2.in
   → overlay xPercent 100, 0.4s power3.inOut  (swipe out)
   → display:none, then ScrollTrigger.refresh()
   ```
   Overlay is `fixed inset-0 bg-white z-[9999]` with a centered mark + wordmark.

6. **Modal / subscreen expand-from-origin** — capture the clicked card's `DOMRect`, compute
   `scaleX/scaleY/dx/dy` relative to the panel rect, tween to identity in `0.72s` ease `out4`
   (fallback `y:34, scale:.97, 0.62s` when no origin). Overlay fades `0.34s`. Inner
   `[data-screen-item]` children stagger in at `0.045` with `delay 0.16`.

7. **Ambient canvas background** — see §7.1.

8. **Micro-interactions**
   - Button arrow: `group-hover:translate-x-1`, 200ms.
   - Card: the `.card-hover` translate(-3px,-3px) + hard shadow, `cubic-bezier(.16,1,.3,1)` 300ms.
   - Nav dropdown: `opacity-0 -translate-y-2 pointer-events-none` →
     `group-hover:opacity-100 group-hover:translate-y-0`, 200ms `ease-out`, `origin-top-left`.
   - List item number: `group-hover/item:translate-x-1`.
   - Accordion chevron: `rotate-90`.
   - Status dot: `animate-ping` ring over a solid dot.

### 6.5 Reduced motion — mandatory
Every animated component must branch on `prefersReducedMotion()` and **set the final state
directly** (`gsap.set(..., {opacity:1, y:0})`, sequence jumps to last step, Lenis not created,
canvas draws one static frame and returns).

---

## 7. SIGNATURE WIDGETS — build all of these

### 7.1 `<Background />` — ambient canvas network
Fixed full-viewport `<canvas>`, `pointer-events-none z-0 opacity-[0.22]`, behind everything.
Per frame:
1. **64px coordinate grid** in `rgba(17,19,18,.045)`, with 7px JetBrains-Mono hex tick labels
   `X:0A` / `Y:1F` every 128px.
2. **Mouse parallax camera** — target offset `-(mouseNorm) * 30`, lerped at `0.05`, plus a
   constant drift `sin(t*0.0005)*0.05`.
3. **Scanline** sweeping down at 1.2px/frame in `rgba(255,107,0,.04)`.
4. **Node/route graph** — ~9 normalized nodes with mono labels, ~12 connecting routes drawn
   as 1px lines.
5. **Signal packets** — every 3s spawn an orange `#FF6B00` packet (and 60% of the time a lime
   `#C8FF3D` one) that travels a random route at `0.005–0.013` progress/frame, drawn as a
   3.5px circle with `shadowBlur: 4`.
6. **Node pulses** — outer ring radius `5 + sin(pulse)*1.5`, `pulse += 0.015`.
7. **Grain** — a pre-rendered 128×128 noise canvas tiled as a pattern (alpha 20) each frame.
A dark variant swaps line colors to `rgba(217,220,213,.04–.25)` on designated dark routes.

### 7.2 `<CustomCursor />` — dual-layer cursor
- Disabled when `(pointer: coarse)`; hides native cursor via `documentElement.style.cursor='none'`.
- **Dot:** 8px, follows instantly. Shrinks to 6px and turns accent on hover.
- **Ring:** 24px circle, lerp-follows at `0.15` via rAF. On hover over
  `a, button, [role=button], [data-cursor]` it grows to 40px — or **72px and square
  (`borderRadius: 0`)** when it carries a label. Labels: `data-cursor="system"` → `SYSTEM`,
  anchors / `data-cursor="view"` → `VIEW →`, rendered in 9px bold mono accent.

### 7.3 `<HeroSystem />` — live SVG blueprint diagram
A `viewBox="0 0 460 460"` SVG inside a `border border-line bg-soft grid-bg-fine p-6 md:p-8` panel.
- ~11 nodes on a 110/230/350 coordinate lattice, each with `label`, `code` (`NODE-01`,
  `CORE-◎`), and `status` (`SYS_OK`, `OPTIMIZING`, `DISPATCHED`).
- Node = white circle + ink stroke (core: r9, accent stroke 2 + breathing ring
  `r = 5 + sin(pulse + x*0.05)*2`), a 2px lime/orange status pip at `(+8,-8)`, and a
  86×20 label plate with 6.5px bold mono name + 5.5px muted `CODE · STATUS`.
- ~14 orthogonal wires. One wire is "active" per frame (cycling): it turns accent, 2px wide,
  and carries a `<circle r=3>` driven by SVG `<animateMotion dur="1.2s" repeatCount="indefinite">`.
- Corner readouts: `LAT_COORD_…` / `LNG_COORD_…` top, and a bottom rule with a pinging dot +
  `ROUTING QUEUE // ACTIVE`.

### 7.4 Primitives (`components/primitives.tsx`)
- `cx(...)` classname joiner.
- **`Button`** — `variant: primary | secondary | ghost`, `size: md | lg`, `arrow` prop.
  Base: `inline-flex items-center gap-2 rounded-none font-mono font-bold uppercase tracking-wider transition-all duration-200`.
  primary = `border border-accent bg-accent/5 text-accent hover:bg-accent hover:text-ink`;
  secondary = `border border-line bg-canvas hover:border-accent hover:bg-soft`;
  ghost = `text-muted hover:text-ink hover:bg-soft`.
- **`SectionHeader`** — `{eyebrow, title, lede?, answers?, align}`; renders the accent dash +
  eyebrow row, H2, lede, and a `→ answers` mono line. Every child carries `data-reveal`.
- **`Counter`** — `useCountUp` + `toLocaleString` + `.tnum`, with `prefix`/`suffix`/`decimals`.
- **`StatusDot`** — 2px solid dot + absolutely positioned `animate-ping` twin; tones
  `success | accent | info | error | neutral`.
- **`StatusChip`** — `.chip` + tone class, optional leading dot.
- **`Kicker`**, **`Rule`** (`h-px w-full bg-line`), **`PhaseBadge`** style tag.

### 7.5 Frames (`components/frames.tsx`)
- **`BrowserFrame`** — square chromeless window: `border border-line`, toolbar strip
  `bg-soft border-b` with three 10px grey squares (not circles), a bordered URL pill with a
  `Lock` icon and 10px mono URL, plus a `toolbar` slot.
- **`PhoneFrame`** — `max-w-[300px]` bordered shell, an `h-5 w-20 bg-ink/90` notch bar,
  and a fake status row (`9:41` + outlined battery/dot glyphs).
- **`Tile`** — metric cell with a **2px full-height accent bar on the left edge**, 10px mono
  uppercase label, `font-display text-lg font-bold tnum` value, 11px muted sub.
- **`SideNav`** — mono section title + square items; active =
  `border border-accent bg-accent/5 font-bold text-accent`, idle = `text-muted hover:bg-soft`.

### 7.6 `<Subscreen />` — full-screen product modal
Portal to `document.body`, `z-[100]`, overlay `bg-ink/40 backdrop-blur-[3px]`.
Escape to close, full Tab focus trap, focus restore on close, `lockScroll(true)` while open.
Header with truncating title/subtitle + square close button; scrollable body
(`overscroll-contain`); a mono footnote strip on `bg-soft`. Uses the expand-from-origin
animation in §6.4-6.

### 7.7 `<Nav />` — command-panel mega menu
- Fixed bar. Brand block is a **two-line stack**: display wordmark + a 9px mono
  `tracking-[0.38em]` accent sub-label that nudges `translate-x-0.5` on hover.
- Desktop: hover-opened dropdown panels, `w-[320px] bg-soft border border-line p-5 grid-bg-fine`,
  each with a header row (`01 / SECTION NAME` + a 1.5px colored square) and numbered items
  (`01` accent mono + bold 11px uppercase title + 9px muted description).
- Right cluster: a **`● SYSTEM ONLINE`** pill (lime `animate-pulse` dot, bordered, `bg-soft`)
  and a bracketed `[ TALK TO US ]` CTA.
- Mobile: full-screen drawer below the header with bordered numbered accordions
  (`01. SYSTEMS` …) and a rotating `ChevronRight`.

### 7.8 Other recurring widgets
- **Stepper rail** — numbered nodes on a hairline rail, filled by scroll (§6.4-4).
- **Auto-playing pipeline / lifecycle diagram** — `useInView` + `useSequence`; the active
  node gets accent border + label, past nodes stay filled, future nodes stay `text-muted`.
- **Sticky explainer column** beside a tall animated visual.
- **Code/API panel** — mono, `bg-soft`, `overflow-x-auto` with `min-w-0` guard so the page
  never gains a horizontal scrollbar.
- **Footer** — `border-t`, brand block + `tagline` + mono `COMPANY · CITY`, a 2/3-col link
  grid of muted buttons, and a bottom rule with two 10px mono lines.

---

## 8. ACCESSIBILITY & QUALITY BAR

- `:focus-visible` = 1px accent outline, 3px offset. Never remove it.
- Decorative layers get `aria-hidden`; SVG diagrams get `role="img"` + a descriptive `aria-label`.
- Modals: `role="dialog" aria-modal="true"`, labelled, focus-trapped, focus restored.
- Nav: `aria-label`, `aria-expanded`, `aria-current="page"`.
- All interactive elements are real `<button>`/`<a>` with `cursor-pointer`.
- Reduced motion honored in CSS **and** in every JS animation.
- Always clean up: `ctx.revert()`, `cancelAnimationFrame`, `removeEventListener`,
  `io.disconnect()`.

---

## 9. WHAT "DONE" LOOKS LIKE

The page should feel like a **calm engineering instrument**: paper-white, hairline-ruled,
mono-labelled, with exactly one orange signal color and slow ambient telemetry drifting behind
the content. Nothing bounces, nothing glows soft, nothing is rounded. Motion is always
scroll-anchored or system-cadenced — never decorative jitter.
