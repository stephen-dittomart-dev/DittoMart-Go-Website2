"use client";

import { useGSAP } from "@gsap/react";
import { BookOpen, KeyRound, Package, ShieldCheck, TestTube2, Webhook } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { Badge, Card, Eyebrow, Section } from "@/components/ui/primitives";
import { CodeWindow } from "@/components/visuals/code-window";
import {
  quoteResponse,
  quoteSample,
  webhookSample,
} from "@/lib/code-samples";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/* =========================================================================
   Developers page motion language: *console output*.
   Lists print line by line at a monospace cadence, badges land last, and
   nothing eases in from below — output appears, it does not float.
   ========================================================================= */

const DX = [
  {
    icon: KeyRound,
    title: "Sandbox before signature",
    body: "Keys are issued the moment you sign up. Build the whole integration against simulated riders before a contract exists — approval gates live keys, not your development.",
  },
  {
    icon: TestTube2,
    title: "A sandbox that behaves",
    body: "Simulated riders move through every state, including the ones you would rather not think about: allocation failure, RTO, SLA breach and temperature excursion.",
  },
  {
    icon: ShieldCheck,
    title: "Signed and replayable",
    body: "Every webhook carries an HMAC signature and an idempotency key. Failed deliveries are retried automatically and can be replayed by hand from the dashboard.",
  },
  {
    icon: Package,
    title: "SDKs where they help",
    body: "Node and Python clients with typed responses and automatic retry. Everywhere else, the REST surface is small enough that a wrapper would be overhead.",
  },
];

