---
name: Kinetic Logic
colors:
  surface: '#101416'
  surface-dim: '#101416'
  surface-bright: '#363a3c'
  surface-container-lowest: '#0b0f11'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2d'
  surface-container-highest: '#323538'
  on-surface: '#e0e3e6'
  on-surface-variant: '#bcc8d0'
  inverse-surface: '#e0e3e6'
  inverse-on-surface: '#2d3133'
  outline: '#86939a'
  outline-variant: '#3c494f'
  surface-tint: '#66d3ff'
  primary: '#9adfff'
  on-primary: '#003546'
  primary-container: '#00c9ff'
  on-primary-container: '#005168'
  inverse-primary: '#006684'
  secondary: '#c2c6d5'
  on-secondary: '#2c303c'
  secondary-container: '#424753'
  on-secondary-container: '#b1b5c3'
  tertiary: '#92ec68'
  on-tertiary: '#103900'
  tertiary-container: '#77cf4f'
  on-tertiary-container: '#1c5600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#bde9ff'
  primary-fixed-dim: '#66d3ff'
  on-primary-fixed: '#001f2a'
  on-primary-fixed-variant: '#004d64'
  secondary-fixed: '#dfe2f1'
  secondary-fixed-dim: '#c2c6d5'
  on-secondary-fixed: '#171b26'
  on-secondary-fixed-variant: '#424753'
  tertiary-fixed: '#9ef973'
  tertiary-fixed-dim: '#83dc5a'
  on-tertiary-fixed: '#072100'
  on-tertiary-fixed-variant: '#1b5200'
  background: '#101416'
  on-background: '#e0e3e6'
  surface-variant: '#323538'
  deep-void: '#060A14'
  electric-cyan: '#00C9FF'
  energy-green: '#56AB2F'
  status-alert: '#EB3349'
  status-warning: '#F7971E'
  surface-glass: rgba(255, 255, 255, 0.03)
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  node-gap: 32px
---

## Brand & Style

The design system is engineered for **DittoMart Go**, an AI-driven middleware platform where the narrative is centered on "Intelligent Flow." The brand personality is hyper-efficient, visionary, and high-performance. It targets logistics engineers and operations directors who require real-time clarity within complex data streams.

The visual style is **Futuristic Glassmorphism** mixed with **Kinetic Connectivity**. The interface mimics a high-end command center, utilizing dark surfaces to allow "nodes" and "delivery paths" to radiate. Elements should feel like they are part of a continuous network, using subtle motion and glowing traces to guide the user's eye through the logistics lifecycle.

## Colors

The palette is anchored in **Deep Void (#060A14)** to provide an infinite canvas for high-tech storytelling. 

- **Primary:** Electric Cyan is the "Go" energy, used for active data paths, primary actions, and AI-driven insights.
- **Secondary:** Deep Tech Blue functions as the structural base for containers and sidebars.
- **Tertiary:** Energy Green is reserved for successful deliveries, "live" status updates, and system health.
- **Accents:** Warning Orange and Alert Red are used sparingly for logistical bottlenecks or critical failures.

Gradients should primarily flow from **Electric Cyan** to **Energy Green** to symbolize the transition from AI processing to physical delivery.

## Typography

The typographic hierarchy balances futuristic geometry with technical precision. 

- **Headlines:** Use **Sora** for its wide, geometric stance and high-tech feel. Display sizes should utilize tighter letter-spacing to feel more "engineered."
- **Body:** **Inter** provides maximum legibility for dense logistics data and middleware configurations.
- **Data/Monospace:** **JetBrains Mono** is utilized for tracking IDs, timestamps, and API status codes to reinforce the "middleware" and "developer-friendly" nature of the platform.

## Layout & Spacing

This design system utilizes a **Fluid Grid with Connectivity Anchors**. While the main structure follows a 12-column layout, internal "Flow Views" (like A-to-Z flowcharts) use a flexible node-based spacing system.

- **Desktop:** 12 columns with 24px gutters. Use 40px margins to allow the UI to breathe within the dark void.
- **Mobile:** 4 columns with 16px margins. Complex flowcharts should transition to a vertical "Step-wise" layout or a horizontally scrollable canvas with a minimap.
- **Rhythm:** An 8px base unit governs all padding and margins to ensure mathematical consistency.

## Elevation & Depth

Depth is created through **Luminosity and Translucency** rather than traditional shadows.

- **Surface Tiers:** Background is #060A14. Containers use `surface-glass` (low opacity white) with a `20px` backdrop blur.
- **Glowing Borders:** Elevated elements (active cards, hovered nodes) feature a 1px inner stroke using a linear gradient of Electric Cyan to transparent.
- **Shadows:** Use "Ambient Glows" instead of drop shadows. When an element is prioritized, apply a subtle outer glow using the primary color with 15% opacity and 30px blur.

## Shapes

The shape language is **Technological & Modern**. 

- **Primary Radius:** A consistent 8px (0.5rem) radius is applied to cards and inputs to keep the look clean but not overly soft.
- **Paths:** Connecting lines between nodes should have a 4px corner radius to mimic circuit board traces rather than organic curves.
- **Interactive Triggers:** Buttons and status badges use a more pronounced 1rem radius to distinguish them from structural data containers.

## Components

- **Nodes & Paths:** The core component of the system. Nodes are glassmorphic cards containing a status icon, label, and timestamp. Paths are animated SVG lines that "pulse" with Electric Cyan when data is flowing through them.
- **Buttons:** Primary buttons use a solid Electric Cyan background with black text for maximum contrast. Secondary buttons use a "Ghost" style with a 1px glowing border.
- **Input Fields:** Dark-themed inputs with a 1px border that glows Electric Cyan upon focus. Use JetBrains Mono for the input text.
- **Status Chips:** Small, pill-shaped indicators with high-saturation backgrounds (Energy Green, Alert Red) and a subtle outer glow of the same color.
- **Data Visualization:** Line charts should use a "Glow Trace" effect where the line itself acts as a light source against the dark grid background.
- **Side Navigation:** A slim, high-contrast bar using `backdrop-filter: blur` to separate it from the main flow canvas.