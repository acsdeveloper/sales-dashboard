# Spend Overview Dashboard

An enterprise spend management and analysis dashboard built with Next.js, featuring interactive data visualizations and real-time filtering capabilities.

![Dashboard Preview](public/icon.svg)

## Features

- **Real-time Data Integration**: Connects directly to Google Sheets via Google Apps Script API
- **Interactive Visualizations**:
  - Treemap chart for spend by category
  - Sunburst chart for category hierarchy
  - Geographic map for spend by country
  - Heatmap for temporal spending patterns (month × week)
- **Advanced Filtering**: Multi-dimensional filtering by company, supplier, country, category, and year
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Built with shadcn/ui components and Radix UI primitives
- **Performance**: Client-side filtering with optimized rendering using React 19

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts**: [ECharts](https://echarts.apache.org/) & [Recharts](https://recharts.org/)
- **Form Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Data Source**: Google Apps Script API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Google Sheets with spend data (optional, for backend integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd code
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── header.tsx          # Navigation header
│   ├── sidebar.tsx         # Left sidebar navigation
│   ├── filter-bar.tsx      # Filter controls
│   ├── kpi-cards.tsx       # KPI metrics
│   ├── charts/             # Chart components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── utils.ts            # Utility functions
│   └── data-processor.ts   # Data parsing logic
├── api/
│   └── code.gs             # Google Apps Script
├── public/                 # Static assets
└── styles/                 # Additional styles
```

## Configuration

### Google Sheets Integration

1. Create a Google Sheet with the following columns:
   - PortCo (Portfolio Company)
   - Invoice
   - PONo (Purchase Order Number)
   - Date
   - Supplier
   - Country
   - Level1 (Category Level 1)
   - Level2 (Category Level 2)
   - Level3 (Category Level 3)
   - Amount

2. Deploy the Google Apps Script from `api/code.gs` (see [API Documentation](api/README.md))

3. Update the API endpoint in `app/page.tsx`:
```typescript
const response = await fetch('YOUR_GOOGLE_SCRIPT_URL', {
  method: 'GET',
  mode: 'cors',
})
```

### Environment Variables

This project doesn't require environment variables for basic operation. The API endpoint is currently hardcoded in `app/page.tsx`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Data Structure

The application expects data in the following format:

```typescript
interface SpendRow {
  PortCo: string      // Company name
  Invoice: string     // Invoice number
  PONo: string        // Purchase order number
  Date: string        // Transaction date
  Supplier: string    // Supplier name
  Country: string     // Country code/name
  Level1: string      // Category level 1
  Level2: string      // Category level 2
  Level3: string      // Category level 3
  Amount: number      // Spend amount
}
```

## Customization

### Adding New Filters

1. Update filter state in `app/page.tsx`
2. Add filter logic to `filteredData` useMemo
3. Update `FilterBar` component with new filter controls

### Adding New Charts

1. Create a new component in `components/charts/`
2. Import and use in `app/page.tsx`
3. Pass filtered data as props

### Styling

The project uses Tailwind CSS v4 with the "new-york" style variant. Color scheme can be customized in `app/globals.css`.

Primary color: `#363C74` (Navy)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Client-side filtering uses `useMemo` for optimization
- Chart components are memoized to prevent unnecessary re-renders
- Images are configured as unoptimized (can be changed in `next.config.mjs`)

## Troubleshooting

### CORS Issues
If you encounter CORS errors with the Google Apps Script API:
1. Ensure the script is deployed as a web app
2. Set access to "Anyone" in deployment settings
3. Verify the URL includes `/exec` at the end

### Build Errors
TypeScript build errors are currently ignored (`ignoreBuildErrors: true`). To enable strict type checking, update `next.config.mjs`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ECharts](https://echarts.apache.org/)
- [Vercel](https://vercel.com/) for hosting capabilities

## Support

For issues and questions, please open an issue in the repository.