export function DevExperience() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-dx]", el);

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, clipPath: "none" });
        return;
      }

      gsap.set(cards, { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" });
      gsap.to(cards, {
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.7,
        ease: EASE.out3,
        stagger: 0.11,
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <Section className="border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>Developer experience</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines"
            text="Designed by people who have integrated a courier API"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Which is to say: designed against the specific ways those integrations
            usually go wrong.
          </p>
        </div>

        <div ref={root} className="mt-14 grid gap-4 md:grid-cols-2">
          {DX.map((d) => (
            <div key={d.title} data-dx>
              <Card className="flex h-full gap-5 p-7 hover:border-primary-border">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-2 text-primary">
                  <d.icon aria-hidden className="size-[18px]" />
                </span>
                <div>
                  <h3 className="text-base font-medium">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                    {d.body}
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

/* ---------------------------------------------------------------------- */

const ENDPOINTS = [
  { method: "POST", path: "/api/v1/orders", desc: "Create a delivery" },
  { method: "GET", path: "/api/v1/orders/:id", desc: "Status, rider and ETA" },
  { method: "POST", path: "/api/v1/orders/:id/cancel", desc: "Cancel, policy-driven" },
  { method: "GET", path: "/api/v1/orders/:id/track", desc: "Live tracking payload" },
  { method: "POST", path: "/api/v1/quote", desc: "Rate preview before committing" },
  { method: "POST", path: "/api/v1/serviceability", desc: "Is this route serviceable" },
  { method: "GET", path: "/api/v1/wallet", desc: "Balance and ledger" },
  { method: "GET", path: "/api/v1/invoices", desc: "Invoices and statements" },
  { method: "POST", path: "/api/v1/disputes", desc: "Raise a dispute" },
];

const methodTone: Record<string, string> = {
  GET: "text-accent border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-accent-soft",
  POST: "text-primary border-primary-border bg-primary-soft",
};

export function DevEndpoints() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-ep], [data-ep-badge]"), { opacity: 1, x: 0, scale: 1 });
        return;
      }

      gsap.set(q("[data-ep]"), { opacity: 0, x: -14 });
      gsap.set(q("[data-ep-badge]"), { opacity: 0, scale: 0.6 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } })
        // rows print at a steady console cadence
        .to(q("[data-ep]"), {
          opacity: 1,
          x: 0,
          duration: 0.24,
          ease: EASE.out,
          stagger: 0.055,
        })
        .to(
          q("[data-ep-badge]"),
          { opacity: 1, scale: 1, duration: 0.22, ease: EASE.back, stagger: 0.055 },
          0.1
        );
    },
    { scope: root }
  );

  return (
    <Section id="endpoints" className="scroll-mt-24 border-b border-line">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Eyebrow>Reference</Eyebrow>
              <SplitHeading
                as="h2"
                mode="chars"
                text="The entire API"
                className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
              />
              <p className="mt-5 max-w-md leading-relaxed text-fg-muted">
                Versioned from day one. New capability arrives as new fields and
                new endpoints — never as a migration you have to schedule.
              </p>
              <Button asChild variant="outline" className="mt-8">
                <Link href="/contact">
                  <BookOpen aria-hidden />
                  Request full documentation
                </Link>
              </Button>
            </div>
          </div>

          <div ref={root} className="lg:col-span-8">
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {ENDPOINTS.map((e) => (
                  <li
                    key={e.path}
                    data-ep
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-surface-2/50"
                  >
                    <span
                      data-ep-badge
                      className={cn(
                        "shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold",
                        methodTone[e.method]
                      )}
                    >
                      {e.method}
                    </span>
                    <code className="font-mono text-xs text-fg md:text-[13px]">
                      {e.path}
                    </code>
                    <span className="ml-auto text-xs text-fg-subtle">{e.desc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */

export function DevAuth() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-auth]", el);
      if (prefersReducedMotion()) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(items, { opacity: 0, y: 14 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: EASE.out3,
        stagger: 0.07,
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <Section id="auth" className="scroll-mt-24 border-b border-line">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div ref={root} className="lg:col-span-5">
            <Badge variant="brand" size="sm">
              <KeyRound aria-hidden className="size-3" />
              Authentication
            </Badge>
            <SplitHeading
              as="h2"
              mode="lines"
              text="One header, scoped keys"
              className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
            />
            <p className="mt-5 max-w-xl leading-relaxed text-fg-muted">
              Bearer authentication with keys that are hashed at rest, scoped to
              specific capabilities, and revocable or rotatable without downtime.
              Every call is rate-limited per tenant and idempotent on your own
              order reference.
            </p>

            <ul className="mt-8 flex flex-col gap-3.5">
              {[
                "Keys hashed at rest — we cannot show you an existing key, only issue a new one",
                "Scope a key to order creation without granting wallet access",
                "Separate sandbox and live keys that cannot be confused",
                "Rotate without downtime: two keys valid during the overlap window",
              ].map((b) => (
                <li key={b} data-auth className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-[9px] size-1 shrink-0 rounded-full bg-primary"
                  />
                  <span className="text-sm leading-relaxed text-fg-muted">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <CodeWindow
              samples={quoteSample}
              response={quoteResponse}
              title="Quote before you commit"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */

const EVENTS = [
  { name: "order.assigned", desc: "A provider accepted and a rider is allocated" },
  { name: "order.picked_up", desc: "Consignment collected from the pickup point" },
  { name: "order.in_transit", desc: "Rider is moving toward the drop" },
  { name: "order.delivered", desc: "Handover complete with proof attached" },
  { name: "order.rto", desc: "Returned to origin, with reason" },
  { name: "order.failed", desc: "Delivery could not be completed" },
  { name: "order.sla_breach", desc: "The SLA on the order was missed" },
  { name: "wallet.low_balance", desc: "Balance fell below your threshold" },
  { name: "temperature.breach", desc: "Cold-chain reading left the safe range" },
];

export function DevWebhooks() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-evt]", el);

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, x: 0 });
        return;
      }

      gsap.set(rows, { opacity: 0, x: 12 });
      gsap.to(rows, {
        opacity: 1,
        x: 0,
        duration: 0.28,
        ease: EASE.out,
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <Section id="webhooks" className="scroll-mt-24 border-b border-line">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <CodeWindow samples={webhookSample} title="Webhook delivery" />
          </div>

          <div ref={root} className="lg:col-span-5">
            <Badge variant="brand" size="sm">
              <Webhook aria-hidden className="size-3" />
              Webhooks
            </Badge>
            <SplitHeading
              as="h2"
              mode="lines"
              text="Nine events, pushed and proven"
              className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
            />
            <p className="mt-5 max-w-xl leading-relaxed text-fg-muted">
              You should never have to poll for an order status. Every state change
              is delivered to your endpoint, signed, with automatic retry and a
              replay button for the times your service was down.
            </p>

            <ul className="mt-8 flex flex-col">
              {EVENTS.map((e) => (
                <li
                  key={e.name}
                  data-evt
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-line py-2.5 last:border-b-0"
                >
                  <code className="font-mono text-xs text-primary">{e.name}</code>
                  <span className="text-xs text-fg-subtle">{e.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */

export function DevSandbox() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      if (prefersReducedMotion()) {
        gsap.set(q("[data-sb], [data-sdk]"), { opacity: 1, y: 0, scale: 1 });
        return;
      }
      gsap.set(q("[data-sb]"), { opacity: 0, y: 26 });
      gsap.set(q("[data-sdk]"), { opacity: 0, scale: 0.8 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } })
        .to(q("[data-sb]"), {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: EASE.out4,
          stagger: 0.1,
        })
        .to(
          q("[data-sdk]"),
          { opacity: 1, scale: 1, duration: 0.35, ease: EASE.back, stagger: 0.06 },
          "-=0.3"
        );
    },
    { scope: root }
  );

  return (
    <Section id="sandbox" className="scroll-mt-24 border-b border-line">
      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Eyebrow>Sandbox &amp; SDKs</Eyebrow>
          <SplitHeading
            as="h2"
            mode="words"
            text="Test the failures, not just the happy path"
            className="text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Any integration can handle a successful delivery. The sandbox lets you
            drive the ones that actually page your on-call.
          </p>
        </div>

        <div ref={root} className="mt-14">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                t: "Simulated riders",
                b: "Drive an order through assignment, pickup, transit and delivery on demand — or force it to stall.",
              },
              {
                t: "Forced exceptions",
                b: "Trigger allocation failure, RTO, SLA breach, insufficient balance and temperature excursion directly.",
              },
              {
                t: "Webhook inspector",
                b: "See exactly what we sent, what your endpoint returned, and replay any delivery.",
              },
            ].map((x) => (
              <div key={x.t} data-sb>
                <Card className="h-full p-7 hover:border-primary-border">
                  <h3 className="text-base font-medium">{x.t}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                    {x.b}
                  </p>
                </Card>
              </div>
            ))}
          </div>

          <div
            id="sdks"
            className="mt-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-dashed border-line p-6"
          >
            <span className="text-sm text-fg-muted">Official SDKs:</span>
            {["Node", "Python", "PHP (beta)", "Java (beta)"].map((s) => (
              <span
                key={s}
                data-sdk
                className="rounded-full border border-line bg-surface-2/60 px-3 py-1.5 font-mono text-xs text-fg-muted"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
