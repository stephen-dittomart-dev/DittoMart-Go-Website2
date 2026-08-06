# DittoMart Go — Product Design Blueprint

**Version:** 1.0 · **Date:** 2026-08-05
**Source docs:** DittoMart Go PRD v2.0 · DittoMart Go Platform Plan · A-to-Z Complete Flowchart
**Scope:** Information Architecture · UX Strategy · Design System · Component Inventory · Wireframe Plan · Animation Strategy · Development Roadmap
**Status:** For review. **No code produced.**

---

## 0. Framing

### 0.1 What we are actually designing

Five surfaces, four of them web (Next.js 15 + Tailwind + shadcn/ui), one mobile (Flutter). Not one product — **four different products sharing one design language**:

| # | Surface | Archetype | Design posture | Phase |
|---|---|---|---|---|
| S1 | **Client Dashboard** | Developer-adjacent SaaS console (think Stripe/Shippo) | Calm, self-serve, trust-building, API-first | P1 |
| S2 | **Ops Dashboard** | Mission-control / NOC | Dense, real-time, alarm-driven, keyboard-first | P1 |
| S3 | **White-label Tracking Page** | Consumer micro-page | Minimal, branded *by the client*, mobile-first, zero chrome | P1 |
| S4 | **Agency Dashboard** | SMB operations console | Simple, low-literacy-tolerant, mobile-responsive, Tamil-capable | P2 |
| S5 | **Rider App** | Field worker mobile app | Glanceable, one-handed, offline-first, Tamil-first, high contrast outdoors | P2 |

Plus one non-surface: the **WhatsApp bot** (P3) — conversational IA, no visual design system, but it needs message templates designed.

### 0.2 The five design principles

1. **The money must be visible at all times.** Wallet balance, quoted rate, margin, cancellation cost. Every surface has a persistent money indicator. A logistics aggregator dies from invisible receivables — the UI is the first line of defence.
2. **Never surprise the client.** Rate is locked and shown before commitment. 402 is explained, not thrown. Every state change is narrated. Trust is the product.
3. **Ops sees the invariant, not the noise.** The Ops Dashboard's job is to prove `double_assignments = 0`, `cancel_fanout < 2s`, `SLA breaches ≤ target`. Design for the *exception*, not the happy path — the happy path is 97% of rows and deserves the least ink.
4. **The rider gets one decision per screen.** Sunlight, helmet, one hand, moving. Every rider screen answers exactly one question with exactly one primary action.
5. **Invisibility is a feature.** On the tracking page and inside DittoMart Marketplace, DittoMart Go must not appear. The design system must be able to *disappear* behind a tenant's brand (G10, G12).

### 0.3 Design constraints inherited from locked decisions

| Decision | Design consequence |
|---|---|
| G2 — wallet hard gate (402) | Needs a **first-class blocked-order UX**, not an error toast. A `PENDING_PAYMENT` order is a recoverable state with a one-click resolution path. |
| G3 — `POSTPAID_INTERNAL` | Two visually distinct client "modes". Internal tenants must never see wallet UI; they see a **ledger accrual** view instead. |
| G4/G5 — broadcast + 5 guardrails | Requires a dedicated **Broadcast Health** surface with per-order allocation timelines. This is the highest-value novel UI in the product. |
| G8 — multi-tenant P0 | Tenant context must be **structurally present** in the UI shell (URL-scoped, visually banded in Ops). Cross-tenant views exist *only* in Ops and are visually marked. |
| G12 — no customer app | The tracking page is a **product**, not an afterthought. It carries the client's brand and gets real design investment. |
| Cold chain = the moat | Temperature is a **first-class visual dimension** — a color scale, a badge system, and a chart type that appear on every surface. |
| Event sourcing day one | Every order detail screen gets a **timeline component** as its spine. Design the timeline once, reuse it five times. |

---

## 1. Information Architecture

### 1.1 Global IA model

```
DittoMart Go
├── go.dittomart.in            → Client Dashboard      (tenant-scoped)
├── ops.dittomart.in           → Ops Dashboard         (cross-tenant, internal)
├── agency.dittomart.in        → Agency Dashboard      (agency-scoped)     [P2]
├── track.dittomart.in/:token  → White-label tracking  (public, unbranded) [P1]
├── api.dittomart.in/api/v1    → Public B2B API        (the product)
├── docs.dittomart.in          → API docs + sandbox
└── Rider App (Flutter)        → Android/iOS           [P2]
```

**Rule:** separate hostnames, not path prefixes. It keeps cookies/sessions isolated (a real G8 defence), lets the tracking page ship a tiny bundle with no auth code, and allows independent deploy cadence.

---

### 1.2 S1 — Client Dashboard IA

**Navigation model:** persistent left sidebar (collapsible to icon rail) + top bar carrying tenant name, environment switch (Live/Sandbox), wallet chip, notifications, account menu.

```
Client Dashboard
│
├── ⌂ Overview                              /
│     Today's orders · wallet · SLA · exceptions needing you
│
├── 📦 Orders                               /orders
│     ├── All orders (filterable board)     /orders?status=…
│     ├── Order detail                      /orders/:id
│     │     └── tabs: Timeline · Tracking · Proof · Charges · Webhooks · Raw
│     ├── Create order                      /orders/new
│     ├── Bulk upload (CSV)                 /orders/bulk
│     └── Bulk job detail                   /orders/bulk/:jobId
│
├── 🧮 Estimate                             /estimate
│     ├── Rate calculator (quote dry-run)   /estimate/quote
│     └── Serviceability check              /estimate/serviceability
│
├── 💰 Wallet                        [PREPAID_WALLET only]   /wallet
│     ├── Balance & top-up                  /wallet
│     ├── Transactions ledger               /wallet/transactions
│     └── Auto-recharge & alerts            /wallet/settings
│   └── 📒 Billing Ledger          [POSTPAID_INTERNAL only]  /ledger
│
├── 🧾 Billing                              /billing
│     ├── Invoices (GST)                    /billing/invoices
│     ├── Invoice detail                    /billing/invoices/:id
│     ├── Statements                        /billing/statements
│     └── Rate card                         /billing/rate-card
│
├── ⚠ Disputes                              /disputes
│     ├── List                              /disputes
│     ├── Detail (POD + GPS evidence)       /disputes/:id
│     └── Raise dispute                     /disputes/new
│
├── 🔌 Developers                           /developers
│     ├── API keys                          /developers/keys
│     ├── Webhooks (endpoints + events)     /developers/webhooks
│     ├── Webhook delivery log + replay     /developers/webhooks/deliveries
│     ├── Sandbox & test orders             /developers/sandbox
│     └── API reference (embedded/linked)   → docs.dittomart.in
│
├── 📊 Reports                              /reports
│     Volume · on-time % · RTO · spend · zone mix · cold-chain
│
└── ⚙ Settings                              /settings
      ├── Company & GST                     /settings/company
      ├── Team & roles                      /settings/team
      ├── Notifications                     /settings/notifications
      ├── Tracking-page branding            /settings/branding
      └── Security (2FA, sessions)          /settings/security
```

**Adaptive IA:** `billing_mode` rewrites the sidebar. `PREPAID_WALLET` sees **Wallet**; `POSTPAID_INTERNAL` (Marketplace) sees **Billing Ledger** and never sees a balance, a top-up button, or a 402 concept anywhere. This is an IA-level branch, not a disabled button.

**Entry points that bypass nav:** deep link from a webhook failure email → `/developers/webhooks/deliveries?status=failed`; from a low-balance SMS → `/wallet?intent=topup`; from a 402 webhook → `/orders/:id?resolve=payment`.

---

### 1.3 S2 — Ops Dashboard IA

**Navigation model:** icon rail (always collapsed, tooltip-labelled) + contextual second-level panel. Optimised for operators who live in 3 screens all day. **Command palette (⌘K) is the primary navigation**, not the sidebar.

