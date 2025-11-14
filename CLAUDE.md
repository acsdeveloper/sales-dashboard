# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 16** enterprise spend analytics dashboard that visualizes financial data from a Google Sheets backend. The application features interactive charts (treemap, sunburst, heatmap, world map) with real-time filtering capabilities.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript
- **UI Components**: shadcn/ui (based on Radix UI primitives)
- **Styling**: Tailwind CSS v4
- **Charts**: ECharts and Recharts
- **Forms**: react-hook-form with Zod validation
- **Data Source**: Google Apps Script API serving Google Sheets data

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Project Structure

### Core Application Architecture

```
app/
├── layout.tsx          # Root layout with metadata
├── page.tsx            # Main dashboard page (client component)
└── globals.css         # Global Tailwind styles

components/
├── header.tsx          # Top navigation bar
├── sidebar.tsx         # Left sidebar navigation
├── filter-bar.tsx      # Multi-select filter controls
├── kpi-cards.tsx       # Key performance indicator cards
├── charts/             # Visualization components
│   ├── treemap-chart.tsx
│   ├── sunburst-chart.tsx
│   ├── heatmap-chart.tsx
│   └── world-map-chart.tsx
└── ui/                 # shadcn/ui components (60+ components)

lib/
├── utils.ts            # cn() utility for className merging
└── data-processor.ts   # SpendRow interface & CSV/JSON parsing

api/
└── code.gs             # Google Apps Script for Sheets API
```

### Data Flow

1. **Data Fetching**: [app/page.tsx](app/page.tsx) fetches from Google Apps Script endpoint on mount
2. **Data Parsing**: [lib/data-processor.ts](lib/data-processor.ts) converts API response to `SpendRow[]` array
3. **Filtering**: Client-side filtering by company, supplier, country, category, and year
4. **Visualization**: Filtered data passed to chart components

### Key Data Structure

```typescript
interface SpendRow {
  PortCo: string      // Portfolio company name
  Invoice: string
  PONo: string        // Purchase order number
  Date: string
  Supplier: string
  Country: string
  Level1: string      // Category hierarchy level 1
  Level2: string      // Category hierarchy level 2
  Level3: string      // Category hierarchy level 3
  Amount: number
}
```

## Component System

This project uses **shadcn/ui** components located in `components/ui/`. These are Radix UI primitives with Tailwind styling.

### Adding New shadcn/ui Components

The project is configured to use the "new-york" style variant with CSS variables. Path aliases are defined in [components.json](components.json):

```json
{
  "components": "@/components",
  "utils": "@/lib/utils",
  "ui": "@/components/ui"
}
```

### Custom Components

Business logic components in `components/` include:
- **FilterBar**: Multi-select dropdowns using Radix Select
- **KPICards**: Aggregated metrics display
- **Charts**: ECharts-based visualizations with responsive layouts

## Styling Conventions

- Uses Tailwind CSS v4 with `@tailwindcss/postcss`
- Color scheme: Primary navy (`#363C74`), slate backgrounds
- Mobile-first responsive design with `lg:` breakpoints
- CSS variables for theming defined in `globals.css`

## TypeScript Configuration

- Path alias: `@/*` maps to root directory
- React JSX transform enabled
- Build errors ignored in Next.js config (see [next.config.mjs](next.config.mjs))
- Target: ES6

## API Integration

The Google Apps Script endpoint at `api/code.gs` provides:
- `doGet()`: Returns all spreadsheet data as JSON
- `doGetFiltered()`: Supports query parameter filtering

**API Response Format**:
```json
{
  "status": "success",
  "data": [...],
  "count": 123
}
```

## State Management

No external state management library. Uses React hooks:
- `useState` for filters and data
- `useMemo` for derived filter options and filtered data
- `useEffect` for API data fetching

## Chart Components

All charts use ECharts via `echarts-for-react`:
- **TreemapChart**: Hierarchical category visualization
- **SunburstChart**: Nested category relationships
- **HeatmapChart**: Temporal spending patterns (month × week)
- **WorldMapChart**: Geographic spend distribution

Chart components receive filtered `SpendRow[]` data and handle ECharts configuration internally.

## Known Configuration

- TypeScript build errors are ignored (`ignoreBuildErrors: true`)
- Images are unoptimized (`unoptimized: true`)
- No ESLint configuration file present
- Uses npm (has both `package-lock.json` and `pnpm-lock.yaml` but npm is primary)

## Development Workflow

1. Data structure changes require updating `SpendRow` interface in [lib/data-processor.ts](lib/data-processor.ts)
2. New filters require changes to both filter state in [app/page.tsx](app/page.tsx) and FilterBar component
3. Chart additions should follow existing pattern: create component in `components/charts/`, import in page, pass filtered data
4. UI components should be added via shadcn/ui CLI when possible for consistency
