"use client";

import { useGSAP } from "@gsap/react";
import {
  Camera,
  FileCheck2,
  Gauge,
  ShieldAlert,
  Star,
  Thermometer,
  Trash2,
  Truck,
} from "lucide-react";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { Card, Eyebrow, Section } from "@/components/ui/primitives";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/**
 * Section 21 of the flowchart — the cold-chain protocol in full.
 *
 * Motion language on this page is *crystallisation*, so these rows resolve
 * from blur in a slow cascade rather than sliding.
 */

const PROTOCOL = [
  {
    icon: Thermometer,
    title: "Product classification",
    body: "FROZEN, CHILLED, AMBIENT or HOT with a min and max temperature carried on the order itself, matched automatically to a vehicle certified to hold it.",
  },
  {
    icon: FileCheck2,
    title: "FSSAI compliance",
    body: "Rider FSSAI licence tracking, vehicle food-safety certificates, expiry alerts before they lapse, and a compliance view your auditor can read.",
  },
  {
    icon: Truck,
    title: "Slot-based delivery",
    body: "Morning (5–8 AM), evening, express (45 minutes) and economy end-of-day windows — because perishables move on a schedule, not on demand.",
  },
  {
    icon: Camera,
    title: "Pickup condition photo",
    body: "The rider photographs the consignment before it leaves the vendor. Client-side verification, and freshness evidence from the first minute.",
  },
  {
    icon: Trash2,
    title: "Perishable RTO protocol",
    body: "Meat or dairy returned? Auto-discard. Perishables are never re-delivered — they are marked as wastage and accounted for, not quietly recirculated.",
  },
  {
    icon: Star,
    title: "Supplier quality score",
    body: "Rejection and return rate tracked per supplier, scored automatically and visible to the client. Bad batches become data instead of arguments.",
  },
  {
    icon: Gauge,
    title: "IoT sensor pipeline",
    body: "A BLE sensor inside the insulated box reports every 30 seconds. Breach alerts fire immediately and an unsafe delivery is auto-rejected before handover.",
  },
  {
    icon: ShieldAlert,
    title: "Digital Proof of Freshness",
    body: "Pickup photo, the full temperature graph and the delivery photo, sealed into one immutable certificate. That certificate is the product.",
  },
];

export function ColdChainProtocol() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-cp]", el);

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, y: 0, filter: "none" });
        return;
      }

      gsap.set(rows, { opacity: 0, y: 28, filter: "blur(9px)" });
      gsap.to(rows, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.85,
        ease: EASE.out4,
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <Section className="border-b border-line">
      <div className="container-page">
        <div className="flex flex-col gap-5">
          <Eyebrow>The protocol</Eyebrow>
          <SplitHeading
            as="h2"
            mode="lines"
            text="Eight rules that make a temperature claim defensible"
            className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Generic two-wheeler aggregators do none of this. It is the whole reason
            food, pharmacy and diagnostics buyers move to us.
          </p>
        </div>

        <div ref={root} className="mt-14 grid gap-4 md:grid-cols-2">
          {PROTOCOL.map((p) => (
            <div key={p.title} data-cp>
              <Card className="flex h-full gap-5 p-7 hover:border-[color-mix(in_oklab,var(--accent)_40%,transparent)]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-accent-soft text-accent">
                  <p.icon aria-hidden className="size-[18px]" />
                </span>
                <div>
                  <h3 className="text-base font-medium">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                    {p.body}
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
