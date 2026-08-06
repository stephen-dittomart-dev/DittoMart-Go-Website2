"use client";

import { useGSAP } from "@gsap/react";
import {
  Activity,
  Bike,
  Boxes,
  Calculator,
  Globe2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Badge, Card, Eyebrow, Section } from "@/components/ui/primitives";
import { PlatformStack } from "@/components/visuals/platform-stack";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* =========================================================================
   Platform page motion language: *construction*.
   Rails build column by column, the latency sequence draws downward like a
   trace being recorded, and the guarantees stamp in. Nothing on this page
   uses the fade-and-rise pattern that carries the home page.
   ========================================================================= */

export function PlatformArchitecture() {
  return (
    <Section id="architecture" className="border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>Architecture</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines"
            text="Six layers, one request"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Every delivery travels the same path. The only thing that changes is
            which supply rail wins. Scroll to walk the stack.
          </p>
        </div>
        <PlatformStack className="mt-14" />
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */

const RAILS = [
  {
    icon: Truck,
    name: "3PL rail",
    tag: "Instant reach",
    body: "Contracted third-party fleets behind a single adapter interface. Serviceability, quote, create, cancel and track are identical across every provider — adding one is a day of work, not a project.",
    facts: [
      "Common interface across all providers",
      "Per-provider health checks and API logs",
      "Automatic failover to the next ranked provider",
    ],
  },
  {
    icon: Bike,
    name: "Direct fleet rail",
    tag: "Controlled SLA",
    body: "Partner agencies running our rider app under our service agreement. We set the rate, define the proof requirements and enforce the penalties — which is why this rail carries anything time or temperature critical.",
    facts: [
      "Verified riders with tracked document expiry",
      "Cold-chain checklist enforced in the app",
      "Weekly settlement with traceable deductions",
    ],
  },
  {
    icon: Globe2,
    name: "ONDC rail",
    tag: "Open network",
    body: "Participation in both directions on the open network — buying logistics capacity when demand outruns our supply, and selling capacity when riders would otherwise sit idle.",
    facts: [
      "Buyer and seller network participant",
      "Domain LOG10, full protocol compliance",
      "Independent signing and registry stack",
    ],
  },
];

export function PlatformRails() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-rail], [data-rail-fact]"), {
          opacity: 1,
          y: 0,
          scaleY: 1,
        });
        return;
      }

      // Columns build upward from their base — construction, not arrival.
      gsap.set(q("[data-rail]"), {
        opacity: 0,
        scaleY: 0.82,
        y: 34,
        transformOrigin: "bottom",
      });
      gsap.set(q("[data-rail-fact]"), { opacity: 0, x: -10 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 78%", once: true } })
        .to(q("[data-rail]"), {
          opacity: 1,
          scaleY: 1,
          y: 0,
          duration: 0.85,
          ease: EASE.out4,
          stagger: 0.14,
        })
        .to(
          q("[data-rail-fact]"),
          { opacity: 1, x: 0, duration: 0.42, ease: EASE.out3, stagger: 0.05 },
          "-=0.5"
        );
    },
    { scope: root }
  );

  return (
    <Section id="supply" className="border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>Supply</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines-alt"
            text="Three rails, ranked against each other on every order"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            No rail is privileged by contract. They compete on cost, speed and
            reliability, and the scorecards that rank them are built from real
            outcomes.
          </p>
        </div>

        <div ref={root} className="mt-14 grid gap-4 lg:grid-cols-3">
          {RAILS.map((rail) => (
            <div key={rail.name} data-rail>
              <Card className="flex h-full flex-col p-7 transition-transform duration-500 hover:-translate-y-1.5 hover:border-primary-border">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-primary">
                    <rail.icon aria-hidden className="size-5" />
                  </span>
                  <Badge variant="outline" size="sm">
                    {rail.tag}
                  </Badge>
                </div>
                <h3 className="mt-5 text-lg font-medium">{rail.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                  {rail.body}
                </p>
                <ul className="mt-6 flex flex-col gap-2.5 border-t border-line pt-5">
                  {rail.facts.map((f) => (
                    <li
                      key={f}
                      data-rail-fact
                      className="flex items-start gap-2.5 text-xs text-fg-muted"
                    >
                      <span
                        aria-hidden
                        className="mt-[7px] size-1 shrink-0 rounded-full bg-accent"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */

const SEQUENCE = [
  { t: "0ms", label: "Request authenticated, tenant resolved" },
  { t: "40ms", label: "Tariff rule matched, rate computed and locked" },
  { t: "95ms", label: "Wallet pre-authorisation cleared" },
  { t: "180ms", label: "Providers ranked on cost, ETA, scorecard, capability" },
  { t: "240ms", label: "Broadcast fan-out to top-N eligible providers" },
  { t: "8.4s", label: "First accept takes the lock, assignment committed" },
  { t: "8.9s", label: "Cancel fan-out acknowledged by all others" },
  { t: "9.0s", label: "order.assigned webhook delivered to your endpoint" },
];

export function PlatformSequence() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const rail = el.querySelector("[data-seq-rail]");

      if (prefersReducedMotion()) {
        gsap.set(q("[data-seq-row]"), { opacity: 1, x: 0 });
        gsap.set(rail, { scaleY: 1 });
        return;
      }

      gsap.set(q("[data-seq-row]"), { opacity: 0.25, x: 14 });
      gsap.set(rail, { scaleY: 0, transformOrigin: "top" });

      // The trace records downward as you scroll — scrubbed, not triggered.
      gsap.to(rail, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 72%",
          end: "bottom 72%",
          scrub: 0.4,
        },
      });

      q("[data-seq-row]").forEach((row) => {
        gsap.to(row, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: EASE.out3,
          scrollTrigger: { trigger: row, start: "top 82%", once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <Section className="border-b border-line">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Eyebrow>Latency</Eyebrow>
              <SplitHeading
                as="h2"
                mode="chars"
                text="Nine seconds, narrated"
                className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
              />
              <p className="mt-5 max-w-md text-base leading-relaxed text-fg-muted md:text-lg">
                A real request path from a Chennai order, measured end to end.
                Everything before the eight-second mark is us; everything after is
                a human deciding to accept.
              </p>
            </div>
          </div>

          <div ref={root} className="lg:col-span-7">
            <div className="relative">
              <div
                aria-hidden
                className="absolute left-[3.6rem] top-2 h-[calc(100%-1rem)] w-px bg-line"
              >
                <div
                  data-seq-rail
                  className="h-full w-full origin-top bg-gradient-to-b from-ember-400 to-teal-400"
                />
              </div>

              <ol className="flex flex-col">
                {SEQUENCE.map((s, i) => (
                  <li
                    key={s.t}
                    data-seq-row
                    className="flex items-center gap-6 py-4"
                  >
                    <span className="w-12 shrink-0 text-right font-mono text-xs tnum text-primary">
                      {s.t}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "relative z-10 size-2.5 shrink-0 rounded-full border-2 border-bg",
                        i >= 5 ? "bg-teal-400" : "bg-ember-400"
                      )}
                    />
                    <span className="text-sm text-fg-muted">{s.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "Exactly one acceptance",
    body: "A distributed lock on the order means one and only one provider can ever commit. Not monitored — structurally prevented.",
  },
  {
    icon: Activity,
    title: "Failover without intervention",
    body: "A provider outage promotes the next ranked option automatically. Nobody gets paged, nothing waits for a human.",
  },
  {
    icon: Boxes,
    title: "Isolation by construction",
    body: "Tenant scoping is enforced at the data-access layer and verified by a security suite that attempts cross-tenant reads on every endpoint.",
  },
  {
    icon: Calculator,
    title: "Rates that cannot drift",
    body: "The quote is locked on the order at confirmation. What you were quoted is what you are billed, regardless of what happens downstream.",
  },
];

export function PlatformGuarantees() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-guarantee]", el);

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, scale: 1 });
        return;
      }

      // Stamped, not floated — these are assertions.
      gsap.set(cards, { opacity: 0, scale: 1.06 });
      gsap.to(cards, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: EASE.out4,
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <Section className="border-b border-line">
      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Eyebrow>Guarantees</Eyebrow>
          <SplitHeading
            as="h2"
            mode="words"
            text="Four things that are true on every order"
            className="text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
        </div>

        <div ref={root} className="mt-14 grid gap-4 md:grid-cols-2">
          {GUARANTEES.map((g) => (
            <div key={g.title} data-guarantee>
              <Card className="flex h-full gap-5 p-7 hover:border-primary-border">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-primary">
                  <g.icon aria-hidden className="size-[18px]" />
                </span>
                <div>
                  <h3 className="text-base font-medium">{g.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                    {g.body}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
