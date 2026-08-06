# DittoMart Go — Corporate Website

Enterprise marketing site for **DittoMart Go**, the B2B delivery-as-a-service platform built by DittoMart (Chennai).

Built with Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GSAP 3 (ScrollTrigger, SplitText, DrawSVG, MotionPath) · Lenis · Radix primitives · Lucide.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

---

## Design direction

**Industrial calm.** This is infrastructure, so it should read like a control room rather than a startup landing page — Stripe's clarity, Linear's density and motion restraint, Vercel's typographic confidence. Reference points that were deliberately *avoided*: gradient-hero SaaS templates, illustration-heavy explainers, and anything that animates for its own sake.

Three rules shaped every decision:

1. **Every claim is backed by an artefact.** Numbers appear next to the mechanism that produces them. The allocation timeline shows real millisecond values; the temperature curve shows a real safe band. Marketing that cannot be inspected is not trusted by this audience.
2. **Dark is the designed theme, light is derived.** Both ship, both are contrast-checked, and no component carries a `dark:` variant — theme switching happens entirely at the semantic-token layer.
3. **Motion explains causality or it does not exist.** The lock line in the allocation timeline *snaps* rather than eases, because the lock is atomic and the motion should say so. That is the standard every animation was held to.

---

## Design tokens

Three tiers, all in [`src/app/globals.css`](src/app/globals.css).

**Tier 1 — primitives.** Never used directly by components.

| Ramp | Meaning |
|---|---|
| `kinetic` (50–950) | Primary. The movement of goods. |
| `signal` (50–950) | Accent. Intelligence, cold chain, "system is alive". |
| `flux` (400–700) | AI, prediction, the network. |
| `pulse` (400–600) | Attention, energy. |
| `ink` (0–975) | Cool-blue neutral scale, tuned to sit under Kinetic. |

**Tier 2 — semantic.** What components actually consume: `bg`, `surface`, `elevated`, `fg`, `fg-muted`, `fg-subtle`, `line`, `line-strong`, `primary`, `accent`, `ai`, `success`, `warning`, `danger`, `ring`, `glass`. Defined once per theme under `:root` / `.theme-light` and exposed to Tailwind through `@theme inline`.

**Motion tokens.** `--ease-standard`, `--ease-enter`, `--ease-exit`, `--ease-out-expo`. Durations follow 80 / 140 / 220 / 340 / 600 ms.

**Type.** Inter (variable) for UI, JetBrains Mono for code, IDs, timestamps and any number in a column. All currency and metrics use tabular figures via the `.tnum` class.

---

## Architecture

```
src/
├── app/                     routes, metadata, sitemap, robots, manifest, OG image
├── components/
│   ├── brand/               logo mark + wordmark
│   ├── layout/              header (mega menu), footer, page hero, legal shell, theme toggle
│   ├── motion/              reveal, text reveal, counter, interactions, smooth scroll
│   ├── sections/            composable page sections (hero, engines, cold chain, …)
│   ├── ui/                  primitives — button, card, badge, accordion, tabs, form
│   └── visuals/             the signature diagrams
└── lib/                     site config, content data, icon registry, utils
```

### The signature visuals

These carry the pitch and are worth understanding before editing:

- **`orchestration-canvas.tsx`** — the hero. One API request enters, four engines resolve it, three supply rails compete, one wins. Pure SVG with `<animateMotion>` packets, so it costs nothing on the main thread.
- **`allocation-timeline.tsx`** — broadcast dispatch drawn to scale. Four providers triggered at t=0, one accepts at 8.41s, the gold lock line snaps in, the rest are cancelled in 522ms. This is the proof of the platform's hardest correctness claim.
- **`temperature-curve.tsx`** — the cold-chain trace with its safe band. The point is that the line stays *inside* the band.
- **`platform-stack.tsx`** — six interactive architecture layers with a sticky detail panel.
- **`console-mock.tsx`** — a restrained slice of the operations console.
- **`code-window.tsx`** — tabbed request/response with hand-rolled regex highlighting (a syntax library would have cost ~40 KB for a decorative concern).

### Motion architecture

Everything animated on this site runs through **one GSAP context per component**, so a route change reverts every timeline and ScrollTrigger it created. There is no second animation runtime.

**Core** — [`src/lib/motion.ts`](src/lib/motion.ts) holds the tokens (`DUR`, `EASE`) and registers plugins once. **No tween anywhere hardcodes a duration or a cubic-bezier.**

**Hooks** — [`src/hooks/use-motion.ts`](src/hooks/use-motion.ts):

| Hook | Behaviour |
|---|---|
| `useMotionScope` | Scoped `gsap.context`, reverted on unmount. The base every other hook builds on. |
| `useReveal` | `[data-reveal]` descendants animate in DOM order. Eight named variants (`rise`, `mask`, `clip`, `rotate`, …) so pages differ without hand-rolling timelines. |
| `useCountUp` | Number tweened into view, once, writing `textContent` directly. |
| `useSequence` | One shared cadence engine for every living diagram. Pauses off-screen; jumps to final step under reduced motion. |
| `useMagnetic` | Pointer-attracted CTA via `gsap.quickTo` — off the React render path entirely. |
| `useParallax`, `useScrollProgress`, `useInView`, `useMediaQuery` | Supporting primitives. |

**Smooth scroll** — [`ScrollProvider`](src/components/motion/scroll-provider.tsx) drives Lenis from the **GSAP ticker**, with `lenis.on("scroll", ScrollTrigger.update)`. Two independent RAF loops is the classic cause of pinned sections juddering one frame behind smooth scroll. It also exposes `lockScroll` (used by the mobile menu) and re-measures on every route change.

