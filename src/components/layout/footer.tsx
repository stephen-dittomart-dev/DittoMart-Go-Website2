"use client";

import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Logo } from "@/components/brand/logo";
import { EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { footerNav, site } from "@/lib/site";

/**
 * Footer.
 *
 * The oversized wordmark drifts on scroll and the link columns cascade —
 * the page's last gesture is a slow exhale rather than another reveal.
 */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const year = new Date().getFullYear();

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-ft]"), { opacity: 1, y: 0 });
        return;
      }

      gsap.set(q("[data-ft='col']"), { opacity: 0, y: 22 });
      gsap.set(q("[data-ft='brand']"), { opacity: 0, y: 22 });

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } })
        .to(q("[data-ft='brand']"), {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: EASE.out4,
        })
        .to(
          q("[data-ft='col']"),
          { opacity: 1, y: 0, duration: 0.6, ease: EASE.out3, stagger: 0.08 },
          "-=0.5"
        );

      // The wordmark slides counter to the scroll — depth at the very bottom.
      gsap.fromTo(
        q("[data-ft='wordmark']"),
        { xPercent: -3 },
        {
          xPercent: 3,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.8,
          },
        }
      );
    },
    { scope: root }
  );

  return (
    <footer
      ref={root}
      className="relative overflow-hidden border-t border-line bg-bg-subtle"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-border to-transparent"
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-[0.5] mask-fade-b"
      />

      <div className="container-page relative">
        <div className="grid gap-14 py-20 lg:grid-cols-12">
          <div data-ft="brand" className="lg:col-span-4">
            <Logo id="footer" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-fg-muted">
              The delivery operating system for businesses that ship. One
              integration, every network, complete control.
            </p>

            <ul className="mt-7 flex flex-col gap-3 text-sm text-fg-muted">
              <li className="flex items-start gap-2.5">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                <span>{site.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail aria-hidden className="size-4 shrink-0 text-fg-subtle" />
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors hover:text-fg"
                >
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone aria-hidden className="size-4 shrink-0 text-fg-subtle" />
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-fg"
                >
                  {site.phone}
                </a>
              </li>
            </ul>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {footerNav.map((col) => (
              <div key={col.heading} data-ft="col">
                <h2 className="font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                  {col.heading}
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-fg-muted transition-colors duration-200 hover:text-fg"
                      >
                        <span className="relative">
                          {link.label}
                          <span
                            aria-hidden
                            className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-primary transition-transform duration-300 [transition-timing-function:var(--ease-standard)] group-hover:origin-left group-hover:scale-x-100"
                          />
                        </span>
                        <ArrowUpRight
                          aria-hidden
                          className="size-3 opacity-0 transition-all duration-200 group-hover:translate-x-px group-hover:opacity-60"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Oversized wordmark — the one purely typographic flourish on the site */}
        <div
          aria-hidden
          className="pointer-events-none select-none overflow-hidden border-t border-line pt-10"
        >
          <div
            data-ft="wordmark"
            className="whitespace-nowrap text-[15vw] font-semibold leading-[0.8] tracking-[-0.05em] text-fg opacity-[0.045] lg:text-[11rem]"
          >
            DittoMart Go
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. DittoMart Go is a product of {site.company}.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-fg">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-fg">
              Terms
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-success" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
