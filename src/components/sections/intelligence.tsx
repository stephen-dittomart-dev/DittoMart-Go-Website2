"use client";

import { useGSAP } from "@gsap/react";
import {
  Camera,
  Clock4,
  MessageSquare,
  PhoneCall,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useRef } from "react";
import { Spotlight } from "@/components/motion/interactions";
import { SplitHeading } from "@/components/motion/split-heading";
import { Badge, Card, Eyebrow, Section } from "@/components/ui/primitives";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Camera,
    title: "Pickup verification",
    body: "Vision checks the pickup photo against the order before the rider leaves. Wrong item, wrong count, damaged packaging — caught at the vendor, not at the door.",
    status: "Live",
    span: "lg:col-span-4",
  },
  {
    icon: ShieldAlert,
    title: "Fraud detection",
    body: "Fake proof of delivery, spoofed GPS, ghost deliveries and rider collusion, scored on every completion.",
    status: "Live",
    span: "lg:col-span-4",
  },
  {
    icon: PhoneCall,
    title: "Voice compliance, in Tamil",
    body: "When a rider goes idle and stops answering notifications, the system calls them — in their language — understands the reason, and acts on it.",
    status: "Live",
    span: "lg:col-span-4",
  },
  {
    icon: Clock4,
    title: "ETA prediction",
    body: "Per-rider, per-route models trained on your own delivery history, not on generic map estimates.",
    status: "Rolling out",
    span: "lg:col-span-6",
  },
  {
    icon: TrendingUp,
    title: "Demand-aware pricing",
    body: "Supply and demand density per zone, per hour — so surge reflects the market instead of a fixed peak window.",
    status: "Rolling out",
    span: "lg:col-span-3",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp ordering",
    body: "Create and track deliveries in Tamil from a chat thread. No app to install.",
    status: "Rolling out",
    span: "lg:col-span-3",
  },
];

/**
 * Intelligence bento.
 *
 * Animation language: *depth*. Cards arrive on a Z axis with a slight X
 * rotation from a shared perspective origin, so the grid assembles as a
 * physical stack rather than a list of fades. Each card then tilts to the
 * pointer independently.
 */
export function Intelligence() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-ai-card]", el);

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, y: 0, rotateX: 0, scale: 1 });
        return;
      }

      gsap.set(cards, {
        opacity: 0,
        y: 54,
        z: -180,
        rotateX: -18,
        transformOrigin: "50% 100%",
      });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        duration: 1.05,
        ease: EASE.out4,
        stagger: { each: 0.08, from: "start" },
        scrollTrigger: { trigger: el, start: "top 76%", once: true },
      });

      // Pointer tilt per card — GSAP quickTo keeps it off the React render path.
      cards.forEach((card) => {
        const rx = gsap.quickTo(card, "rotateX", { duration: 0.5, ease: EASE.out3 });
        const ry = gsap.quickTo(card, "rotateY", { duration: 0.5, ease: EASE.out3 });

        const onMove = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          rx(-py * 7);
          ry(px * 7);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };

        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
      });
    },
    { scope: root }
  );

  return (
    <Section id="ai" className="relative border-b border-line">
      <div className="container-page">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Eyebrow>Intelligence</Eyebrow>
          <SplitHeading
            as="h2"
            mode="words"
            text="AI where it changes an outcome — nowhere else"
            className="text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
          />
          <p className="max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg">
            Every model here has a kill switch and every decision it makes can be
            overridden by a human with a recorded reason. Automation you cannot turn
            off is not automation, it is a liability.
          </p>
        </div>

        <div ref={root} className="persp mt-14 grid gap-4 lg:grid-cols-12">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              data-ai-card
              className={cn("lg:col-span-4 [transform-style:preserve-3d]", f.span)}
            >
              <Spotlight className="h-full rounded-2xl">
                <Card className="flex h-full flex-col p-6 hover:border-line-strong hover:shadow-e2 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-10 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--ai)_28%,transparent)] bg-ai-soft text-ai">
                      <f.icon aria-hidden className="size-[18px]" />
                    </span>
                    <Badge
                      size="sm"
                      variant={f.status === "Live" ? "success" : "outline"}
                    >
                      {f.status}
                    </Badge>
                  </div>
                  <h3 className="mt-5 text-base font-medium tracking-[-0.01em]">
                    {f.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                    {f.body}
                  </p>
                </Card>
              </Spotlight>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-dashed border-line px-6 py-5 text-center">
          <p className="text-sm text-fg-muted">
            <span className="font-medium text-fg">Kill switch per feature.</span>{" "}
            <span className="font-medium text-fg">Override with a reason.</span>{" "}
            <span className="font-medium text-fg">Every decision audited.</span>
          </p>
        </div>
      </div>
    </Section>
  );
}