**Typography** — [`SplitHeading`](src/components/motion/split-heading.tsx) uses GSAP SplitText with `mask: "lines"`, so words rise *out of* a real clipped line box rather than fading on top of it. Splitting is deferred until `document.fonts.ready` — measuring line boxes against a fallback font produces wrong breaks that only appear on slow connections. Five modes (`lines`, `lines-alt`, `words`, `chars`, `scatter`), assigned per page.

**Page transitions** — `template.tsx` remounts per navigation, giving [`PageCurtain`](src/components/motion/page-transition.tsx) a natural mount point for the entrance. The exit half is a global link interceptor that plays the curtain closing before handing the navigation to the router. Four panels wipe in sequence rather than one solid block: it reads as a mechanism closing rather than a screen blanking.

**Ambient field** — [`AmbientCanvas`](src/components/visuals/ambient-canvas.tsx) is a fixed canvas carrying a coordinate grid, a routing graph and signal packets travelling between nodes — the product's own metaphor as atmosphere. Capped at 30fps, paused on `visibilitychange`, packet count scales with viewport, theme-aware via `MutationObserver`, and it draws exactly one static frame under reduced motion.

**Cursor** — dual-layer (instant dot, lerping ring) that squares off with a label over `[data-cursor]` elements. Disabled on coarse pointers. Text fields keep their native caret.

### One page, one language

No two pages share a reveal pattern. This was the explicit constraint:

| Page | Motion language |
|---|---|
| Home | **Assembly** — the hero diagram builds wire by wire before packets flow; sticky step storytelling; scrub-drawn temperature trace |
| Platform | **Construction** — a genuinely pinned, scrub-driven walk down six architecture layers; rails build upward from their base |
| Solutions | **Lateral** — the index rail scrolls sideways under vertical scroll; blocks clip in from the side they sit on |
| Industries | **Filing** — a fixed tab-strip index tracks position; each industry's two panels swing open from a shared hinge |
| Technology | **Instrumentation** — a scanline sweeps the pillar grid; assertions snap rather than glide; compliance matrix fills cell by cell |
| Developers | **Console output** — lists print at a monospace cadence; code windows type themselves in, response last |
| About | **Narration** — paragraphs resolve individually at reading position; the roadmap draws itself downward |
| Contact | **Arrival** — cards drop with a short overshoot; invalid fields shake once, never loop |
| Legal | **Reading** — progress rail beside a live-tracked table of contents |
| 404 | **Misrouted** — numerals overshoot and correct; a dashed route hunts for a destination it never finds |

Every one of these no-ops under `prefers-reduced-motion` — in the JS (each component branches and sets the final state directly) **and** in CSS as a backstop.

---

## Performance notes

Two decisions that materially moved the numbers:

- **No barrel imports of `lucide-react`.** `import * as Icons` defeats tree-shaking and drags the entire ~1,500-icon set into the client bundle — it was worth about **176 KB of first-load JS on the home page alone**. Dynamic icon lookup goes through the explicit [`src/lib/icon-registry.ts`](src/lib/icon-registry.ts).
- **One animation runtime.** The site originally used Framer Motion. Once the motion upgrade moved every scroll-driven behaviour to GSAP, Framer was powering only three small utilities — those were converted and the dependency removed, which cut ~42 KB from the home page while *adding* the pinned sections, split-text headlines, page curtain and ambient canvas.

Current first-load JS: **223 KB** home, 185–195 KB elsewhere, 103 KB shared. GSAP is code-split into its own lazy chunk.

Other guards: the ambient canvas throttles to 30fps and pauses on `visibilitychange`; pinned sections abandon pinning below 1024px rather than break; animations touch `transform`/`opacity`/`clip-path` only; every `useGSAP` scope reverts on unmount so nothing leaks across routes.

---

## Accessibility

- Semantic tokens are contrast-checked in both themes; status is always colour **plus** a word or icon.
- Skip link, visible focus rings on every interactive element, full keyboard operation of the mega menu (Escape closes, outside-click closes, hover intent is debounced).
- Radix underpins the accordion and tabs, so roving focus and ARIA wiring are correct by construction.
- Reduced motion is honoured throughout, including the Lenis smooth-scroll layer.
- Form fields carry real labels, `aria-invalid`, inline error text and focus management on submit failure.

---

## SEO

Complete metadata on every route (canonical, Open Graph, Twitter card, robots directives), a dynamic 1200×630 OG image via `next/og`, `sitemap.xml`, `robots.txt`, a web manifest, and JSON-LD for `Organization`, `SoftwareApplication`, `WebSite` and `FAQPage`.

---

## Not yet wired

Three things need attention before this goes live:

1. **The contact form does not submit anywhere.** [`src/components/sections/contact-form.tsx`](src/components/sections/contact-form.tsx) validates fully and shows a success state, but the submit handler is a simulated delay. Point it at a route handler, your CRM, or a form service.
2. **Legal copy needs counsel review.** [`/privacy`](src/app/privacy/page.tsx) and [`/terms`](src/app/terms/page.tsx) are written to be accurate to the platform described in the PRD, but they have not been reviewed by a lawyer and the DPDP and GST references in particular should be checked against your actual practice.
3. **Metrics, testimonials and customer logos are illustrative.** The figures in `metrics.tsx`, the quotes in `testimonials.tsx` and the category rail in `hero.tsx` are placeholders modelled on the PRD's targets, not measured results. Replace them with real data — or remove them — before launch.

Also worth confirming: `site.url`, phone, address and email in [`src/lib/site.ts`](src/lib/site.ts) are placeholders.
