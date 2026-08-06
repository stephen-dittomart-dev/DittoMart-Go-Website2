"use client";

import { useGSAP } from "@gsap/react";
import { Building2, Clock, Code2, LifeBuoy, Mail, MapPin, Phone } from "lucide-react";
import { useRef } from "react";
import { Card, Section } from "@/components/ui/primitives";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { site } from "@/lib/site";

const ROUTES = [
  {
    icon: Building2,
    title: "Sales & demos",
    body: "Volume, coverage, pricing and a walkthrough against your actual order profile.",
    action: { label: site.email, href: `mailto:${site.email}` },
  },
  {
    icon: Code2,
    title: "Technical review",
    body: "Integration questions, sandbox credentials, webhook design and failure modes. You get an engineer.",
    action: { label: "Ask for an engineer", href: "#form" },
  },
  {
    icon: LifeBuoy,
    title: "Existing customers",
    body: "Live order issues, disputes and escalations. Support is staffed during operating hours.",
    action: { label: site.supportEmail, href: `mailto:${site.supportEmail}` },
  },
];

/**
 * Contact routes.
 *
 * Motion language on this page is *arrival* — cards drop and settle with a
 * short overshoot, which reads as a door opening rather than a page loading.
 */
export function ContactRoutes() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-route]", el);

      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: -26 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.4)",
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <Section className="border-b border-line py-16 md:py-20">
      <div ref={root} className="container-page">
        <div className="grid gap-4 md:grid-cols-3">
          {ROUTES.map((r) => (
            <div key={r.title} data-route>
              <Card className="flex h-full flex-col p-7 hover:-translate-y-1 hover:border-primary-border">
                <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface-2 text-primary">
                  <r.icon aria-hidden className="size-[18px]" />
                </span>
                <h2 className="mt-5 text-base font-medium">{r.title}</h2>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fg-muted">
                  {r.body}
                </p>
                <a
                  href={r.action.href}
                  className="group mt-6 inline-flex text-sm font-medium text-primary"
                >
                  <span className="relative">
                    {r.action.label}
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-primary transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100"
                    />
                  </span>
                </a>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------- */

export function ContactDetails() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-detail]", el);
      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, x: 0 });
        return;
      }
      gsap.set(cards, { opacity: 0, x: 26 });
      gsap.to(cards, {
        opacity: 1,
        x: 0,
        duration: 0.7,
        ease: EASE.out4,
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="flex flex-col gap-4">
      <div data-detail>
        <Card className="p-7">
          <h2 className="text-base font-medium">Where we are</h2>
          <ul className="mt-5 flex flex-col gap-4 text-sm text-fg-muted">
            <li className="flex items-start gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
              <span>{site.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail aria-hidden className="size-4 shrink-0 text-fg-subtle" />
              <a
                href={`mailto:${site.email}`}
                className="transition-colors hover:text-fg"
              >
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone aria-hidden className="size-4 shrink-0 text-fg-subtle" />
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-fg"
              >
                {site.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
              <span>
                Monday to Saturday, 9:00 – 19:00 IST
                <br />
                <span className="text-xs text-fg-subtle">
                  Live order support runs longer for enterprise accounts.
                </span>
              </span>
            </li>
          </ul>
        </Card>
      </div>

      <div data-detail>
        <Card className="border-primary-border bg-[linear-gradient(155deg,var(--primary-soft),transparent_60%)] p-7">
          <h2 className="text-base font-medium">Prefer to start building?</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
            Sandbox credentials do not require a sales conversation. Say so in the
            form and we will send keys and a quickstart the same day.
          </p>
        </Card>
      </div>

      <div data-detail>
        <Card className="border-dashed p-7">
          <h2 className="text-sm font-medium">Delivery partners</h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Running a fleet or an agency and want volume? Choose &ldquo;Partnership
            or supply&rdquo; in the form — we onboard agencies continuously.
          </p>
        </Card>
      </div>
    </div>
  );
}
