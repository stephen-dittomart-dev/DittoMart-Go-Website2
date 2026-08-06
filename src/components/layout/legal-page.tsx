"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { SplitHeading } from "@/components/motion/split-heading";
import { AmbientBackdrop } from "@/components/visuals/ambient";
import {
  EASE,
  gsap,
  prefersReducedMotion,
  registerGsap,
  ScrollTrigger,
} from "@/lib/motion";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export type LegalSection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

/**
 * Legal pages.
 *
 * Motion language: *reading*. A progress rail fills beside the contents, the
 * active section is tracked live, and paragraphs resolve as they reach reading
 * position. Nothing decorative — the only job here is to make a long document
 * feel navigable.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      const blocks = gsap.utils.toArray<HTMLElement>("[data-legal-section]", el);
      const paras = gsap.utils.toArray<HTMLElement>("[data-legal-body] > *", el);

      if (prefersReducedMotion()) {
        gsap.set(paras, { opacity: 1, y: 0 });
        if (railRef.current) gsap.set(railRef.current, { scaleY: 1 });
        return;
      }

      if (railRef.current) {
        gsap.fromTo(
          railRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: {
              trigger: el,
              start: "top 30%",
              end: "bottom 80%",
              scrub: 0.3,
            },
          }
        );
      }

      gsap.set(paras, { opacity: 0, y: 14 });
      paras.forEach((p) => {
        gsap.to(p, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: EASE.out3,
          scrollTrigger: { trigger: p, start: "top 90%", once: true },
        });
      });

      blocks.forEach((block, i) => {
        ScrollTrigger.create({
          trigger: block,
          start: "top 40%",
          end: "bottom 40%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: root }
  );

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line pb-16 pt-36 md:pt-44">
        <AmbientBackdrop variant="quiet" />
        <div className="container-page relative">
          <div className="max-w-3xl">
            <p className="font-mono text-2xs font-medium uppercase tracking-[0.16em] text-fg-subtle">
              Legal
            </p>
            <SplitHeading
              as="h1"
              mode="words"
              scroll={false}
              delay={0.25}
              text={title}
              className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] md:text-5xl"
            />
            <p className="mt-6 text-base leading-relaxed text-fg-muted">{intro}</p>
            <p className="mt-6 font-mono text-xs text-fg-subtle">
              Last updated {updated}
            </p>
          </div>
        </div>
      </section>

      <div ref={root} className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* contents with live progress */}
          <nav aria-label="On this page" className="lg:col-span-3">
            <div className="sticky top-28">
              <p className="font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                Contents
              </p>

              <div className="mt-4 flex gap-4">
                <span className="relative block w-px shrink-0 bg-line">
                  <span
                    ref={railRef}
                    className="absolute inset-x-0 top-0 h-full origin-top bg-primary"
                    style={{ transform: "scaleY(0)" }}
                  />
                </span>

                <ol className="flex flex-col gap-2">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        aria-current={i === active ? "true" : undefined}
                        className={cn(
                          "flex gap-2.5 text-sm transition-all duration-300",
                          i === active
                            ? "translate-x-0.5 font-medium text-fg"
                            : "text-fg-muted hover:text-primary"
                        )}
                      >
                        <span className="font-mono tnum text-fg-subtle">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </nav>

          {/* body */}
          <div className="lg:col-span-9">
            <div className="flex max-w-2xl flex-col gap-12">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  data-legal-section
                  className="scroll-mt-28"
                >
                  <h2 className="flex gap-3 text-xl font-semibold tracking-[-0.02em]">
                    <span className="font-mono tnum text-fg-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.heading}
                  </h2>
                  <div data-legal-body className="mt-4 flex flex-col gap-4">
                    {s.paragraphs?.map((p) => (
                      <p key={p} className="leading-relaxed text-fg-muted">
                        {p}
                      </p>
                    ))}
                    {s.list ? (
                      <ul className="flex flex-col gap-2.5">
                        {s.list.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className="mt-[10px] size-1 shrink-0 rounded-full bg-primary"
                            />
                            <span className="leading-relaxed text-fg-muted">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}

              <div className="rounded-2xl border border-line bg-surface-2/50 p-7">
                <h2 className="text-base font-medium">Questions about this policy</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
                  Write to{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {site.email}
                  </a>{" "}
                  or reach us at {site.address}. For anything commercial, the{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    contact page
                  </Link>{" "}
                  is faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
