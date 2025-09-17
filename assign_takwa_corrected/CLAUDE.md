# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite electoral dashboard application for Cameroon elections, featuring:
- Interactive map visualization using Highcharts
- Real-time polling station data management
- Electoral results validation and tracking
- French language interface for the Cameroon election system

## Key Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production (runs TypeScript check + Vite build)
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Dependencies
- Install packages: `npm install`
- Core dependencies: React 19, TypeScript, Vite, Tailwind CSS, Highcharts, TanStack Query

## Architecture

### Frontend Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with ES modules
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite plugin
- **State Management**: TanStack Query (React Query) for server state
- **Charts/Maps**: Highcharts with react-official wrapper for Cameroon map visualization

### Key Components Structure
- `App.tsx` - Main application with navigation and routing logic
- `components/CameroonMapView.tsx` - Interactive map component using Highcharts
- `api/electionApi.ts` - API layer with endpoints for backend communication
- `data/cameroonElectionData.ts` - Static data and type definitions

### API Integration
Backend API at `http://api.voteflow.cm/api` with endpoints:
- `/stats` - National statistics
- `/regions` - Regional data
- `/results/national` - National results by party
- `/polling-stations/recent` - Recent polling stations
- `/election/resultats` - Polling station results with validation status

### Map Functionality
- **Regions View**: 10 administrative regions with TopoJSON from Highcharts
- **Departments View**: 58 departments with local GeoJSON (`/public/geojson-departement-CMR.json`)
- **Base Maps**: Optional TiledWebMap integration (satellite, terrain, streets)
- **View Modes**: Results, turnout, participation, party-specific votes

### Data Management
- **TanStack Query** for API caching and synchronization
- **Mutations** for validation operations and result updates
- **Real-time updates** with query invalidation patterns

## Important Development Notes

### Map Dependencies
The map component dynamically imports Highcharts modules:
- Requires `highcharts` and `highcharts-react-official`
- Falls back to grid view if dependencies unavailable
- Includes debug logging for troubleshooting

### Region ID Mapping
Critical mapping between database IDs and Highcharts keys in `CameroonMapView.tsx`:
```typescript
const regionIdToHcKey = {
  '1': 'cm-ad', // Adamaoua
  '2': 'cm-ce', // Centre
  // ... etc
}
```

### Polling Station Validation
Multi-step validation process:
1. Select results (single or batch)
2. Validate through API
3. Update UI with React Query invalidation
4. Handle validation status changes

### French Localization
All UI text and API responses in French - maintain French naming conventions for new features.

### Error Handling
Comprehensive error handling with:
- API response error messages
- Loading states for all async operations
- Fallback UI for missing dependencies
- Debug information panels for troubleshooting

## Development Patterns

### React Query Usage
- Use `useQuery` for data fetching with proper keys
- Use `useMutation` for updates with optimistic updates
- Always invalidate related queries after mutations
- Handle loading and error states consistently

### Map Component Patterns
- Memoize chart options and data to prevent re-renders
- Use callbacks for event handlers to maintain performance
- Include debug logging for map functionality
- Provide fallback UI when Highcharts unavailable

### Styling Approach
- Tailwind utility classes with custom components
- Gradient backgrounds and modern UI patterns
- Responsive design with mobile-first approach
- FontAwesome icons throughout interface

## File Organization

```
src/
├── App.tsx                     # Main app component
├── components/
│   └── CameroonMapView.tsx     # Map visualization
├── api/
│   └── electionApi.ts          # Backend API calls
├── data/
│   └── cameroonElectionData.ts # Static data/types
└── main.tsx                    # App entry point

public/
└── geojson-departement-CMR.json # Department boundaries
```0