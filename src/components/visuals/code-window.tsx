"use client";

import { useGSAP } from "@gsap/react";
import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DUR, EASE, gsap, prefersReducedMotion, registerGsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type CodeSample = {
  id: string;
  label: string;
  language: string;
  code: string;
};

/**
 * Minimal token highlighting — a hand-rolled regex pass rather than a
 * syntax-highlighting library. It keeps ~40KB off the bundle for what is,
 * on a marketing page, a decorative concern.
 */
function highlight(code: string) {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(
      /(&quot;|")([^"\n]*?)\1(\s*:)/g,
      '<span class="text-[var(--color-teal-300)]">$1$2$1</span>$3'
    )
    .replace(
      /: ?("(?:[^"\\]|\\.)*")/g,
      ': <span class="text-[var(--color-pulse-400)]">$1</span>'
    )
    .replace(
      /\b(curl|const|await|import|from|def|print|return|new|async|function|let)\b/g,
      '<span class="text-[var(--color-crimson-400)]">$1</span>'
    )
    .replace(
      /\b(true|false|null)\b/g,
      '<span class="text-[var(--color-ember-300)]">$1</span>'
    )
    .replace(
      /(^|[\s:[{,])(-?\d+\.?\d*)\b/g,
      '$1<span class="text-[var(--color-ember-300)]">$2</span>'
    )
    .replace(
      /(--?[a-zA-Z-]+)(?=\s)/g,
      '<span class="text-[var(--fg-subtle)]">$1</span>'
    )
    .replace(/(#.*$)/gm, '<span class="text-[var(--fg-subtle)]">$1</span>');
}

/** Splits highlighted code into per-line spans so each can animate. */
function CodeBody({ code, dim = false }: { code: string; dim?: boolean }) {
  const lines = code.split("\n");
  return (
    <code className="block">
      {lines.map((line, i) => (
        <span
          key={i}
          data-code-line
          className={cn("block whitespace-pre", dim && "opacity-90")}
          dangerouslySetInnerHTML={{ __html: highlight(line) || "&nbsp;" }}
        />
      ))}
    </code>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          if (!prefersReducedMotion() && ref.current) {
            gsap.fromTo(
              ref.current,
              { scale: 0.82 },
              { scale: 1, duration: 0.42, ease: EASE.back }
            );
          }
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked — silently no-op rather than throwing at the user */
        }
      }}
      aria-label={copied ? "Copied" : "Copy code"}
      className="inline-flex size-7 items-center justify-center rounded-lg border border-line text-fg-subtle transition-colors duration-200 hover:border-line-strong hover:text-fg"
    >
      {copied ? (
        <Check aria-hidden className="size-3.5 text-success" />
      ) : (
        <Copy aria-hidden className="size-3.5" />
      )}
    </button>
  );
}

export function CodeWindow({
  samples,
  response,
  title = "Create a delivery",
  className,
}: {
  samples: CodeSample[];
  response?: string;
  title?: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(samples[0]?.id);

  /**
   * Lines type in rather than the block fading up — a request being written,
   * then a response arriving. The response panel is deliberately delayed so
   * the two read as cause and effect.
   */
  useGSAP(
    () => {
      registerGsap();
      const el = root.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el.querySelectorAll("[data-code-line], [data-code-res]"), {
          opacity: 1,
          x: 0,
        });
        return;
      }

      const active = el.querySelector('[data-state="active"][role="tabpanel"]');
      const lines = active?.querySelectorAll("[data-code-line]");
      const res = el.querySelector("[data-code-res]");
      const resLines = res?.querySelectorAll("[data-code-line]");
      const caret = el.querySelector("[data-caret]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      });

      if (lines?.length) {
        gsap.set(lines, { opacity: 0, x: -8 });
        tl.to(lines, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: EASE.out,
          stagger: 0.035,
        });
      }

      if (caret) {
        gsap.set(caret, { opacity: 0 });
        tl.to(caret, { opacity: 1, duration: 0.2 }, "-=0.1");
      }

      if (res) {
        gsap.set(res, { opacity: 0, y: 10 });
        tl.to(res, { opacity: 1, y: 0, duration: DUR.fast, ease: EASE.out3 }, "+=0.15");
      }
      if (resLines?.length) {
        gsap.set(resLines, { opacity: 0 });
        tl.to(resLines, { opacity: 1, duration: 0.22, stagger: 0.028 }, "-=0.1");
      }

      return () => tl.kill();
    },
    { scope: root }
  );

  // Re-run the line stagger when the language tab changes.
  const animateTab = (id: string) => {
    setTab(id);
    if (prefersReducedMotion()) return;
    requestAnimationFrame(() => {
      const el = root.current;
      const panel = el?.querySelector(`[role="tabpanel"][data-state="active"]`);
      const lines = panel?.querySelectorAll("[data-code-line]");
      if (!lines?.length) return;
      gsap.fromTo(
        lines,
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.26, ease: EASE.out, stagger: 0.025 }
      );
    });
  };

  const activeSample = samples.find((s) => s.id === tab) ?? samples[0];

  return (
    <div
      ref={root}
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-[var(--color-ink-950)] shadow-e3",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-[color-mix(in_oklab,#fff_8%,transparent)] px-4 py-3">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="ml-1 font-mono text-xs text-[#8b98b4]">{title}</span>
      </div>

      <Tabs value={tab} onValueChange={animateTab} className="w-full">
        <div className="flex items-center justify-between gap-3 border-b border-[color-mix(in_oklab,#fff_8%,transparent)] px-3 py-2">
          <TabsList className="border-0 bg-transparent p-0">
            {samples.map((s) => (
              <TabsTrigger
                key={s.id}
                value={s.id}
                className="rounded-lg px-3 py-1.5 text-xs text-[#8b98b4] data-[state=active]:bg-[color-mix(in_oklab,#fff_8%,transparent)] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <span className="pr-1">
            <CopyButton value={activeSample?.code ?? ""} />
          </span>
        </div>

        {samples.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-0">
            <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-[1.75] text-[#c9d4e8]">
              <CodeBody code={s.code} />
              <span
                data-caret
                aria-hidden
                className="ml-0.5 inline-block h-[1.1em] w-[7px] translate-y-[2px] animate-breathe bg-[var(--color-teal-400)]"
              />
            </pre>
          </TabsContent>
        ))}
      </Tabs>

      {response ? (
        <div
          data-code-res
          className="border-t border-[color-mix(in_oklab,#fff_8%,transparent)]"
        >
          <div className="flex items-center gap-2 px-5 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[color-mix(in_oklab,#2fbf71_18%,transparent)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#4ade80]">
              200 OK
            </span>
            <span className="font-mono text-[10px] text-[#6b7793]">142 ms</span>
          </div>
          <pre className="overflow-x-auto px-5 pb-5 pt-3 font-mono text-[12.5px] leading-[1.75] text-[#c9d4e8]">
            <CodeBody code={response} dim />
          </pre>
        </div>
      ) : null}
    </div>
  );
}
