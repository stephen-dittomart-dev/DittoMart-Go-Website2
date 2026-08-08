"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/primitives";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { site } from "@/lib/site";

type Errors = Partial<Record<string, string>>;

const VOLUMES = [
  "Under 100 deliveries / month",
  "100 – 1,000",
  "1,000 – 10,000",
  "10,000 – 50,000",
  "Over 50,000",
];

const INTERESTS = [
  "Book a demo",
  "Technical / API review",
  "Pricing and coverage",
  "Cold chain",
  "Partnership or supply",
  "Support",
];

/**
 * Contact form.
 *
 * Motion language: *assembly then acknowledgement*. Fields cascade in on
 * first view; on submit the form collapses and a checkmark draws itself.
 * Invalid fields shake once — a single 380ms correction, never a loop.
 */
export function ContactForm() {
  const root = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  /**
   * Set when the server has no destination configured, or the destination
   * refused. The form then offers mail instead of claiming success — see the
   * route handler for why that distinction is the whole point.
   */
  const [undeliverable, setUndeliverable] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || status !== "idle") return;

      const fields = el.querySelectorAll("[data-field]");
      if (!fields.length) return;

      if (prefersReducedMotion()) {
        gsap.set(fields, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(fields, { opacity: 0, y: 20 });
      gsap.to(fields, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: EASE.out3,
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
    },
    { scope: root, dependencies: [status] }
  );

  // Success state: curtain the form, draw the tick.
  useGSAP(
    () => {
      if (status !== "sent") return;
      const el = root.current?.querySelector("[data-sent]");
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      const tick = el.querySelector("[data-tick]");
      gsap
        .timeline()
        .fromTo(
          el,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE.out4 }
        )
        .fromTo(
          tick,
          { scale: 0.3, rotate: -25 },
          { scale: 1, rotate: 0, duration: 0.6, ease: EASE.back },
          "-=0.35"
        );
    },
    { dependencies: [status] }
  );

  function shake(id: string) {
    if (prefersReducedMotion()) return;
    const el = document.getElementById(id);
    if (!el) return;
    gsap.fromTo(
      el,
      { x: -7 },
      { x: 0, duration: 0.38, ease: "elastic.out(1, 0.35)" }
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next: Errors = {};

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const company = String(form.get("company") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (name.length < 2) next.name = "Tell us who you are.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      next.email = "That does not look like a work email.";
    if (company.length < 2) next.company = "Which company are you with?";
    if (message.length < 10)
      next.message = "A sentence or two about what you ship helps a lot.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0];
      document.getElementById(first)?.focus();
      Object.keys(next).forEach(shake);
      return;
    }

    setStatus("sending");

    // Collapse the form as it goes.
    if (!prefersReducedMotion() && formRef.current) {
      gsap.to(formRef.current, {
        opacity: 0.45,
        duration: DUR.fast,
        ease: EASE.out,
      });
    }

    /* Actually send it.
    
       Previously this waited nine hundred milliseconds and declared success,
       which meant every enquiry the site collected was discarded while the
       reader was told it had arrived. Now the only thing that produces the
       success state is the server confirming it took the message. */
    let ok = false;
    let deliverable = true;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          message,
          phone: String(form.get("phone") ?? "").trim(),
          interest: String(form.get("interest") ?? ""),
          volume: String(form.get("volume") ?? ""),
          website: String(form.get("website") ?? ""),
        }),
      });
      ok = res.ok;
      if (!ok) {
        const data = (await res.json().catch(() => null)) as
          | { configured?: boolean }
          | null;
        // no endpoint configured, or the endpoint refused it
        deliverable = false;
        void data;
      }
    } catch {
      deliverable = false;
    }

    if (ok) {
      setStatus("sent");
      return;
    }

    /* It did not go. Put the form back, say so, and hand over the one route
       that always works. Anything else here would be a lie the reader has no
       way to detect. */
    setUndeliverable(!deliverable);
    setStatus("idle");
    if (!prefersReducedMotion() && formRef.current) {
      gsap.to(formRef.current, { opacity: 1, duration: DUR.fast, ease: EASE.out });
    }
  }

  return (
    <div ref={root}>
      <Card className="overflow-hidden p-7 md:p-9">
        {status === "sent" ? (
          <div
            data-sent
            className="flex flex-col items-center py-10 text-center"
            role="status"
            aria-live="polite"
          >
            <span
              data-tick
              className="flex size-14 items-center justify-center rounded-2xl border border-[color-mix(in_oklab,var(--success)_35%,transparent)] bg-success-soft text-success"
            >
              <Check aria-hidden className="size-6" strokeWidth={2.5} />
            </span>
            <h3 className="mt-6 text-xl font-semibold tracking-[-0.02em]">
              Got it — we will be in touch
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">
              Someone from the team replies within one business day. If it is
              urgent, mail us directly at{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {site.email}
              </a>
              .
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-7"
              onClick={() => setStatus("idle")}
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-6"
          >
            {/*
              The honeypot. Off-screen rather than `display: none`, which some
              bots check for, and out of the tab order and the accessibility
              tree so no reader ever meets it. A submission that fills this in
              is accepted and dropped on the server.
            */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="pointer-events-none absolute -left-[9999px] size-px opacity-0"
            />

            {undeliverable ? (
              <div
                role="alert"
                className="rounded-xl border border-warning-border bg-warning-soft px-4 py-3 text-sm leading-relaxed text-warning"
              >
                We could not send that just now. Please mail it to{" "}
                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent(
                    "Demo request"
                  )}`}
                  className="font-medium underline underline-offset-2"
                >
                  {site.email}
                </a>{" "}
                and we will pick it up from there.
              </div>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2">
              <div data-field>
                <Field label="Name" htmlFor="name" required hint={errors.name}>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="Priya Raman"
                    aria-invalid={Boolean(errors.name)}
                  />
                </Field>
              </div>

              <div data-field>
                <Field
                  label="Work email"
                  htmlFor="email"
                  required
                  hint={errors.email}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="priya@company.in"
                    aria-invalid={Boolean(errors.email)}
                  />
                </Field>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div data-field>
                <Field
                  label="Company"
                  htmlFor="company"
                  required
                  hint={errors.company}
                >
                  <Input
                    id="company"
                    name="company"
                    autoComplete="organization"
                    placeholder="Company name"
                    aria-invalid={Boolean(errors.company)}
                  />
                </Field>
              </div>

              <div data-field>
                <Field label="Phone" htmlFor="phone">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 90000 00000"
                  />
                </Field>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div data-field>
                <Field label="What is this about" htmlFor="interest">
                  <Select id="interest" name="interest" defaultValue={INTERESTS[0]}>
                    {INTERESTS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div data-field>
                <Field label="Monthly delivery volume" htmlFor="volume">
                  <Select id="volume" name="volume" defaultValue={VOLUMES[1]}>
                    {VOLUMES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>

            <div data-field>
              <Field
                label="What do you ship, and where?"
                htmlFor="message"
                required
                hint={
                  errors.message ??
                  "Cities, categories, temperature requirements — whatever is relevant."
                }
              >
                <Textarea
                  id="message"
                  name="message"
                  placeholder="We run 9 dark stores across Chennai, mostly grocery with chilled dairy. Currently on two courier contracts and reconciliation is eating two days a month."
                  aria-invalid={Boolean(errors.message)}
                />
              </Field>
            </div>

            <div
              data-field
              className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="max-w-sm text-xs leading-relaxed text-fg-subtle">
                We use this only to reply. No newsletter, no sequence, no reselling
                — see our{" "}
                <a
                  href="/privacy"
                  className="text-fg-muted underline underline-offset-2"
                >
                  privacy policy
                </a>
                .
              </p>
              <Button type="submit" size="lg" disabled={status === "sending"}>
                {status === "sending" ? (
                  <>
                    <Loader2 aria-hidden className="animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight aria-hidden />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