```
Ops Dashboard
│
├── 🎛 NOC Home                             /
│     Live KPI wall · active alarms · broadcast health · wallet float
│
├── 🌐 Live Operations
│     ├── Order board (all tenants)         /ops/orders
│     ├── Order detail (ops view)           /ops/orders/:id
│     ├── Live map                          /ops/map
│     ├── Allocation console                /ops/allocation
│     │     └── Order allocation timeline   /ops/allocation/:orderId
│     ├── Broadcast health                  /ops/broadcast
│     │     time-to-accept · cancel latency · cancellation cost · DOUBLE-ASSIGN = 0
│     └── Exception queues                  /ops/queues
│           ├── Allocation failures         /ops/queues/allocation
│           ├── SLA breaches                /ops/queues/sla
│           ├── Stuck / no-movement         /ops/queues/stuck
│           ├── Temperature breaches        /ops/queues/temperature
│           └── Fraud flags                 /ops/queues/fraud
│
├── 🚚 Supply
│     ├── Providers                         /ops/providers
│     ├── Provider detail + scorecard       /ops/providers/:id
│     ├── Adapter health / API logs         /ops/providers/health
│     ├── Agencies                     [P2] /ops/agencies
│     ├── Agency detail                [P2] /ops/agencies/:id
│     └── Riders (global)              [P2] /ops/riders
│
├── ⚙ Engines  (the control plane)
│     ├── Tariff
│     │     ├── Plans                       /ops/tariff/plans
│     │     ├── Rule editor + dry run       /ops/tariff/rules/:id
│     │     └── Zones & pincodes            /ops/tariff/zones
│     ├── Trigger
│     │     ├── Trigger configs (client/zone) /ops/trigger/configs
│     │     ├── Broadcast eligibility matrix  /ops/trigger/eligibility
│     │     └── Cancellation cost report      /ops/trigger/costs
│     ├── Routing
│     │     ├── Routing rules & weights     /ops/routing/rules
│     │     ├── Provider–zone coverage      /ops/routing/coverage
│     │     └── Pins & overrides            /ops/routing/pins
│     └── AI                           [P2] /ops/ai
│           kill-switches · thresholds · model config · inference log
│
├── 🏢 Tenants
│     ├── Tenant list                       /ops/tenants
│     ├── Tenant detail (360)               /ops/tenants/:id
│     ├── Onboarding approval queue         /ops/tenants/approvals
│     └── Feature flags per tenant          /ops/tenants/:id/flags
│
├── 💵 Money
│     ├── Wallet float & adjustments        /ops/money/wallets
│     ├── Margin report                     /ops/money/margin
│     ├── Invoices (all tenants)            /ops/money/invoices
│     ├── 3PL settlements                   /ops/money/settlements/3pl
│     ├── Agency settlements           [P2] /ops/money/settlements/agency
│     ├── Reconciliation queue              /ops/money/reconciliation
│     └── Disputes console                  /ops/money/disputes
│
├── 🌍 ONDC                            [P3] /ops/ondc
│     transactions · callbacks · registry keys · rail switch · issues
│
└── 🔐 Platform
      ├── Employees & roles (RBAC)          /ops/platform/rbac
      ├── Audit log                         /ops/platform/audit
      ├── Notification templates            /ops/platform/notifications
      ├── Feature flags (global)            /ops/platform/flags
      └── Module config                     /ops/platform/config
```

**IA principle for Ops:** organised by **verb, not by module**. Operators think "something is stuck" → Exception queues; "a provider is behaving badly" → Supply; "change a price" → Engines. The 12 backend modules are an implementation detail and must not leak into navigation.

**Cross-tenant marking:** any screen showing more than one tenant's data carries a persistent amber `ALL TENANTS` band. Any screen scoped into a single tenant carries that tenant's name + color chip in the top bar. This makes G8 violations *visible* during QA.

---

### 1.4 S3 — White-label Tracking Page IA

Single-page, no navigation. Three states, one URL: `track.dittomart.in/:token`.

```
/:token
├── ACTIVE      map + rider marker + status timeline + ETA + masked call button
├── COMPLETED   proof card (photo/OTP), delivery time, temperature certificate [P3]
└── INVALID     expired / not-found (no data leakage — generic message)
```

**Branding resolution order:** tenant branding config → fallback neutral (no DittoMart Go mark). The page never says "DittoMart Go" unless the tenant *is* DittoMart Go. A small "Delivery powered by" line is a per-tenant toggle, default **off**.

---

### 1.5 S4 — Agency Dashboard IA (P2)

```
Agency Dashboard
├── ⌂ Today                      /            live riders · active orders · today's earning
├── 🛵 Riders                    /riders       roster · online status · performance
│     ├── Rider detail           /riders/:id
│     ├── Add rider (KYC wizard) /riders/new
│     └── Documents & expiry     /riders/documents
├── 🗺 Fleet map                 /map
├── 📦 Orders                    /orders       assigned · unassigned queue · history
│     └── Order detail           /orders/:id
├── 💰 Earnings                  /earnings
│     ├── Weekly statements      /earnings/statements
│     ├── Statement detail       /earnings/statements/:id   (accept / dispute — 48h)
│     ├── Deductions breakdown   /earnings/deductions
│     └── COD reconciliation     /earnings/cod
├── 📈 Performance               /performance  on-time % · SLA · zone heatmap · rider ranking
├── ⚠ Disputes                   /disputes
└── ⚙ Settings                   /settings     profile · zones · bank · shifts · broadcast message
```

**Design note:** the agency owner may be a single person with a phone. This dashboard must be **fully usable at 390px**. Treat desktop as the enhancement, not the baseline — the inverse of the Client Dashboard.

---

### 1.6 S5 — Rider App IA (P2, Flutter)

Task-flow IA, not a menu tree. Bottom nav with 4 tabs; the delivery flow is a **full-screen takeover** that suppresses navigation.

```
Rider App
├── [Auth]      Splash → Phone + OTP → Language (தமிழ்/English/हिंदी) → Permissions primer
│
├── ⌂ Home tab                 online/offline toggle · today's stats · current order card
│     └── ▶ ACTIVE DELIVERY FLOW  (full-screen, nav hidden)
│           1. Assignment alert       (timed accept/reject, 60s ring)
│           2. Order summary          (pickup, drop, COD, temp class, earnings)
│           3. Navigate → pickup      (map + call vendor)
│           4. Pickup confirm         (scan/photo · cold-chain checklist · AI verify [P2])
│           5. Navigate → drop        (map + call recipient, masked)
│           6. Deliver                (OTP / photo POD / signature)
│           7. COD collect            (amount + method confirm)
│           8. Complete               (earning added → next order or idle)
│
├── 📋 Orders tab              today's queue · multi-drop batch · history
├── 💵 Earnings tab            today · week · per-order breakdown · payout status
└── 👤 Profile tab             performance scorecard · documents · language · support · SOS · logout
```

**Persistent overlays:** SOS (always reachable), compliance nudge (idle/wrong-direction forced popup), offline banner, low-GPS banner.

---

### 1.7 Cross-surface entity map

One entity, many views. Design each view once, deliberately different:

| Entity | Client sees | Ops sees | Agency sees | Rider sees | Recipient sees |
|---|---|---|---|---|---|
| **Order** | Status, ETA, my charge, proof | + provider, supply cost, margin, allocation attempts, all tenants | Assigned rider, my payout | Task steps only | Status + map only |
| **Rate** | Quoted rate (locked) | Quoted + supply cost + margin | Agency rate | Per-order earning | — |
| **Rider** | Masked name + masked phone | Full identity, GPS trail, compliance events | Full identity, KYC, scorecard | Self | First name + photo, masked call |
| **Temperature** | Class badge + breach alert | Full log + breach queue | Checklist compliance | Checklist | Certificate [P3] |
| **Wallet** | Balance + ledger | Float across all tenants + adjustments | — | — | — |

**This table is the G8 specification for the UI layer.** Every component that renders an order must take a `viewerRole` and render from a role-scoped projection — never from the full order object.

---

## 2. UX Strategy

### 2.1 Jobs-to-be-done per persona

| Persona | Primary job | Success signal | Failure they fear |
|---|---|---|---|
| **B2B Client dev** | Integrate once, never think about it again | First successful sandbox order in < 15 min | Silent webhook failures |
| **B2B Client ops** | Know which of today's 400 orders needs me | Exception count → 0 by EOD | A customer calls before we know |
| **B2B Client finance** | Reconcile spend to invoice | GST invoice matches ledger | Unexplained deductions |
| **DittoMart Ops** | Prove nothing is broken; fix what is | Zero double-assignments, SLA green | Two riders on one order |
| **DittoMart Finance** | Lock margin, catch provider over-billing | Recon queue empty | Paying for cancelled assignments |
| **Agency owner** | Keep riders busy, get paid Monday | Statement accepted, payout received | Deductions they can't contest |
| **Rider** | Finish this delivery, get paid | Order complete, earning visible | Penalty they didn't understand |
| **Recipient** | Where is my order | Sees rider moving | Blank page / stale map |

### 2.2 The eight critical journeys (design these first, everything else follows)

