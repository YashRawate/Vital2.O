# Delhi NCR AQI Control Dashboard 
**Designed as:** a government operations console (CPCB / state pollution control board / disaster management use) — not a consumer weather app. Structured as two views, matching how an operator actually works: a live spatial overview first, detailed analytics on demand.

**Design philosophy:** visualization-first, text-minimal. Every number should be readable in under 2 seconds. Controls, the map, and live data never compete for the same space — each has its own column.

---

## 1. Design System — Light Theme

### Color Palette

| Token | Hex | Use |
|---|---|---|
| `--bg-page` | `#F4F3EF` | Page background (warm off-white, not stark white) |
| `--bg-surface` | `#FFFFFF` | Card/panel surfaces |
| `--bg-surface-2` | `#FAFAF7` | Recessed panels (map background, input fields) |
| `--border` | `#E3E1D9` | 1px hairline borders — no drop shadows anywhere |
| `--text-primary` | `#1C1B18` | Headings, big numbers |
| `--text-secondary` | `#6B6960` | Labels, captions, subtext |
| `--accent-alert` | `#C4451C` | Severe/danger status ONLY |
| `--accent-warning` | `#B8860B` | Moderate/poor status |
| `--accent-good` | `#3A7D5C` | Good/satisfactory status |
| `--accent-info` | `#2A5C8A` | Neutral/informational accents |
| `--accent-neutral` | `#8C8A80` | Grid lines, inactive states |

**Rule:** color always means the same thing everywhere on the page. Never more than 4 colors visible in one view.

### Typography

| Role | Size | Weight |
|---|---|---|
| Hero number (AQI) | 36–40px | 600 |
| Section/column label | 13px | 500, `--text-secondary` |
| Card value | 18–20px | 500 |
| Body/caption | 11–12px | 400 |

Sans-serif throughout (Inter or system-ui). No monospace.

### Spacing

- 16px gap between the three main columns
- 14px internal panel padding
- 10px corner radius on all panels
- 1px hairline borders only — depth comes from `--bg-surface` vs `--bg-surface-2` tone shift, never shadows

---

## 2. Page Structure — Two Views

Top nav has two tabs, matching how an operator actually uses this: a fast spatial glance, then deep analysis when needed.

```
Delhi NCR — Air Quality Control Center     [ Live Map ]  [ Deep Insights ]     🕑 6:00 AM   📍 ITO, Delhi ▾
```

---

## VIEW 1 — Live Map (default view, 3-column layout)

Primary screen — everything an operator needs in one glance, no scrolling required.

```
┌──────────────┬────────────────────────────────────┬──────────────┐
│  CONTROLS    │              MAP (center)           │  LIVE DATA   │
│  (210px)     │              (flexible)              │  (240px)     │
└──────────────┴────────────────────────────────────┴──────────────┘
```

### Left Column — Controls (210px, fixed)
- **Zone control**: List of selectable zones with active highlight (`["Delhi NCR (all)", "North Delhi", "East Delhi", "Gurugram", "Noida"]`)
- **Map layers**: Toggle rows with clean text states (`AQI heatmap: ON`, `Plume overlay: ON`, `Station markers: OFF`)
- **GRAP status card**: `Stage IV`, `Auto-triggered by forecast`

### Center Column — Map (flexible width, dominant visual)
- **Header**: "Delhi NCR — live AQI zones" + timeframe pills (`Now | +24h | +72h`)
- **Spatial heatmap**: 5–6 zone blobs, radial gradient shaded by severity color
- **Plume overlay**: Soft shape drifting from Punjab/Haryana fire sources (Sangrur, Karnal) toward Delhi NCR
- **In-map labels**: `Zone name · AQI value` directly on map
- **Legend chip**: `Green 0-120 · Amber 120-250 · Red 250+` (bottom-left)

### Right Column — Live Data (240px, fixed)
- **Live AQI**: Hero number (`387`), status pill (`Severe`), station name (`ITO, Delhi`)
- **Pollutant breakdown**: Progress bars for PM2.5 (92% alert), PM10 (75% warning), NOx (45% warning), O3 (20% good)
- **72-hour outlook**: Compact 6-bar mini chart `[92, 95, 88, 65, 55, 40]`
- **Hotspot zones**: Ranked list (`East Delhi 445`, `North Delhi 410`, `Central Delhi 387`)

---

## VIEW 2 — Deep Insights (secondary tab, scrollable)

- **Section A**: 72-Hour Forecast with confidence band and `Coupled Model | One-Way Baseline` toggle
- **Section B**: Pollution Source Attribution (Local 41%, Stubble 32%, Inversion 27%)
- **Section C**: Model Accuracy Tracker (7-day accuracy: 91.2%)
- **Section D**: Monitoring Station Grid (5 uniform sensor tiles)
- **Section E**: Public Alert Status (48,200 alerts sent via SMS + WhatsApp)

---

## 3. Getting Started

### Installation

```bash
git clone https://github.com/YashRawate/Vital2.O.git
cd Vital2.O
npm install
npm run dev
```

### Production Build

```bash
npm run build
```
