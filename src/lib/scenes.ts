/**
 * Scene palettes.
 *
 * The site no longer runs on one global theme. Every band declares its own
 * scene, and a scene is nothing more than a set of overrides for the same
 * semantic tokens every component already consumes — `--bg`, `--fg`,
 * `--line`, `--surface` and so on.
 *
 * That is the whole trick: because no component hardcodes a colour, dropping
 * a different token set onto a section re-themes everything inside it —
 * cards, badges, code windows, charts — with no component changes at all.
 *
 * Scenes are ordered so that consecutive bands always contrast: a dark scene
 * is never followed by another dark scene of the same family.
 */

export type SceneName =
  | "ink"
  | "sand"
  | "ember"
  | "teal"
  | "crimson"
  | "bone"
  | "slate"
  | "olive";

type SceneSpec = {
  label: string;
  scheme: "light" | "dark";
  bg: string;
  bgSubtle: string;
  surface: string;
  surface2: string;
  elevated: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  line: string;
  lineStrong: string;
  primary: string;
  primaryFg: string;
  primarySoft: string;
  primaryBorder: string;
  accent: string;
  accentSoft: string;
  /** Ambient wash colours used by section glows. */
  spot1: string;
  spot2: string;
};

export const scenes: Record<SceneName, SceneSpec> = {
  /* deep blue-black — the anchor dark */
  ink: {
    label: "Ink",
    scheme: "dark",
    bg: "#0d1117",
    bgSubtle: "#0a0e14",
    surface: "#151c25",
    surface2: "#1c242f",
    elevated: "#19212b",
    fg: "#f0f4f8",
    fgMuted: "#a6b3c2",
    fgSubtle: "#748394",
    line: "rgba(255,255,255,0.10)",
    lineStrong: "rgba(255,255,255,0.19)",
    primary: "#fb8038",
    primaryFg: "#160b04",
    primarySoft: "rgba(251,128,56,0.15)",
    primaryBorder: "rgba(251,128,56,0.36)",
    accent: "#5bd9cb",
    accentSoft: "rgba(91,217,203,0.14)",
    spot1: "rgba(244,102,31,0.30)",
    spot2: "rgba(91,217,203,0.18)",
  },

  /* warm dimmed paper — the anchor light */
  sand: {
    label: "Sand",
    scheme: "light",
    bg: "#e7dfd2",
    bgSubtle: "#ded4c5",
    surface: "#f2ede4",
    surface2: "#dad0bf",
    elevated: "#f7f3ec",
    fg: "#201b17",
    fgMuted: "#574e45",
    fgSubtle: "#7c7166",
    line: "#cbbfab",
    lineStrong: "#b3a48c",
    primary: "#e04e0f",
    primaryFg: "#ffffff",
    primarySoft: "rgba(224,78,15,0.12)",
    primaryBorder: "rgba(224,78,15,0.34)",
    accent: "#116865",
    accentSoft: "rgba(17,104,101,0.12)",
    spot1: "rgba(244,102,31,0.26)",
    spot2: "rgba(212,32,39,0.16)",
  },

  /* burnt orange — the brand at full volume */
  ember: {
    label: "Ember",
    scheme: "dark",
    bg: "#5c220b",
    bgSubtle: "#4a1b08",
    surface: "#6d2c11",
    surface2: "#7c3717",
    elevated: "#743012",
    fg: "#fff2e8",
    fgMuted: "#f0c4a6",
    fgSubtle: "#d29d7c",
    line: "rgba(255,255,255,0.15)",
    lineStrong: "rgba(255,255,255,0.26)",
    primary: "#ffd7a8",
    primaryFg: "#4a1b08",
    primarySoft: "rgba(255,215,168,0.16)",
    primaryBorder: "rgba(255,215,168,0.4)",
    accent: "#9cf7e6",
    accentSoft: "rgba(156,247,230,0.14)",
    spot1: "rgba(255,176,32,0.34)",
    spot2: "rgba(255,255,255,0.12)",
  },

  /* deep teal — the cold-chain and data scene */
  teal: {
    label: "Teal",
    scheme: "dark",
    bg: "#05302e",
    bgSubtle: "#032523",
    surface: "#0a3f3c",
    surface2: "#0f4a47",
    elevated: "#0c4441",
    fg: "#e6f8f4",
    fgMuted: "#9fd3cb",
    fgSubtle: "#74aca4",
    line: "rgba(255,255,255,0.13)",
    lineStrong: "rgba(255,255,255,0.23)",
    primary: "#ffa05c",
    primaryFg: "#032523",
    primarySoft: "rgba(255,160,92,0.16)",
    primaryBorder: "rgba(255,160,92,0.38)",
    accent: "#7ef0dd",
    accentSoft: "rgba(126,240,221,0.14)",
    spot1: "rgba(46,192,180,0.32)",
    spot2: "rgba(244,102,31,0.2)",
  },

  /* deep crimson — the logo's red, used for weight */
  crimson: {
    label: "Crimson",
    scheme: "dark",
    bg: "#480d11",
    bgSubtle: "#3a090d",
    surface: "#5a161b",
    surface2: "#671c22",
    elevated: "#611a20",
    fg: "#ffeceb",
    fgMuted: "#f0b3b0",
    fgSubtle: "#cf8b88",
    line: "rgba(255,255,255,0.14)",
    lineStrong: "rgba(255,255,255,0.25)",
    primary: "#ffc247",
    primaryFg: "#3a090d",
    primarySoft: "rgba(255,194,71,0.16)",
    primaryBorder: "rgba(255,194,71,0.4)",
    accent: "#9cf7e6",
    accentSoft: "rgba(156,247,230,0.13)",
    spot1: "rgba(238,74,63,0.34)",
    spot2: "rgba(255,176,32,0.2)",
  },

  /* bone — the brightest scene, used sparingly for relief */
  bone: {
    label: "Bone",
    scheme: "light",
    bg: "#f4f0e8",
    bgSubtle: "#eae4d9",
    surface: "#fbf9f5",
    surface2: "#e8e1d4",
    elevated: "#ffffff",
    fg: "#1b1713",
    fgMuted: "#5b5248",
    fgSubtle: "#867b6e",
    line: "#dbd2c2",
    lineStrong: "#c2b6a1",
    primary: "#c1400c",
    primaryFg: "#ffffff",
    primarySoft: "rgba(193,64,12,0.1)",
    primaryBorder: "rgba(193,64,12,0.3)",
    accent: "#0f5f5c",
    accentSoft: "rgba(15,95,92,0.1)",
    spot1: "rgba(244,102,31,0.2)",
    spot2: "rgba(17,104,101,0.14)",
  },

  /* cool slate — the operations / console scene */
  slate: {
    label: "Slate",
    scheme: "dark",
    bg: "#141c26",
    bgSubtle: "#101720",
    surface: "#1d2833",
    surface2: "#25313e",
    elevated: "#212d39",
    fg: "#eaf1f7",
    fgMuted: "#a3b4c4",
    fgSubtle: "#77899a",
    line: "rgba(255,255,255,0.11)",
    lineStrong: "rgba(255,255,255,0.2)",
    primary: "#ff9a4d",
    primaryFg: "#101720",
    primarySoft: "rgba(255,154,77,0.14)",
    primaryBorder: "rgba(255,154,77,0.35)",
    accent: "#6fdcd0",
    accentSoft: "rgba(111,220,208,0.13)",
    spot1: "rgba(255,154,77,0.24)",
    spot2: "rgba(111,220,208,0.18)",
  },

  /* deep olive-gold — the compliance / evidence scene */
  olive: {
    label: "Olive",
    scheme: "dark",
    bg: "#2e2408",
    bgSubtle: "#251d06",
    surface: "#3d3010",
    surface2: "#493a15",
    elevated: "#443513",
    fg: "#fdf5e2",
    fgMuted: "#dbc79a",
    fgSubtle: "#b3a077",
    line: "rgba(255,255,255,0.13)",
    lineStrong: "rgba(255,255,255,0.23)",
    primary: "#ffb020",
    primaryFg: "#251d06",
    primarySoft: "rgba(255,176,32,0.16)",
    primaryBorder: "rgba(255,176,32,0.4)",
    accent: "#8fe8d6",
    accentSoft: "rgba(143,232,214,0.13)",
    spot1: "rgba(255,176,32,0.3)",
    spot2: "rgba(244,102,31,0.2)",
  },
};

