"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.classList.contains("theme-dark")
      ? "dark"
      : "light";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const root = document.documentElement;
    root.classList.toggle("theme-light", next === "light");
    root.classList.toggle("theme-dark", next === "dark");
    try {
      localStorage.setItem("dmgo-theme", next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-xl",
        "border border-line text-fg-muted",
        "transition-colors duration-200 hover:border-line-strong hover:text-fg",
        className
      )}
    >
      {mounted ? (
        <span className="relative block size-[18px]">
          <Sun
            aria-hidden
            className={cn(
              "absolute inset-0 size-[18px] transition-all duration-300 [transition-timing-function:var(--ease-standard)]",
              theme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-50 opacity-0"
            )}
          />
          <Moon
            aria-hidden
            className={cn(
              "absolute inset-0 size-[18px] transition-all duration-300 [transition-timing-function:var(--ease-standard)]",
              theme === "light"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-50 opacity-0"
            )}
          />
        </span>
      ) : (
        <span className="size-[18px]" />
      )}
    </button>
  );
}

/**
 * Applied before paint to avoid a theme flash. Kept tiny and dependency-free.
 */
export const themeScript = `(function(){var c=document.documentElement.classList;try{var t=localStorage.getItem('dmgo-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;c.add(d?'theme-dark':'theme-light');}catch(e){c.add('theme-light');}
// Marks that scripting is live. Split headings only hide themselves once this
// class exists, so a script failure can never blank the page's typography.
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){c.add('js');}
// Failsafe: if webfonts never resolve, GSAP never splits and headings would
// stay hidden. Reveal everything after 2.5s regardless.
setTimeout(function(){c.remove('js');},2500);})();`;