**J1 · Client integration (0 → first live order)**
Signup → KYC → agreement → **sandbox key issued immediately** → docs with copy-paste cURL → sandbox order → webhook test console → go-live checklist → live key + wallet top-up → first live order.
*UX bet:* sandbox before approval. Nothing kills a B2B integration like waiting for a human to approve you before you can write code. Approval gates **live** keys only.
*Design artifact:* a persistent **"Go-live checklist"** card on Overview until all steps are green.

**J2 · Create order → allocated (the core loop)**
Form/API → quote shown → wallet check → allocating → assigned.
*UX bet:* the **allocating state is a real screen, not a spinner.** Show which providers were triggered, how long we've been waiting, and the auto-retry countdown. The client's biggest anxiety is "did it work?" — answer it with a live allocation timeline.

**J3 · The 402 wall (blocked order recovery)**
This is the single most important non-happy-path in the product.
- API returns 402 with a machine-readable `reason`, `required_amount`, `current_balance`, `topup_url`.
- Dashboard: order appears in a distinct **`Payment required`** lane at the top of the board, with a red-amber banner: *"3 orders are waiting for ₹1,240. Top up to release them."*
- **One-click "Top up & release all"** — top up, then auto-retry every `PENDING_PAYMENT` order in one action.
- Webhook + SMS + email carry the same deep link.
*UX bet:* never make the client re-create a blocked order. The order persists and resumes.
*And:* `POSTPAID_INTERNAL` tenants must never see any of this UI. Not greyed out — absent.

**J4 · Ops proves the broadcast invariant**
NOC home shows a permanent scoreboard tile: **`DOUBLE ASSIGNMENTS TODAY: 0`** in green; any non-zero flips the entire header red and opens an incident. Beside it: `p95 time-to-accept`, `p95 cancel fan-out (target <2s)`, `cancellation cost today`.
Drill: tile → broadcast health → offending order → allocation timeline showing the exact millisecond each provider was triggered, who accepted, when the lock was acquired, and when each cancel landed.
*UX bet:* the **Allocation Timeline** is the signature component of this product. It's a horizontal swimlane per provider with millisecond ticks. Build it well; it's what you demo.

