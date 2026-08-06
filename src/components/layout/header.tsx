"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useScrollControl } from "@/components/motion/scroll-provider";
import { Button } from "@/components/ui/button";
import { useMagnetic } from "@/hooks/use-motion";
import { getIcon } from "@/lib/icon-registry";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { navigation, type NavGroup } from "@/lib/site";
import { cn } from "@/lib/utils";

function Icon({ name, className }: { name?: string; className?: string }) {
  const Cmp = getIcon(name);
  if (!Cmp) return null;
  return <Cmp aria-hidden className={className} />;
}

export function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const ctaRef = useMagnetic<HTMLSpanElement>(0.22, 1.03);
  const { lockScroll } = useScrollControl();

  /* ---------- scroll state: condense, and hide on downward scroll -------- */
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      // Only hide well past the hero, and never while a menu is open.
      if (!open && !mobileOpen && y > 320) {
        setHidden(y > last + 4);
      } else {
        setHidden(false);
      }
      last = y;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, mobileOpen]);

  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    lockScroll(mobileOpen);
    return () => lockScroll(false);
  }, [mobileOpen, lockScroll]);

  /* ---------- hover pill that slides between nav items ------------------ */
  const movePill = useCallback((target: HTMLElement | null) => {
    const pill = pillRef.current;
    const list = listRef.current;
    if (!pill || !list) return;

    if (!target) {
      gsap.to(pill, { autoAlpha: 0, duration: DUR.micro });
      return;
    }
    const listBox = list.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    gsap.to(pill, {
      autoAlpha: 1,
      x: box.left - listBox.left,
      width: box.width,
      duration: prefersReducedMotion() ? 0 : 0.38,
      ease: EASE.out4,
    });
  }, []);

  /* ---------- mega-menu entrance choreography --------------------------- */
  useGSAP(
    () => {
      registerGsap();
      const el = menuRef.current;
      if (!el || !open) return;
      if (prefersReducedMotion()) return;

      const panel = el.querySelector("[data-mega-panel]");
      const cols = el.querySelectorAll("[data-mega-col]");
      const items = el.querySelectorAll("[data-mega-item]");
      const feature = el.querySelector("[data-mega-feature]");

      const tl = gsap.timeline();
      tl.fromTo(
        panel,
        { opacity: 0, y: -10, scaleY: 0.96, transformOrigin: "top center" },
        { opacity: 1, y: 0, scaleY: 1, duration: 0.34, ease: EASE.out4 }
      )
        .fromTo(
          cols,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, stagger: 0.05 },
          "-=0.2"
        )
        .fromTo(
          items,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.34, ease: EASE.out3, stagger: 0.035 },
          "-=0.18"
        )
        .fromTo(
          feature,
          { opacity: 0, x: 14 },
          { opacity: 1, x: 0, duration: 0.4, ease: EASE.out3 },
          "-=0.35"
        );

      return () => tl.kill();
    },
    { dependencies: [open] }
  );

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const activeGroup = navigation.find((g) => g.label === open);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        "transition-[transform,background-color,border-color,backdrop-filter] duration-500",
        "[transition-timing-function:var(--ease-standard)]",
        hidden ? "-translate-y-full" : "translate-y-0",
        scrolled || open || mobileOpen
          ? "border-b border-line bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-fg"
      >
        Skip to content
      </a>

      <div className="container-page">
        <div
          className={cn(
            "flex items-center justify-between gap-6 transition-[height] duration-500",
            scrolled ? "h-[60px]" : "h-[68px]"
          )}
        >
          <Link
            href="/"
            className="group shrink-0 rounded-lg"
            aria-label="DittoMart Go home"
          >
            <Logo className="transition-transform duration-300 group-hover:scale-[1.03]" />
          </Link>

          {/* ---------------------------- Desktop nav --------------------- */}
          <div ref={navRef} className="hidden lg:flex lg:flex-1 lg:justify-center">
            <nav aria-label="Primary">
              <ul
                ref={listRef}
                className="relative flex items-center gap-1"
                onMouseLeave={() => movePill(null)}
              >
                <span
                  ref={pillRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 -z-10 rounded-lg bg-surface-2"
                  style={{ opacity: 0, width: 0 }}
                />

                {navigation.map((group) => {
                  const hasMenu = Boolean(group.columns);
                  const isOpen = open === group.label;
                  const isActive =
                    group.href &&
                    pathname.startsWith(group.href) &&
                    group.href !== "/";

                  return (
                    <li
                      key={group.label}
                      onMouseEnter={(e) => {
                        cancelClose();
                        movePill(e.currentTarget.firstElementChild as HTMLElement);
                        if (hasMenu) setOpen(group.label);
                        else setOpen(null);
                      }}
                      onMouseLeave={scheduleClose}
                    >
                      {hasMenu ? (
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-haspopup="true"
                          onFocus={(e) => movePill(e.currentTarget)}
                          onClick={() => setOpen(isOpen ? null : group.label)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium",
                            "transition-colors duration-200",
                            isOpen || isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                          )}
                        >
                          {group.label}
                          <ChevronDown
                            aria-hidden
                            className={cn(
                              "size-3.5 text-fg-subtle transition-transform duration-300",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>
                      ) : (
                        <Link
                          href={group.href ?? "#"}
                          onFocus={(e) => movePill(e.currentTarget)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "inline-flex rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                            isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                          )}
                        >
                          {group.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/developers">Docs</Link>
            </Button>
            <span ref={ctaRef} className="inline-block">
              <Button asChild size="sm">
                <Link href="/contact">
                  Book a demo
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </span>
          </div>

          {/* ---------------------------- Mobile trigger ------------------ */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-line text-fg transition-colors hover:border-primary-border"
            >
              {mobileOpen ? (
                <X aria-hidden className="size-5" />
              ) : (
                <Menu aria-hidden className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------ Mega menu ------------------------- */}
      {activeGroup?.columns ? (
        <div
          ref={menuRef}
          className="absolute inset-x-0 top-full hidden lg:block"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="container-page pb-6 pt-2">
            <div
              data-mega-panel
              className="overflow-hidden rounded-2xl border border-line bg-elevated shadow-e3"
            >
              <div className="grid grid-cols-12">
                <div className="col-span-8 grid grid-cols-2 gap-x-8 gap-y-10 p-8">
                  {activeGroup.columns.map((col) => (
                    <div key={col.heading} data-mega-col>
                      <p className="mb-4 font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                        {col.heading}
                      </p>
                      <ul className="flex flex-col gap-1">
                        {col.links.map((link) => (
                          <li key={link.href + link.label} data-mega-item>
                            <Link
                              href={link.href}
                              className="group flex gap-3 rounded-xl p-3 transition-colors duration-200 hover:bg-surface-2"
                            >
                              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-fg-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary-border group-hover:bg-primary-soft group-hover:text-primary">
                                <Icon name={link.icon} className="size-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-2 text-sm font-medium text-fg">
                                  {link.label}
                                  {link.badge ? (
                                    <span className="rounded-full border border-primary-border bg-primary-soft px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary">
                                      {link.badge}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="mt-0.5 block text-xs leading-relaxed text-fg-subtle">
                                  {link.description}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {activeGroup.featured ? (
                  <div
                    data-mega-feature
                    className="col-span-4 border-l border-line bg-surface-2/50 p-8"
                  >
                    <div className="flex h-full flex-col">
                      <span className="font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-primary">
                        {activeGroup.featured.eyebrow}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em]">
                        {activeGroup.featured.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                        {activeGroup.featured.body}
                      </p>
                      <Link
                        href={activeGroup.featured.href}
                        className="group mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-primary"
                      >
                        {activeGroup.featured.cta}
                        <ArrowRight
                          aria-hidden
                          className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ------------------------------ Mobile menu ----------------------- */}
      {mobileOpen ? (
        <div className="lg:hidden">
          <div
            data-lenis-prevent
            className="h-[calc(100dvh-60px)] overflow-y-auto border-t border-line bg-bg px-5 pb-24 pt-6"
          >
            <MobileNav groups={navigation} />
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild size="lg">
                <Link href="/contact">Book a demo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/developers">Read the docs</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MobileNav({ groups }: { groups: NavGroup[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el.querySelectorAll("[data-mnav]"),
        { opacity: 0, x: -18 },
        { opacity: 1, x: 0, duration: 0.45, ease: EASE.out3, stagger: 0.055 }
      );
    },
    { scope: root }
  );

  return (
    <nav ref={root} aria-label="Mobile">
      <ul className="flex flex-col">
        {groups.map((group) => {
          const hasMenu = Boolean(group.columns);
          const isOpen = expanded === group.label;
          return (
            <li key={group.label} data-mnav className="border-b border-line">
              {hasMenu ? (
                <>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : group.label)}
                    className="flex w-full items-center justify-between py-4 text-left text-base font-medium"
                  >
                    {group.label}
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-4 text-fg-subtle transition-transform duration-300",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-400 [transition-timing-function:var(--ease-standard)]",
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-5 pb-5">
                        {group.columns?.map((col) => (
                          <div key={col.heading}>
                            <p className="mb-2 font-mono text-2xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                              {col.heading}
                            </p>
                            <ul className="flex flex-col">
                              {col.links.map((link) => (
                                <li key={link.href + link.label}>
                                  <Link
                                    href={link.href}
                                    className="block py-2.5 text-sm text-fg-muted"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={group.href ?? "#"}
                  className="block py-4 text-base font-medium"
                >
                  {group.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
