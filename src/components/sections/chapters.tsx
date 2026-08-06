"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Chapter, MediaPlate, StatStrip } from "@/components/motion/scene";
import { SplitHeading } from "@/components/motion/split-heading";
import { Badge, Eyebrow } from "@/components/ui/primitives";
import { media } from "@/lib/media";

/* =========================================================================
   The illustrated chapters.

   Each one pairs a supplied render with the matching section of the A-to-Z
   flowchart, alternating side so the page never repeats a layout twice in a
   row, and every band closes flush against the next — no empty gutters.
   ========================================================================= */

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 flex flex-col gap-3.5">
      {items.map((p) => (
        <li key={p} className="flex items-start gap-3">
          <Check
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-primary"
            strokeWidth={3}
          />
          <span className="text-sm leading-relaxed text-fg-muted md:text-base">
            {p}
          </span>
        </li>
      ))}
    </ul>
  );
}

function More({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary"
    >
      {label}
      <ArrowRight
        aria-hidden
        className="size-4 transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}

/* ---------------------------------------------------------------- wallet */

export function WalletChapter() {
  return (
    <>
      <Chapter
        id="wallet"
        eyebrow={<Eyebrow>Wallet engine</Eyebrow>}
        media={
          <MediaPlate
            entry={media.wallet}
            glow="primary"
            motion="jump"
            spin
          />
        }
      >
        <SplitHeading
          as="h2"
          mode="bounce"
          text="No order leaves without money behind it"
          className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
        />
        <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
          Any order without wallet balance never reaches a delivery partner. The
          gate runs before a single provider is contacted — insufficient balance
          returns HTTP 402 and the order waits at PENDING_PAYMENT instead of
          being lost.
        </p>
        <Points
          items={[
            "Client recharge, payment verification, balance update",
            "Auto-block below your minimum threshold",
            "Per-order deduction at your contracted rate",
            "Monthly tax invoice auto-generated with 18% GST",
            "Weekly 3PL settlement by NEFT, reconciled against invoices",
          ]}
        />
        <More href="/platform#wallet" label="See the wallet gate" />
      </Chapter>

      <StatStrip
        items={[
          { value: "HTTP 402", label: "Insufficient balance" },
          { value: "₹0", label: "Receivables risk" },
          { value: "18%", label: "GST auto-applied" },
          { value: "Weekly", label: "NEFT settlement" },
        ]}
      />
    </>
  );
}

/* --------------------------------------------------------------- engines */

export function EnginesChapter() {
  return (
    <Chapter
      id="tariff"
      flip
      tone="tint"
      eyebrow={<Eyebrow>Tariff &amp; trigger</Eyebrow>}
      media={
        <MediaPlate
          entry={media.engines}
          glow="accent"
            motion="rotate"
            spin
        />
      }
    >
      <SplitHeading
        as="h2"
        mode="lines-alt"
        text="Four tariff types. Two trigger modes. Zero deploys."
        className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
      />
      <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
        Rates resolve through a four-tier priority match — client + provider +
        zone first, then client + provider, then client + zone, then a
        client-wide flat rate. Everything is admin configuration.
      </p>
      <Points
        items={[
          "Type A provider-based · Type B agency-based · Type C zone-based · Type D flat",
          "Add-ons: COD charge, express, night surcharge, RTO charge",
          "Broadcast mode — every partner at once, first responder wins",
          "Sequential mode — priority order with configurable wait times",
        ]}
      />
      <More href="/platform#tariff" label="Explore the engines" />
    </Chapter>
  );
}

/* ---------------------------------------------------------- agency fleet */

export function AgencyChapter() {
  return (
    <Chapter
      id="agency"
      eyebrow={<Eyebrow>Direct agency</Eyebrow>}
      media={
        <MediaPlate
          entry={media.agencyFleet}
          glow="accent"
            motion="unfold"
        />
      }
    >
      <SplitHeading
        as="h2"
        mode="bounce-chars"
        text="Our own fleet, when our own fleet is better"
        className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
      />
      <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
        Partner agencies onboard with GST, service pincodes, fleet size, vehicle
        types and bank details. Riders are verified individually — driving
        licence, RC and Aadhaar — before a single order reaches them.
      </p>
      <Points
        items={[
          "Rider roster with live online and offline status",
          "Assigned orders, unassigned queue and manual reassign",
          "Weekly statement: rate × delivered − penalties − SLA deductions",
          "48-hour dispute window before NEFT payout",
          "Zone heatmap, best and worst riders, monthly trends",
        ]}
      />
      <More href="/network" label="See how routing decides" />
    </Chapter>
  );
}

/* ------------------------------------------------------------- cold chain */

export function ColdChainChapter() {
  return (
    <>
      <Chapter
        id="cold"
        flip
        tone="tint"
        eyebrow={
          <Badge variant="accent" size="sm">
            The moat
          </Badge>
        }
        media={
          <MediaPlate
            entry={media.coldChain}
            glow="accent"
            motion="swing"
          />
        }
      >
        <SplitHeading
          as="h2"
          mode="lines-alt"
          text="Meat, dairy and vaccines need proof, not promises"
          className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
        />
        <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
          FROZEN, CHILLED, AMBIENT and HOT with min and max temperatures on the
          order itself, auto-matched to a vehicle certified to carry it. A BLE
          sensor inside the insulated box reports every 30 seconds.
        </p>
        <Points
          items={[
            "FSSAI licence tracking for riders and vehicles, with expiry alerts",
            "Slot delivery — morning 5–8 AM, evening, 45-minute express, economy",
            "Pickup condition photo before the rider leaves the vendor",
            "Perishable RTO protocol — returned meat and dairy are auto-discarded",
            "Supplier quality score from rejection and return rate",
          ]}
        />
        <More href="/cold-chain" label="Read the full protocol" />
      </Chapter>

      <StatStrip
        items={[
          { value: "4", label: "Temperature classes" },
          { value: "30s", label: "Sensor reading interval" },
          { value: "−4°C", label: "Live box reading" },
          { value: "0", label: "Unverifiable handovers" },
        ]}
      />
    </>
  );
}

/* -------------------------------------------------------- rider compliance */

export function RiderChapter() {
  return (
    <Chapter
      id="compliance"
      eyebrow={<Eyebrow>Rider compliance</Eyebrow>}
      media={
        <MediaPlate
          entry={media.riderCompliance}
          glow="ai"
            motion="slide"
        />
      }
    >
      <SplitHeading
        as="h2"
        mode="bounce"
        text="GPS checked every ten seconds. Escalated in Tamil."
        className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
      />
      <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
        Four monitored scenarios — idle after accept, wrong-direction movement,
        GPS signal lost, and arrived at pickup with no action. Each escalates on
        a timer, and if push and SMS go unanswered the system places an AI voice
        call in the rider&apos;s own language.
      </p>
      <Points
        items={[
          "Idle after accept — alert at 3 min, second warning at 5, auto-reassign at 7",
          "Wrong direction — forced popup at 8 min, reassign at 10, third strike suspends 24h",
          "GPS lost — alert at 60s, IVR call at 3 min, reassign at 5",
          "At pickup, no action — reason picker at 10 min, ops call at 20, force-cancel at 30",
          "Every threshold is admin-configurable in the database, not hardcoded",
        ]}
      />
      <More href="/platform#compliance" label="See the escalation ladder" />
    </Chapter>
  );
}

/* ---------------------------------------------------------------- ai */

export function AnalyticsChapter() {
  return (
    <Chapter
      id="analytics"
      flip
      tone="tint"
      eyebrow={
        <Badge variant="ai" size="sm">
          AI &amp; data
        </Badge>
      }
      media={
        <MediaPlate
          entry={media.analytics}
          glow="ai"
            motion="zoom"
            spin
        />
      }
    >
      <SplitHeading
        as="h2"
        mode="lines-alt"
        text="Collect from day one. Predict after ten thousand."
        className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
      />
      <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
        Every order event is stored with its timestamp and context from the very
        first delivery — zone, hour, day, weather correlation, rider performance,
        predicted versus actual ETA, cost versus revenue, GPS anomalies.
      </p>
      <Points
        items={[
          "Demand forecasting and rider pre-positioning",
          "Dynamic surge pricing by zone and hour",
          "ETA prediction to ±2 minutes against Google Maps' ±8",
          "Fraud detection — fake POD via EXIF, GPS spoofing, ghost delivery",
          "All scoring weights live in the database — a model update needs zero deploys",
        ]}
      />
      <More href="/platform#ai" label="See the AI feature set" />
    </Chapter>
  );
}

/* --------------------------------------------------------------- api */

export function ApiChapter() {
  return (
    <Chapter
      id="api"
      eyebrow={<Eyebrow>API architecture</Eyebrow>}
      media={
        <MediaPlate
          entry={media.apiGateway}
          glow="primary"
            motion="flip"
        />
      }
    >
      <SplitHeading
        as="h2"
        mode="chars"
        text="One gateway. Every provider."
        className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl"
      />
      <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
        Your app calls our REST API with authentication and wallet verification.
        We call the provider APIs. Their status updates land on our webhook
        receiver and are forwarded to yours. You integrate once.
      </p>
      <Points
        items={[
          "We buy provider API subscriptions at bulk rates and resell with markup",
          "The wallet removes credit risk — cash is always upfront",
          "Multi-provider architecture means no single point of failure",
          "One unified API surface across every partner network",
        ]}
      />
      <More href="/developers" label="Read the API reference" />
    </Chapter>
  );
}