**J5 · Ops changes a price without a deploy**
Tariff rules → pick rule → edit components → **dry-run panel** (enter a sample order, see the computed rate and the matched rule's priority path) → diff view of before/after → approve → audit entry written.
*UX bet:* **no tariff rule may be saved without a successful dry run.** The dry run is a required step in the flow, not an optional tool. Mis-priced rules are how aggregators lose money silently.

**J6 · Agency weekly settlement (accept or dispute in 48h)**
Monday statement lands → notification → statement detail shows `rate × delivered − RTO penalties − SLA deductions = net payable`, **every deduction line clickable to the order that caused it** → Accept (one tap) or Dispute (pick lines, add reason, attach) → 48h countdown visible throughout.
*UX bet:* deductions must be **traceable to an order** or the agency relationship rots. This is the single feature that determines whether Phase 2 supply survives.

**J7 · Rider completes a delivery**
One decision per screen. Big targets (min 56dp). Bottom-anchored primary action (thumb zone). Swipe-to-confirm for irreversible steps (picked up, delivered). Offline queue with visible sync state. Tamil default.
*UX bet:* **the app never blocks on network.** POD photo, OTP, COD amount all captured locally and synced with an explicit "3 items syncing" chip.

**J8 · Recipient tracks (the invisible surface)**
SMS link → page opens in < 2s on 3G → map with rider, status timeline, ETA, masked call. No login, no app prompt, no DittoMart Go branding.
*UX bet:* ship a **skeleton-free first paint** — render the timeline and status from the server immediately, hydrate the map after. A tracking page that shows a spinner has failed.

### 2.3 Interaction principles (cross-surface)

| Principle | Application |
|---|---|
| **Status is a color + a word, never color alone** | WCAG; also ops screenshots get printed in B&W for incident reviews |
| **Every list is filterable, saveable, and shareable by URL** | Ops shares "the stuck queue for Rapido in T.Nagar" as a link |
| **Destructive/financial actions need typed confirmation** | Manual wallet credit, force-reassign, provider disable, key revoke |
| **Every override captures a reason** | Control-plane requirement; the reason field is mandatory and goes to audit |
| **Optimistic UI only for reversible actions** | Never optimistic on money, assignment, or KYC approval |
| **Real-time without whiplash** | New rows animate in; existing rows never reorder while hovered/focused; a "3 new orders ↑" pill instead of auto-scroll |
| **Permission-aware, not permission-punishing** | Hide what the role can't do; if it must be shown, disable with a tooltip explaining which permission is needed |
| **Empty states teach** | Every empty state carries the next action + a docs link |

### 2.4 State design (the four states of everything)

Every data surface must ship **loading / empty / error / partial** designs:
- **Loading:** skeletons matching final layout (no spinners on lists); shimmer ≤ 1.2s, then a "still working" message.
- **Empty:** distinguish *never had data* (onboarding CTA) from *filtered to nothing* (clear-filters CTA).
- **Error:** typed. Network / permission / not-found / server / **stale-realtime** (socket dropped → amber "Reconnecting, data may be stale" band; never silently show frozen data on a live map).
- **Partial:** a provider's ETA is missing but the order renders — show `—` with a tooltip, never `null`, never a broken card.

### 2.5 Accessibility & localization strategy

- **WCAG 2.2 AA** across all web surfaces; **AAA contrast (7:1)** for the Rider App (sunlight) and the tracking page's status text.
- Full keyboard operation in Ops, including a command palette and single-key filters (`g o` → orders, `/` → search, `e` → escalate).
- Locale plan: **Client/Ops = English (en-IN)**. **Agency = English + Tamil**. **Rider App = Tamil default, Hindi, English**. **Tracking page = Tamil/English auto by browser, tenant-overridable**.
- Design for **+35% string growth** in Tamil; no fixed-width buttons, no text in icons.
- Numerals: Indian grouping (₹1,24,500), `en-IN` date formats, IST everywhere with an explicit `IST` suffix on Ops timestamps.
- Rider App: 44dp minimum, 56dp preferred targets; supports OS font scaling to 200% without layout breakage.

### 2.6 Trust & transparency UX (the differentiator)

Three deliberate transparency features that competitors don't ship:
1. **Rate explainer** — every quoted rate expands into its components and shows *which tariff rule matched and why* (priority path P1…P6). Clients stop emailing about pricing.
2. **Proof of Freshness card** [P3] — pickup photo, temperature graph, delivery photo, tamper-evident hash. Designed as a shareable certificate, not a table row.
3. **Allocation transparency** — the client sees "we tried 4 providers, Rapido accepted in 8s." Not the supply cost. Never the margin.

---

## 3. Design System — "Ditto Go DS"

### 3.1 Brand posture

Industrial calm. This is infrastructure — it should feel like a control room, not a startup landing page. Reference points: Stripe (clarity), Linear (density + motion restraint), Datadog (alarm hierarchy). Deliberately **not** playful; a rider penalty screen and a ₹4L settlement screen cannot share a tone with a gradient hero.

Two themes are non-negotiable: **Ops ships dark-first** (all-day operator use), **Client ships light-first** with a dark option. Both are generated from one token set.

### 3.2 Token architecture (three tiers)

```
Tier 1 · PRIMITIVE     raw values, never used directly in components
                       blue.500 = #2563EB · space.4 = 16px · font.size.3 = 14px

Tier 2 · SEMANTIC      intent, theme-aware, what components consume
                       color.bg.surface · color.text.muted · color.status.danger.fg

Tier 3 · COMPONENT     per-component overrides only where genuinely needed
                       button.primary.bg · table.row.hover.bg
```
Tokens live in one source (Style Dictionary or equivalent) and emit: CSS custom properties (web), a Tailwind theme extension, and a Dart token file (Flutter). **One source, three outputs** — Flutter and Next.js must not drift.

### 3.3 Color

**Brand / accent**
| Token | Light | Dark | Use |
|---|---|---|---|
| `brand.primary` | `#1B58E0` | `#5B8DEF` | Primary actions, active nav, focus |
| `brand.accent` | `#00B8D9` | `#22D3EE` | Data highlights, live indicators |
| `brand.deep` | `#0B1220` | `#070B12` | Ops chrome, app bar |

**Semantic status** — one meaning, one color, everywhere:
| Meaning | Token | Light fg / bg | Applied to |
|---|---|---|---|
| Neutral / created | `status.neutral` | `#475569` / `#F1F5F9` | `CREATED` |
| Info / in progress | `status.info` | `#1B58E0` / `#EFF4FF` | `ALLOCATING`, `IN_TRANSIT` |
| Success | `status.success` | `#0F7B4F` / `#E8F7F0` | `DELIVERED`, settled, accepted |
| Warning | `status.warning` | `#A15C00` / `#FFF6E5` | `PENDING_PAYMENT`, SLA at risk, low balance |
| Danger | `status.danger` | `#B3261E` / `#FDECEA` | `FAILED`, SLA breach, temp breach, fraud |
| Return | `status.rto` | `#7C3AED` / `#F4EEFF` | `RTO` — deliberately distinct from failure |
| Cancelled | `status.muted` | `#64748B` / `#F1F5F9` | `CANCELLED` |

**Temperature scale (the moat gets its own palette)**
| Class | Token | Color | Icon |
|---|---|---|---|
| FROZEN | `temp.frozen` | `#1E6FD9` deep blue | ❄ |
| CHILLED | `temp.chilled` | `#22A7C4` cyan | 🧊 |
| AMBIENT | `temp.ambient` | `#64748B` slate | ○ |
| HOT | `temp.hot` | `#D9541E` orange | 🔥 |
Breach overlays a red pulse ring on the class chip — the chip keeps its class color so you can still read *what* it was.

**Supply-rail identity**
`rail.3pl` = violet `#7C3AED` · `rail.agency` = green `#0F7B4F` · `rail.ondc` = teal `#0E7490`. Used as a 3px left border on order rows and a chip in detail views — an operator can read the rail mix of a board at a glance.

**Data-viz palette:** 8 categorical hues, colorblind-safe (Okabe-Ito derived), plus sequential ramps for the zone heatmap and a diverging ramp for margin (loss ↔ profit). Charts never encode by color alone — always color + label or color + pattern.

**Rules:** every semantic pair is contrast-verified in both themes; status colors are never reused for branding; charts never borrow status colors except for a genuine status series.

### 3.4 Typography

| Role | Family | Rationale |
|---|---|---|
| UI / product | **Inter** (variable) | Excellent at 12–14px density, tabular figures |
| Tamil / Devanagari | **Noto Sans Tamil / Devanagari** | Matched metrics, wide coverage |
| Numeric & mono | **JetBrains Mono** | IDs, keys, JSON, timestamps, currency in tables |
| Display (marketing/certificates only) | Inter Display / Rajdhani | Restricted to the Proof-of-Freshness certificate and login art |

**Scale (4px-aligned, 1.2 ratio in dense zones):**
`11 caption` · `12 label` · `13 body-sm` · `14 body` · `16 body-lg` · `18 h4` · `22 h3` · `28 h2` · `36 h1` · `48 display`
Line heights: 1.45 body, 1.25 headings. Weights: 400 / 500 / 600 / 700 only.

**Density modes:** Ops tables use `13/1.35`; Client uses `14/1.5`; Rider App uses `16/1.5` minimum. **All currency, IDs, and timestamps use tabular figures** — non-negotiable in financial tables.

### 3.5 Spacing, layout, radius, elevation

- **Base 4px.** Scale: 2·4·8·12·16·20·24·32·40·48·64·80.
- **Grid:** Client = 12-col, max 1440px content, 24px gutters. Ops = fluid, no max width, 16px gutters, 3-zone layout (rail · list · detail). Agency = 12-col responsive, 390px baseline. Tracking = single column, max 480px.
- **Radius:** `sm 4` (chips, inputs) · `md 8` (cards, buttons) · `lg 12` (modals, panels) · `full` (avatars, pills). Ops leans `sm/md` (denser feel), Client leans `md/lg`.
- **Elevation:** 5 levels, dark theme uses **surface lightening** rather than shadows (shadows disappear on dark). `e0 flat` · `e1 card` · `e2 dropdown` · `e3 modal` · `e4 toast/command palette`.
- **Borders:** 1px hairline is the primary separator in Ops; cards-with-shadow is the primary container in Client. Two different visual strategies, one token set.

### 3.6 Iconography & imagery

- **Lucide** as the base set (pairs with shadcn/ui), 1.5px stroke, 16/20/24px sizes.
- **~40 custom domain icons** required: bike / auto / LCV / EV / drone / bot; frozen / chilled / ambient / hot; broadcast / sequential; 3PL / agency / ONDC; wallet gate / 402; POD photo / OTP / signature; RTO; SOS; cold box; temperature probe; margin; scorecard.
- No illustration library for Ops. Client gets a small set of **line-art empty-state illustrations** (6–8), monochrome + brand accent, so they retint per theme.
- Photos (POD, pickup) always render in a `ProofImage` frame with EXIF/GPS metadata strip — never a bare `<img>`.

### 3.7 White-labeling architecture (tracking page)

Tenant supplies: logo (SVG/PNG), primary color, optional accent, brand name, support phone, favicon.
System derives: an accessible on-color, a hover/pressed pair, a 6-step tint ramp, and a chart color — with **automatic contrast correction**. If a tenant's brand color fails AA against the intended background, the system substitutes a darkened/lightened variant for text and keeps the raw color for fills only. **Tenants can never ship an inaccessible tracking page.**

Everything outside the brand slot (spacing, type, map, timeline) stays DittoMart Go's system — this is white-label, not theme-anything.

### 3.8 Dark mode

Ops dark is the *designed* theme; Ops light is the derived one (the reverse of Client). Rules: pure black is banned (`#0B1220` base); dark surfaces step up in lightness for elevation; status backgrounds drop to 12–16% alpha tints; charts get a separate dark palette with raised luminance, not the same hex values.

### 3.9 Motion tokens

| Token | Value | Use |
|---|---|---|
| `motion.instant` | 80ms | Hover, focus ring |
| `motion.fast` | 140ms | Toggles, chips, tooltips |
| `motion.base` | 220ms | Panels, dropdowns, tab switches |
| `motion.slow` | 340ms | Modals, drawers, route transitions |
| `motion.deliberate` | 600ms | Success/celebration, certificate reveal |
| `ease.standard` | `cubic-bezier(.2,0,0,1)` | Default |
| `ease.enter` | `cubic-bezier(0,0,.2,1)` | Entering |
| `ease.exit` | `cubic-bezier(.4,0,1,1)` | Exiting |
| `ease.spring` | spring(1, 90, 14) | Rider App gestures, drag |

### 3.10 Governance

- Figma library with published components, variables mapped 1:1 to code tokens, and a **Do/Don't page per component**.
- **Design-token CI check:** a hardcoded hex/px in a component file fails the build.
- Contribution flow: propose → prototype in a sandbox route → design review → promote to library. Nothing enters the library without both a light and dark spec and an accessibility note.
- Versioned changelog; breaking token renames require a codemod.

---

## 4. Component Inventory

### 4.1 Tier 1 — Primitives (shadcn/ui base, restyled to tokens)

Button (5 variants × 4 sizes × loading/disabled) · IconButton · Input · Textarea · Select · Combobox · MultiSelect · Checkbox · Radio · Switch · Slider · DatePicker · DateRangePicker · TimePicker · FileUpload (drag + camera on mobile) · Label · HelperText · FieldError · Tooltip · Popover · DropdownMenu · ContextMenu · Dialog · Drawer/Sheet · AlertDialog · Tabs · Accordion · Breadcrumb · Pagination · Avatar · Badge · Chip/Tag · Separator · ScrollArea · Skeleton · Spinner · Progress (linear/circular) · Toast · Banner/Callout · Card · Table (sortable, resizable, sticky header, virtualized) · Command palette · Kbd · Code block · CopyButton · SegmentedControl · Stepper · Timeline (generic) · EmptyState · ErrorState.

**≈ 48 primitives.**

### 4.2 Tier 2 — Composite patterns

| Component | Notes |
|---|---|
| `DataTable` | Column config, saved views, URL-synced filters, bulk selection, CSV export, virtualized to 10k rows, density toggle |
| `FilterBar` | Chip-based, saveable, shareable-by-URL |
| `StatTile` | Value + delta + sparkline + threshold state |
| `KPIWall` | Responsive grid of StatTiles, alarm-aware |
| `ChartFrame` | Consistent axis/legend/tooltip/empty/loading for every chart |
| `SplitView` | Ops 3-zone list↔detail with keyboard nav (j/k, enter, esc) |
| `WizardShell` | Multi-step with progress, save-draft, validation summary |
| `EntityHeader` | ID + copy, status, primary actions, meta row — used on every detail page |
| `AuditTrail` | Actor · action · before→after diff · IP · timestamp |
| `ConfirmDestructive` | Typed confirmation + mandatory reason field |
| `RealtimeIndicator` | Connected / reconnecting / stale, with last-update age |
| `NewItemsPill` | "3 new ↑" instead of auto-scroll |
| `JsonViewer` | Collapsible, copyable, for webhook payloads & API logs |
| `MapCanvas` | Base map wrapper: markers, route polyline, geofence, clustering, replay scrubber |

**≈ 14 composites.**

### 4.3 Tier 3 — Domain components (the product's real UI)

**Order & lifecycle**
`OrderStatusBadge` · `OrderCard` (client / ops / agency / rider variants) · `OrderTimeline` (event-sourced spine — the most reused component in the product) · `OrderStateMachineViz` (Ops: shows valid next states) · `TrackingMap` · `ETAChip` (with confidence band once AI ETA lands) · `PODCard` (photo + OTP + signature + EXIF/GPS strip) · `ProofImage` · `CODChip` · `SLAMeter` (time remaining ring, flips to breach) · `ClientOrderRefBadge` · `DeliveryAddressBlock` (pickup/drop with map peek + masked contact).

**Money**
`WalletBalanceChip` (persistent in Client top bar; pulses on low) · `WalletGateBanner` (the 402 recovery surface) · `TopupSheet` · `TransactionLedgerRow` · `RateBreakdownCard` (**expandable, shows matched rule + priority path**) · `RateLockBadge` · `MarginBar` (Ops only — client rate / supply cost / margin as one stacked bar) · `InvoiceCard` · `GSTSummary` · `SettlementStatement` (line-itemised, deductions clickable to source order) · `DisputeThread` · `InternalLedgerRow` (POSTPAID_INTERNAL).

**Allocation & supply — the signature set**
`AllocationTimeline` ⭐ — horizontal swimlane per provider, millisecond ticks: triggered → responded → accepted/rejected → lock acquired → cancel sent → cancel acked. Highlights the lock moment and any cancel exceeding 2s.
`BroadcastHealthPanel` — p50/p95 time-to-accept, cancel-fanout latency histogram, cancellation cost, **DoubleAssignmentCounter** (a dedicated component whose only job is to render a big green `0`).
`ProviderChip` · `ProviderScorecard` (accept rate, on-time, RTO, SLA breaches, avg cancellation cost — radar + trend) · `TriggerModeToggle` (broadcast/sequential with a safety warning if guardrails are off) · `EligibilityMatrix` (providers × BROADCAST/SEQUENTIAL_ONLY grid) · `RailBadge` (3PL/Agency/ONDC) · `RoutingWeightSliders` (with live re-rank preview) · `ProviderPinControl` (override + mandatory reason) · `AdapterHealthLight` · `CancellationCostChart`.

**Tariff**
`TariffRuleEditor` (match conditions + components) · `PriorityPathVisualizer` (P1→P6, shows which rule wins for a sample order) · `DistanceSlabEditor` · `DryRunPanel` ⭐ (**required before save**) · `RateDiffView` (before/after) · `ZoneMapEditor` (pincode multi-select on a map) · `SurgeIndicator`.

**Cold chain**
`TemperatureBadge` (4 classes) · `TemperatureChart` (time-series with safe band + breach markers) · `TemperatureBreachAlert` · `ColdChainChecklist` (rider) · `VehicleCapabilityChip` · `FSSAIComplianceCard` · `ProofOfFreshnessCertificate` ⭐ [P3] (shareable, printable, hash-stamped) · `BatchCompatibilityWarning`.

**Tenant & platform**
`TenantSwitcher` (Ops) · `TenantBadge` (color-coded, always visible) · `CrossTenantBanner` (amber ALL-TENANTS band) · `BillingModeBadge` (PREPAID / INTERNAL) · `APIKeyCard` (reveal-once, rotate, revoke, scope chips) · `WebhookEndpointCard` · `WebhookDeliveryRow` (status, attempts, replay) · `SandboxToggle` (Live/Sandbox — visually unmistakable; sandbox tints the entire chrome) · `FeatureFlagToggle` · `RoleMatrix` · `KillSwitchCard` (AI features) · `ApprovalQueueItem`.

**Agency & rider (P2)**
`RiderRosterRow` (online dot, current order, today's count) · `RiderKYCWizard` · `DocumentExpiryChip` · `FleetMap` (clustered riders, status colors) · `RiderScorecard` · `AssignmentCard` (**timed, with a depleting ring**) · `SwipeToConfirm` · `NavigationHandoff` · `EarningsSummary` · `PayoutStatusChip` · `ComplianceNudge` (escalating: toast → banner → forced modal) · `SOSButton` · `OfflineQueueChip` · `ShiftScheduler` · `BroadcastMessageComposer`.

**ONDC (P3)**
`ONDCTransactionRow` · `CallbackTimeline` · `RegistryKeyCard` · `RailMasterSwitch` · `BecknPayloadViewer` · `ONDCIssueCard`.

**Tracking page (isolated bundle — must not import the app design system)**
`TrackHeader` (tenant brand) · `TrackStatusTimeline` · `TrackMap` · `TrackETACard` · `MaskedCallButton` · `TrackProofCard` · `TrackErrorState`.

**≈ 95 domain components.** Total inventory ≈ **160 components** (48 + 14 + ~95), of which **~55 are Phase 1**.

### 4.4 Flutter parity set (Rider App)

Not a port of the web system — a **sibling** consuming the same tokens. Required: `GoButton`, `GoCard`, `GoBadge`, `GoSheet`, `SwipeToConfirm`, `AssignmentRing`, `StepHeader`, `BigStat`, `OfflineBanner`, `CameraCapture`, `OTPInput`, `MapView`, `ColdChainChecklist`, `EarningsRow`, `SOSOverlay`, `ComplianceModal`, `LanguageSwitcher`. **~22 components.** Shared with web only at the token layer.

### 4.5 Component priority

| Priority | Set | When |
|---|---|---|
| **P0** | 48 primitives + DataTable, FilterBar, EntityHeader, SplitView, OrderTimeline, OrderStatusBadge | Sprint 1–3 |
| **P1a** | Wallet set, RateBreakdownCard, TariffRuleEditor + DryRunPanel | Sprint 4–6 |
| **P1b** | AllocationTimeline, BroadcastHealthPanel, ProviderScorecard | Sprint 6–8 |
| **P1c** | Billing/settlement, disputes, audit, RBAC, tracking page set | Sprint 8–11 |
| **P2** | Agency + Rider Flutter set, cold-chain set | Post-launch |
| **P3** | ONDC set, Proof of Freshness, AI config | Later |

---

## 5. Wireframe Plan

### 5.1 Deliverable structure

Three fidelity passes, gated:
1. **Flow maps** (all surfaces) — boxes-and-arrows, every state including error/empty. *Approve before F2.*
2. **Lo-fi wireframes** (grayscale, real content, real data volumes — 400-row tables, 30-char Tamil names). *Approve before F3.*
3. **Hi-fi + prototype** (tokens applied, both themes, interactive for the 8 critical journeys).

Every wireframe ships with: desktop (1440) + tablet (1024) + mobile (390) where applicable, all four states, and annotation of data source (which API), permissions required, and realtime behaviour.

### 5.2 Screen inventory & priority

**S1 Client Dashboard — 31 screens**

| # | Screen | Priority | Notes |
|---|---|---|---|
| C1 | Login / 2FA | P0 | |
| C2 | Signup + onboarding wizard (5 steps) | P0 | company → GST → service area → volume → agreement |
| C3 | Overview / home | P0 | go-live checklist, exceptions, wallet, today |
| C4 | Orders board | P0 | lanes: needs attention · active · completed |
| C5 | Order detail | P0 | tabs: Timeline · Track · Proof · Charges · Webhooks · Raw |
| C6 | Create order | P0 | live quote panel |
| C7 | Bulk CSV upload | P1 | mapping + validation + partial-failure report |
| C8 | Bulk job detail | P1 | |
| C9 | Rate calculator | P0 | |
| C10 | Serviceability check | P1 | |
| C11 | Wallet overview + top-up | P0 | **402 recovery banner lives here** |
| C12 | Transactions ledger | P0 | |
| C13 | Auto-recharge settings | P1 | |
| C14 | Billing ledger (INTERNAL variant) | P0 | replaces C11–13 for Marketplace |
| C15 | Invoices list | P1 | |
| C16 | Invoice detail (GST) | P1 | |
| C17 | Statements | P1 | |
| C18 | Rate card | P1 | with rule-match explainer |
| C19 | Disputes list | P1 | |
| C20 | Dispute detail | P1 | evidence viewer |
| C21 | Raise dispute | P1 | |
| C22 | API keys | P0 | reveal-once pattern |
| C23 | Webhooks config | P0 | |
| C24 | Webhook delivery log + replay | P0 | **highest-value dev feature** |
| C25 | Sandbox console | P0 | simulate state transitions |
| C26 | Reports / analytics | P1 | |
| C27 | Tracking-link generator | P1 | |
| C28 | Settings: company | P1 | |
| C29 | Settings: team & roles | P1 | |
| C30 | Settings: notifications | P1 | |
| C31 | Settings: tracking-page branding | P1 | live preview of the tracking page |

**S2 Ops Dashboard — 38 screens**

| # | Screen | Priority |
|---|---|---|
| O1 | Ops login (SSO + 2FA) | P0 |
| O2 | NOC home / KPI wall | P0 |
| O3 | Global order board | P0 |
| O4 | Order detail (ops, full) | P0 |
| O5 | Live map | P1 |
| O6 | Allocation console | P0 |
| O7 | **Allocation timeline (per order)** ⭐ | P0 |
| O8 | Broadcast health | P0 |
| O9 | Queue: allocation failures | P0 |
| O10 | Queue: SLA breaches | P0 |
| O11 | Queue: stuck orders | P1 |
| O12 | Queue: temperature breaches | P2 |
| O13 | Queue: fraud flags | P2 |
| O14 | Providers list | P0 |
| O15 | Provider detail + scorecard | P0 |
| O16 | Adapter health & API logs | P0 |
| O17 | Agencies list | P2 |
| O18 | Agency detail | P2 |
| O19 | Riders global | P2 |
| O20 | Tariff plans | P0 |
| O21 | **Tariff rule editor + dry run** ⭐ | P0 |
| O22 | Zones & pincodes | P0 |
| O23 | Trigger configs | P0 |
| O24 | Broadcast eligibility matrix | P0 |
| O25 | Cancellation cost report | P0 |
| O26 | Routing rules & weights | P0 |
| O27 | Provider–zone coverage | P1 |
| O28 | Pins & overrides | P1 |
| O29 | AI control panel (kill switches) | P2 |
| O30 | Tenants list | P0 |
| O31 | Tenant 360 detail | P0 |
| O32 | Onboarding approval queue | P0 |
| O33 | Wallet float & manual adjustment | P0 |
| O34 | Margin report | P1 |
| O35 | Settlements (3PL / agency) | P1 |
| O36 | Reconciliation queue | P1 |
| O37 | Disputes console | P1 |
| O38 | RBAC · audit log · flags · templates | P1 |
| O39 | ONDC console | P3 |

**S3 Tracking page — 3 screens** (active / completed / invalid) + branding preview. **P0.**

**S4 Agency Dashboard — 17 screens.** P2. (Today, riders, rider detail, add-rider KYC wizard, documents, fleet map, orders, order detail, earnings, statements, statement detail w/ dispute, deductions, COD recon, performance, disputes, settings, broadcast message.)

**S5 Rider App — 24 screens.** P2. (Splash, OTP, language, permissions, home online/offline, assignment alert, order summary, nav-to-pickup, pickup confirm, cold-chain checklist, photo capture, nav-to-drop, delivery, OTP entry, POD photo, signature, COD collect, complete, multi-drop batch, orders list, earnings, performance, profile/docs, SOS, support.)

**Total: ~113 screens**, of which **~72 are Phase 1**.

### 5.3 Layout skeletons (the five shells)

```
SHELL A — Client Dashboard
┌──────────────────────────────────────────────────────────────┐
│ [logo] Tenant ▾   [LIVE|SANDBOX]      ₹42,150 ▾  🔔  👤      │  56px topbar
├────────┬─────────────────────────────────────────────────────┤
│ nav    │  Breadcrumb                          [primary CTA]  │
│ 240px  │  ┌───────────────────────────────────────────────┐  │
│ (icon  │  │  page content · max 1440 · 24px gutters       │  │
│  rail  │  └───────────────────────────────────────────────┘  │
│  at    │                                                     │
│ <1280) │                                                     │
└────────┴─────────────────────────────────────────────────────┘

SHELL B — Ops Dashboard (3-zone)
┌──┬───────────────────────────────────────────────────────────┐
│⌘ │ ⚠ ALL TENANTS   filters ▾  saved views ▾   ⟳ live · 2s ago│
│  ├──────────────────────────┬────────────────────────────────┤
│i │  list / board            │  detail panel                  │
│c │  virtualized             │  (or split further:            │
│o │  j/k navigable           │   detail + timeline)           │
│n │                          │                                │
│  ├──────────────────────────┴────────────────────────────────┤
│  │ status bar: socket · queue depth · alarms · shortcut hints │
└──┴───────────────────────────────────────────────────────────┘

SHELL C — Tracking page (mobile-first, max 480)
┌─────────────────────┐
│  [tenant logo]      │
│  Arriving 6:42 PM   │  ← big, first paint, server-rendered
├─────────────────────┤
│                     │
│      MAP            │  ← 45vh, hydrates after
│                     │
├─────────────────────┤
│ ● Picked up  6:12   │
│ ● On the way 6:20   │  ← timeline, server-rendered
│ ○ Delivered         │
├─────────────────────┤
│ 🛵 Kumar  ⭐4.8      │
│ [ Call rider ]      │  ← masked
└─────────────────────┘

SHELL D — Agency (responsive, 390 baseline)
mobile: bottom tab bar (Today · Riders · Orders · Money · More)
desktop: promotes to Shell A sidebar

SHELL E — Rider App
┌─────────────────────┐
│ ● ONLINE      ₹840  │  ← status + today's earning, always
├─────────────────────┤
│                     │
│   ONE DECISION      │  ← single-purpose content
│                     │
├─────────────────────┤
│  [  PRIMARY  ]      │  ← bottom-anchored, 56dp, thumb zone
├─────────────────────┤
│ ⌂    📋    💵    👤 │  ← hidden during active delivery
└─────────────────────┘
```

### 5.4 Detailed specs for the five signature screens

**W1 · Order Detail (Client) — the most-visited screen**
- `EntityHeader`: order ID (copy) · `client_order_ref` · status badge · temp class · rail badge (generic label only — client sees "Partner fleet", not "Rapido", unless configured) · actions (Cancel · Get tracking link · Raise dispute).
- Left 62%: `OrderTimeline` — vertical, event-sourced, each node expandable to payload; failed webhook attempts inline with a Replay button.
- Right 38%: sticky column — live map peek → `ETAChip` + `SLAMeter` → `RateBreakdownCard` (collapsed to total, expands to components + matched rule) → addresses → rider card (masked) → `PODCard` when delivered.
- Tabs above content: Timeline · Tracking · Proof · Charges · Webhooks · Raw JSON.
- **Realtime:** status badge and timeline append live; the page never full-reloads.

**W2 · Allocation Timeline (Ops) ⭐ — the signature screen**
- Header: order ID, mode (BROADCAST/SEQUENTIAL), fan-out N, final provider, total time-to-accept.
- Body: horizontal time axis in **milliseconds from t0**, one swimlane per triggered provider.
  - Each lane: `triggered ●───► responded ◆ ───► [ACCEPTED ✓ | REJECTED ✗ | TIMEOUT ⧗ | CANCELLED ⊘]`
  - A vertical **gold line** marks the lock acquisition instant, labelled `LOCK ACQUIRED → Rapido @ 00:08.412`.
  - Cancel sends render as `⊘` with an **ack latency bar**; any bar > 2s renders red with the exact ms.
  - Cancellation fee shown per lane where charged.
- Footer: guardrail checklist rendered as five live assertions — `① lock atomic ✓ ② cancel fan-out 340ms ✓ ③ eligibility respected ✓ ④ cost recorded ✓ ⑤ recon pending`.
- Actions: manually assign · replay allocation · export incident.
- This screen is the proof of G5. It should be beautiful.

**W3 · Tariff Rule Editor + Dry Run (Ops) ⭐**
- Split view. Left: rule form — priority (auto-derived from match specificity, shown as a P1–P6 badge), match conditions (client / zone / provider / vehicle / product_type), components (base, distance slabs table, weight slabs, surge, waiting, cold-chain surcharge, RTO).
- Right: **Dry Run panel** — sample order inputs (or "load a real recent order"), computed rate broken down line by line, and `PriorityPathVisualizer` showing which rules were considered and why this one won.
- Below dry run: `RateDiffView` — for 20 recent real orders, what the rate *was* vs *would be*, with total revenue delta. **Save is disabled until a dry run has been executed on the current draft.**
- Save triggers a confirm dialog with the revenue delta and a mandatory change reason → audit log.

**W4 · NOC Home (Ops)**
- Row 1 — the invariants, oversized: `DOUBLE ASSIGNMENTS TODAY: 0` (green, dominant) · `p95 time-to-accept` · `p95 cancel fan-out` (target line at 2s) · `Active orders` · `Wallet float`.
- Row 2 — alarm strip: active SLA breaches, allocation failures, temp breaches, stuck orders, failed webhooks. Each is a count that is also a link into its queue. Any non-zero animates a slow pulse; sound alert is opt-in per operator.
- Row 3 — order funnel (created → allocating → assigned → picked → delivered) as a horizontal funnel with drop-off percentages.
- Row 4 — provider strip: mini scorecards, sorted by health, red-first.
- Right dock (collapsible): live event feed, virtualized, pausable, filterable.

**W5 · Rider Pickup Confirm (Flutter)**
- Top: order chip + temp class badge (large, colored).
- Center: single task — "Confirm pickup".
  - `ColdChainChecklist`: 2–4 large toggle rows (Cold box sealed · Temperature probe attached · Items match count). Cannot proceed until all are checked when `product_type ≠ AMBIENT`.
  - `CameraCapture`: full-bleed capture, auto-flash in low light, immediate thumbnail, retake.
  - AI verification result [P2]: inline chip — `✓ Verified` / `⚠ Check quantity` with a one-tap "It's correct" override that logs a reason.
- Bottom: `SwipeToConfirm` — "Slide to confirm pickup". Deliberately not a tap; irreversible.
- Offline: everything captured locally; a chip shows `Will sync (2)`.

### 5.5 Responsive strategy

| Surface | Baseline | Breakpoints | Degradation |
|---|---|---|---|
| Client | 1280 | 640 / 1024 / 1280 / 1536 | Sidebar → icon rail → bottom sheet nav; tables → card list below 768 |
| Ops | 1440 | 1280 / 1920 | **Not supported below 1280** — show an explicit "Ops requires a wider screen" message rather than a broken layout. Exception: a dedicated mobile *alarm-only* view (P2). |
| Agency | 390 | 390 / 768 / 1280 | Mobile-first; desktop adds the sidebar and multi-column |
| Tracking | 360 | 360 / 480 / 768 | Single column always; desktop just centers |
| Rider | 360 | 360 / 412 / tablet | Portrait only, locked |

---

## 6. Animation Strategy

### 6.1 Philosophy

Motion here has three jobs and no others: **explain causality**, **direct attention to exceptions**, and **make waiting legible**. Decorative motion is banned in Ops (an operator sees these screens for 8 hours; delight becomes irritation by hour two) and rationed in Client. The only place we spend motion budget on emotion is the Rider App's completion moment and the Proof-of-Freshness reveal.

### 6.2 The motion catalogue

| Pattern | Where | Spec |
|---|---|---|
| **State transition** | Order status badge changes | 220ms crossfade + 2% scale pop; color morphs through the token ramp, never snaps |
| **Timeline append** | Order timeline, event feed | New node fades in + slides 8px up (`motion.base`, `ease.enter`); the connecting line draws in 180ms |
| **Row insert (list)** | Order boards | Height expands 200ms + fade; **never** while the list is hovered or a row is focused — queue and show `NewItemsPill` instead |
| **Allocation fan-out** ⭐ | Allocation timeline | On live orders, provider lanes draw left-to-right in real time at 1px≈10ms; the lock line **snaps in** with a 120ms flash — the one deliberately abrupt motion in the system, because the lock is atomic and the motion should say so |
| **Cancel fan-out** | Allocation timeline | Cancel markers ripple outward from the lock line; any lane exceeding 2s turns red with a single 400ms shake — used exactly once per violation, never looping |
| **Rider movement** | All maps | GPS updates ≤5s apart are **interpolated**, not teleported: marker eases along the route over the interval with a bearing rotation. This is the highest-perceived-quality animation in the product. |
| **Live pulse** | Realtime indicators, online riders | 2s breathe, 0.6→1 opacity, `ease-in-out`. Max 3 concurrent pulses per screen or it becomes noise. |
| **Alarm attention** | Non-zero exception counts | Slow 1.6s pulse on the container border only (not the number — the number must stay readable) |
| **Wallet gate (402)** | Client | The blocked banner slides down 340ms and the wallet chip does a single amber flash. On resolve: banner slides up, released orders each get a 200ms green sweep in sequence (60ms stagger). |
| **Number transitions** | KPIs, balances, margin | Count-up over 400ms with tabular figures — but **only on user-initiated refresh**, never on a live tick (a balance that constantly animates is unreadable) |
| **Skeleton → content** | All lists | Skeleton crossfades to content over 140ms; no layout shift permitted (skeletons must match final dimensions) |
| **Panel / drawer** | Ops detail, sheets | 340ms translate + backdrop fade at 220ms; `ease.enter`/`ease.exit` asymmetric |
| **Route transition** | Client, Agency | 160ms content fade only; chrome never animates. Ops: **no route transition at all** — instant. |
| **Chart entry** | Reports | Bars/lines draw over 500ms with a 30ms per-series stagger, once per mount; never on data refresh |
| **Temperature breach** | Cold chain | The temp chip's ring pulses red 3 times then holds solid — attention, then rest |
| **Assignment ring** | Rider app | 60s countdown ring depletes with a linear sweep; last 10s the ring color ramps amber→red and haptics tick each second |
| **Swipe to confirm** | Rider app | Spring-tracked thumb; at 80% it magnetizes to complete with haptic; success = 300ms fill + checkmark draw |
| **Delivery complete** | Rider app | The one celebratory moment: 600ms checkmark draw + earning value count-up + a single medium haptic. No confetti. |
| **Proof of Freshness** [P3] | Certificate | 800ms staged reveal: photo → temperature graph draws → hash stamp presses in. This is a marketing asset; it earns the budget. |
| **Sandbox mode** | Client | Switching to sandbox tints the entire chrome over 300ms — unmistakable, non-dismissible |

### 6.3 Realtime motion rules (the hard ones)

1. **Never reorder a list under the user's cursor.** Freeze ordering while a row is hovered or focused; apply the pending reorder on blur with a 200ms FLIP.
2. **Interpolate positions, animate nothing else on maps.** Marker easing yes; popup bounce no.
3. **Stale beats wrong.** If the socket drops, freeze the data and show the reconnecting band. Never animate stale data to look live.
4. **Budget: 3 concurrent animations per viewport.** Beyond that, the eye can't prioritise and the alarm hierarchy collapses.
5. **Only transform and opacity.** Any animation touching layout properties is a bug.

### 6.4 Performance budget

| Metric | Target |
|---|---|
| Frame rate during list scroll + live updates | 60fps, no frame > 16ms |
| Tracking page LCP (3G, mid-range Android) | < 2.0s |
| Client dashboard TTI | < 3.0s |
| Ops board with 2,000 live rows | Virtualized, < 100ms filter response |
| Rider App: cold start → home | < 2.5s |
| Animation JS cost per frame | < 4ms (prefer CSS/Web Animations; Framer Motion only where orchestration is genuinely needed) |

### 6.5 Reduced motion

`prefers-reduced-motion: reduce` → all durations to 0 except opacity crossfades capped at 100ms; map markers jump instead of interpolate; pulses become a static border; the assignment ring becomes a numeric countdown. **Alarm states must remain perceivable without motion** — every pulsing element also carries a color and an icon change. Rider App exposes the same toggle in Settings independent of OS.

---

## 7. Development Roadmap

### 7.1 Team shape (assumed)

1 design lead · 1 product designer · 1 frontend lead · 3 frontend engineers · 1 Flutter engineer (from P2) · backend team per the Platform Plan's build sequence. Frontend runs **one sprint behind** backend on each module, and **one sprint ahead** on the design system.

### 7.2 Phase 0 — Foundations (Weeks 1–4, before feature work)

| Wk | Design | Frontend |
|---|---|---|
| 1 | Flow maps for J1–J8; IA sign-off | Monorepo (Turborepo): `apps/client`, `apps/ops`, `apps/track`, `packages/ui`, `packages/tokens`, `packages/api-client` |
| 2 | Token set v1 (both themes); type/color/space | Style Dictionary → CSS vars + Tailwind theme + Dart; shadcn/ui installed and retokenized |
| 3 | Core primitives specced; Figma library published | 48 primitives built + Storybook + visual regression (Chromatic/Playwright) |
| 4 | Lo-fi wireframes: Client C1–C6, Ops O2–O4 | App shells A/B/C; auth scaffolding; realtime transport (WS + reconnect + stale detection); a11y CI (axe) + token-lint CI |

**Exit gate:** Storybook published, both themes render, contrast audit passes, a fake order flows through a mocked shell end to end.

### 7.3 Phase 1 — Launch (Weeks 5–24)

Aligned to the Platform Plan's backend build sequence (M10+M1 → M2+M3 → M6 → M7 → M5 → M4 → M9).

| Sprint (2wk) | Backend ready | Design delivers | Frontend delivers |
|---|---|---|---|
| **S1** (5–6) | M10 platform, M1 tenant-client | Hi-fi: auth, onboarding, tenant admin | Client C1–C2; Ops O1, O30–O32; RBAC-aware routing |
| **S2** (7–8) | M2 wallet, M3 tariff | Hi-fi: wallet, 402 recovery, tariff editor | C11–C13, C22–C23; `WalletGateBanner`, `WalletBalanceChip`, `TopupSheet` |
| **S3** (9–10) | M3 tariff | Hi-fi: dry run, priority path, zones | **O20–O22 tariff editor + DryRunPanel + PriorityPathVisualizer**; C9 rate calculator |
| **S4** (11–12) | M6 order | Hi-fi: order board, order detail, timeline | C3–C6; O3–O4; `OrderTimeline`, `DataTable` at scale, realtime board |
| **S5** (13–14) | M6 order, M7 supply-3pl | Hi-fi: tracking page (3 states + branding) | **S3 tracking page shipped** (separate bundle, SSR, perf budget enforced); C31 branding editor |
| **S6** (15–16) | M7, M5 routing | Hi-fi: providers, scorecards, routing config | O14–O16, O26–O28; `ProviderScorecard`, `RoutingWeightSliders` |
| **S7** (17–18) | M4 trigger | Hi-fi: **allocation timeline, broadcast health** | **O6–O8 ⭐**, O23–O25; `AllocationTimeline`, `DoubleAssignmentCounter`, `EligibilityMatrix` |
| **S8** (19–20) | M4 trigger | Hi-fi: exception queues, NOC home | **O2 NOC home**, O9–O11; alarm hierarchy; command palette |
| **S9** (21–22) | M9 billing | Hi-fi: invoices, margin, settlements, disputes | C15–C21; O33–O37; `SettlementStatement`, `DisputeThread`, `MarginBar` |
| **S10** (23) | — | Polish pass; a11y audit; empty/error sweep | C7–C8 bulk, C24–C26 dev tools, C27 tracking links, O38 audit/flags |
| **S11** (24) | — | Launch review, docs, handover | Hardening, perf budget enforcement, cross-tenant security UI audit, load test Ops at 5k rows |

**Phase 1 exit criteria (design/frontend):**
- All 72 P1 screens shipped in both themes with four states each.
- Automated cross-tenant UI test suite green (no component renders data outside its tenant scope).
- Tracking page LCP < 2.0s on throttled 3G.
- Ops board sustains 2,000 live rows at 60fps.
- axe: zero critical/serious violations. Keyboard-only walkthrough of J1–J5 passes.
- Storybook coverage ≥ 90% of shipped components; visual regression suite green.

### 7.4 Phase 2 — Own supply (Weeks 25–44)

| Sprint | Focus | Delivers |
|---|---|---|
| S12–S13 | **Flutter foundation** | Token pipeline → Dart; 22 Flutter components; auth + permissions primer + language switcher; offline architecture |
| S14–S15 | **Rider delivery flow** | Assignment → pickup → nav → POD → COD → complete; `SwipeToConfirm`, `AssignmentRing`, offline queue |
| S16 | **Cold-chain rider** | Checklist, temperature capture, `TemperatureBadge` system across all surfaces |
| S17–S18 | **Agency Dashboard** | All 17 screens, mobile-first; `SettlementStatement` with traceable deductions (J6) |
| S19 | **Rider earnings + compliance** | Earnings, performance, `ComplianceNudge` escalation ladder, SOS |
| S20 | **Ops extensions** | O17–O19 agencies/riders, O12 temp queue, agency settlement screens |
| S21 | **AI (P2 half)** | O29 AI control panel + kill switches; pickup-photo verification UI; O13 fraud queue |
| S22 | Polish, Tamil localization QA, field testing with real riders | |

**Phase 2 exit:** Rider App usable one-handed in sunlight by a Tamil-first user with no training beyond a 2-minute walkthrough — validated by 5 real riders, not by us.

### 7.5 Phase 3 — Network & intelligence (Weeks 45+)

| Block | Delivers |
|---|---|
| ONDC console | O39: transactions, callback timelines, registry keys, rail switch, Beckn payload viewer |
| IoT cold chain | Live `TemperatureChart` streaming, breach queue automation |
| **Proof of Freshness** | The certificate — designed as a shareable/printable marketing asset |
| AI surfaces | ETA confidence bands, surge indicator, pre-positioning map overlay, voice-call transcripts in the order timeline |
| WhatsApp bot | Conversational IA + Tamil message template design (no visual system) |

### 7.6 Parallel workstreams (run continuously)

- **Design system maintenance:** biweekly library release, changelog, deprecations.
- **Content design:** every error message, empty state, notification (SMS/email/webhook/push) written by a person, not a developer. **~120 strings for Phase 1** — treat as a deliverable with an owner.
- **Research:** 3 client-dev integration tests (J1 timing), 2 ops shadowing sessions before S7, 5 rider field tests before P2 launch, 3 agency-owner interviews before S17.
- **Documentation:** `docs.dittomart.in` — API reference, quickstart, webhook guide, sandbox guide. Ships with Phase 1; it is part of the product, not marketing.

### 7.7 Risks (design/frontend specific)

| Risk | Mitigation |
|---|---|
| Allocation timeline is technically hard (ms precision, live streaming) | Prototype it in Phase 0 week 4 with fake data. If it can't hit 60fps, redesign to a stepped view before S7 — do not discover this in sprint 7. |
| Ops density fights accessibility | Ship a density toggle from day one; audit at the *comfortable* density, verify at *compact*. |
| Tenant branding produces unreadable tracking pages | Automatic contrast correction in the token derivation, plus a preview that shows a warning. Never let a tenant save an AA-failing combination. |
| Flutter/web token drift | Single token source with CI that fails if the Dart output is stale. |
| 113 screens is a lot for 2 designers | Ruthless component reuse: 5 shells + 14 composites cover ~70% of screens. Wireframe by *shell*, not by screen. |
| Realtime UX regressions are invisible in review | Add a "chaos mode" in Storybook: simulated socket drops, out-of-order events, 500ms→10s latency. Every realtime component must be reviewed in chaos mode. |
| Tamil string growth breaks layouts | Pseudo-localization in CI on every PR (+35% length, Tamil glyphs). |

### 7.8 Definition of done (per screen)

A screen is done when: both themes render · four states designed and built · responsive breakpoints handled · keyboard-navigable · axe-clean · Storybook entry with realistic data volumes · realtime behaviour reviewed in chaos mode · permissions variants covered · copy reviewed · analytics events instrumented · added to the visual-regression suite.

---

## 8. Open questions for you (blocking or shaping design)

| # | Question | Blocks |
|---|---|---|
| **D1** | Does the Client Dashboard reveal **which 3PL** delivered, or only "Partner fleet"? Affects order detail, reports, and provider-relationship risk. | W1, C26 |
| **D2** | OQ2 — does Go charge Marketplace a margin? Determines whether the `POSTPAID_INTERNAL` ledger view shows a rate at all. | C14 |
| **D3** | Is there a **client-side team/RBAC** in Phase 1, or single-login-per-tenant? Changes C29 and every permission-aware component. | C29, shell A |
| **D4** | Broadcast fan-out **N** (OQ4) — drives how many swimlanes the allocation timeline must render legibly (4 is a chart; 12 is a different design). | W2 |
| **D5** | Chennai-only or multi-city at launch (OQ3)? Multi-city adds a city dimension to nearly every Ops filter and the zone editor. | O22, all Ops filters |
| **D6** | Does the Client Dashboard need **Tamil** in Phase 1, or English-only? | Localization scope |
| **D7** | Confirm the brand: do we have DittoMart Go logo/wordmark/color, or does design create it? Everything in §3.1 assumes we define it. | Design system §3 |
| **D8** | Ops team size at launch — 2 people or 10? Determines whether we build assignment/ownership of exception queues in Phase 1. | O9–O13 |

---

**Next step:** on your confirmation I'll proceed to build. Recommended first artifact is the **design token package + Storybook with the 48 primitives in both themes**, followed by the **allocation timeline prototype** (highest technical risk, highest demo value).
