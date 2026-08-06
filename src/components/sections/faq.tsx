"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eyebrow, Section } from "@/components/ui/primitives";
import { faqs as defaultFaqs, type Faq } from "@/lib/faqs";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";

/**
 * FAQ.
 *
 * Animation language: *unrolling*. Rows wipe down one after another behind
 * their own divider, so the list assembles top-to-bottom like a document
 * being read rather than a grid appearing.
 */
export function FAQ({
  items = defaultFaqs,
  eyebrow = "FAQ",
  title = "Questions we get in the first call",
}: {
  items?: Faq[];
  eyebrow?: string;
  title?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-faq-row]", el);

      if (prefersReducedMotion()) {
        gsap.set(rows, { opacity: 1, y: 0, clipPath: "none" });
        return;
      }

      gsap.set(rows, {
        opacity: 0,
        y: 18,
        clipPath: "inset(0% 0% 100% 0%)",
      });

      gsap.to(rows, {
        opacity: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.62,
        ease: EASE.out3,
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <Section id="faq" className="border-b border-line">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Eyebrow>{eyebrow}</Eyebrow>
            <SplitHeading
              as="h2"
              mode="lines"
              text={title}
              className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.028em] md:text-4xl"
            />
            <p className="mt-6 text-sm leading-relaxed text-fg-muted">
              Something not covered here?{" "}
              <Link
                href="/contact"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Talk to the team
              </Link>{" "}
              — you will get an engineer, not a form.
            </p>
          </div>

          <div ref={root} className="lg:col-span-8">
            <Accordion type="single" collapsible className="w-full">
              {items.map((f, i) => (
                <div key={f.q} data-faq-row>
                  <AccordionItem value={`item-${i}`}>
                    <AccordionTrigger>
                      <span className="flex gap-4">
                        <span className="mt-0.5 font-mono text-xs tnum text-fg-subtle">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {f.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-[2.4rem]">{f.a}</AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </Section>
  );
}
