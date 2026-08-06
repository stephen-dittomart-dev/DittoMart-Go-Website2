"use client";

import { useGSAP } from "@gsap/react";
import { FileCheck2, Snowflake, ThermometerSnowflake, TruckIcon } from "lucide-react";
import { useRef } from "react";
import { Spotlight } from "@/components/motion/interactions";
import { SplitHeading } from "@/components/motion/split-heading";
import { Badge, Card, Section } from "@/components/ui/primitives";
import { TemperatureCurve } from "@/components/visuals/temperature-curve";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

const CLASSES = [
  { label: "Frozen", range: "−18°C and below", color: "var(--color-ember-500)" },
  { label: "Chilled", range: "2°C to 5°C", color: "var(--color-teal-400)" },
  { label: "Ambient", range: "No control", color: "var(--fg-subtle)" },
  { label: "Hot", range: "60°C and above", color: "var(--color-pulse-500)" },
];

const CAPABILITIES = [
  {
    icon: ThermometerSnowflake,
    title: "Temperature classes on every order",
    body: "Frozen, chilled, ambient or hot — with a min and max range carried through the whole trip.",
  },
  {
    icon: TruckIcon,
    title: "Vehicle capability matching",
    body: "A chilled order can only be assigned to a vehicle that is certified to carry it. Capability is a hard filter, not a preference.",
  },
  {
    icon: Snowflake,
    title: "No incompatible batching",
    body: "Frozen never rides with hot. The batching engine refuses the combination rather than warning about it.",
  },
  {
    icon: FileCheck2,
    title: "Proof of Freshness",
    body: "Pickup photo, the full temperature curve, and the delivery photo, sealed into one verifiable certificate.",
  },
];

/**
 * Cold chain.
 *
 * Animation language: *crystallisation*. Capability rows resolve from blur
 * with their icon plates settling last, and the class chips snap in like
 * temperature bands locking. The chart itself is scroll-scrubbed.
 */
export function ColdChain() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-cc]"), { opacity: 1, y: 0, scale: 1, filter: "none" });
        return;
      }

      gsap.set(q("[data-cc='cap']"), { opacity: 0, y: 26, filter: "blur(10px)" });
      gsap.set(q("[data-cc='plate']"), { scale: 0.5, opacity: 0 });
      gsap.set(q("[data-cc='chip']"), { opacity: 0, y: 18, scale: 0.9 });
      gsap.set(q("[data-cc='foot']"), { opacity: 0 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 74%", once: true } })
        .to(q("[data-cc='cap']"), {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.85,
          ease: EASE.out4,
          stagger: 0.11,
        })
        .to(
          q("[data-cc='plate']"),
          { scale: 1, opacity: 1, duration: 0.5, ease: EASE.back, stagger: 0.11 },
          "-=0.95"
        );

      gsap
        .timeline({
          scrollTrigger: { trigger: q("[data-cc='chips']"), start: "top 86%", once: true },
        })
        .to(q("[data-cc='chip']"), {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: EASE.back,
          stagger: 0.07,
        })
        .to(q("[data-cc='foot']"), { opacity: 1, duration: 0.5 }, "-=0.2");

      // Slow drift on the whole right column — layered depth against the copy.
      gsap.to(q("[data-cc='visual']"), {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      });
    },
    { scope: root }
  );

  return (
    <Section id="cold-chain" className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 size-[600px] rounded-full opacity-50 blur-[120px]"
        style={{
          background: "radial-gradient(closest-side, var(--spot-2), transparent 70%)",
        }}
      />

      <div ref={root} className="container-page relative">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Badge variant="accent" size="sm">
              <Snowflake aria-hidden className="size-3" />
              The moat
            </Badge>

            <SplitHeading
              as="h2"
              mode="lines-alt"
              text="Cold chain that can prove itself"
              className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
            />

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
              Anyone can move a box. Very few can produce evidence that it never
              left its safe range — and in food, pharma and diagnostics, that
              evidence is the entire product.
            </p>

            <div className="mt-10 flex flex-col gap-7">
              {CAPABILITIES.map((c) => (
                <div key={c.title} data-cc="cap" className="flex gap-4">
                  <span
                    data-cc="plate"
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-accent"
                  >
                    <c.icon aria-hidden className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-medium">{c.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                      {c.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-cc="visual" className="lg:col-span-7">
            <div className="flex flex-col gap-5">
              <TemperatureCurve />

              <div data-cc="chips" className="grid gap-3 sm:grid-cols-2">
                {CLASSES.map((c) => (
                  <div key={c.label} data-cc="chip">
                    <Spotlight strength={0.08}>
                      <Card className="flex items-center gap-3.5 p-4 hover:border-line-strong">
                        <span
                          aria-hidden
                          className="size-8 shrink-0 rounded-lg"
                          style={{
                            background: `color-mix(in oklab, ${c.color} 18%, transparent)`,
                            border: `1px solid color-mix(in oklab, ${c.color} 40%, transparent)`,
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{c.label}</p>
                          <p className="truncate text-xs text-fg-subtle">{c.range}</p>
                        </div>
                      </Card>
                    </Spotlight>
                  </div>
                ))}
              </div>

              <div data-cc="foot">
                <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 border-dashed p-5">
                  <span className="text-xs text-fg-subtle">
                    FSSAI compliance fields
                  </span>
                  <span className="text-xs text-fg-subtle">
                    Perishable RTO protocol
                  </span>
                  <span className="text-xs text-fg-subtle">
                    Rider cold-chain checklist
                  </span>
                  <span className="text-xs text-fg-subtle">Breach auto-reject</span>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