/** Turns a scene into the CSS custom properties every component reads. */
export function sceneVars(name: SceneName): React.CSSProperties {
  const s = scenes[name];
  return {
    colorScheme: s.scheme,
    ["--bg" as string]: s.bg,
    ["--bg-subtle" as string]: s.bgSubtle,
    ["--surface" as string]: s.surface,
    ["--surface-2" as string]: s.surface2,
    ["--elevated" as string]: s.elevated,
    ["--fg" as string]: s.fg,
    ["--fg-muted" as string]: s.fgMuted,
    ["--fg-subtle" as string]: s.fgSubtle,
    ["--line" as string]: s.line,
    ["--line-strong" as string]: s.lineStrong,
    ["--primary" as string]: s.primary,
    ["--primary-hover" as string]: s.primary,
    ["--primary-fg" as string]: s.primaryFg,
    ["--primary-soft" as string]: s.primarySoft,
    ["--primary-border" as string]: s.primaryBorder,
    ["--accent" as string]: s.accent,
    ["--accent-soft" as string]: s.accentSoft,
    ["--ai" as string]: s.accent,
    ["--ai-soft" as string]: s.accentSoft,
    ["--ring" as string]: s.primary,
    ["--glass" as string]: s.surface,
    ["--glass-line" as string]: s.line,
    ["--grid-line" as string]:
      s.scheme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(30,24,18,0.06)",
    ["--spot-1" as string]: s.spot1,
    ["--spot-2" as string]: s.spot2,
    ["--spot-3" as string]: s.spot1,
  } as React.CSSProperties;
}

export const sceneBg = (name: SceneName) => scenes[name].bg;
