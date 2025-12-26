# Habit Tracker

A modern, responsive web application for tracking daily habits with flexible completion levels. Built with Next.js, React, and TypeScript.

## What This App Is For

Habit Tracker helps you build and maintain consistent daily routines by allowing you to:

- **Create Custom Habits**: Add any habit you want to track with personalized names and colors
- **Track Completion Levels**: Mark habits as partially or fully complete (0-100% completion)
- **Visual Progress Tracking**: View your habits in an intuitive calendar grid showing completion history
- **Build Consistency**: Monitor streaks and completion patterns over time
- **Flexible Goal Setting**: Not all habits need 100% completion - track partial progress

Whether you're building exercise routines, learning new skills, reading daily, or maintaining any other habit, this app provides the flexibility to track your journey with granular control over your progress.

## Architecture & Working

### Tech Stack
- **Frontend Framework**: Next.js 16 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with custom design system
- **Code Quality**: Biome for linting and formatting
- **State Management**: React hooks with localStorage persistence
- **PWA Features**: Service worker and web app manifest for mobile installation

### Core Architecture

The application follows a **component-based architecture** with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx          # Home page
│   └── habit/[id]/       # Dynamic habit detail pages
├── components/            # Reusable UI components
│   ├── HabitTracker.tsx   # Main habit tracking interface
│   ├── HabitList.tsx      # Habit overview and management
│   ├── DayCell.tsx        # Individual calendar day component
│   ├── CompletionSlider.tsx # Percentage completion input
│   └── ...               # Other specialized components
├── lib/                   # Utility functions and business logic
│   ├── storage.ts         # localStorage data persistence
│   ├── utils.ts           # Date utilities and calculations
│   └── colors.ts          # Color theme definitions
└── types/                 # TypeScript type definitions
    └── habit.ts           # Habit data structure types
```

### Data Flow & State Management

**Data Persistence**:
- All data is stored locally in the browser using `localStorage`
- No backend required - works completely offline
- Data is automatically synced across browser tabs via storage events

**State Management**:
- Component-level state using React hooks (`useState`, `useEffect`)
- Custom events (`habitsUpdated`) for cross-component communication
- Real-time updates when data changes in other tabs

**Data Structure**:
```typescript
interface Habit {
  id: string;              // Unique identifier
  name: string;            // Habit display name
  color: string;           // Hex color for visual distinction
  createdAt: string;       // ISO timestamp
  entries: Record<string, number>; // Date -> Completion % (0-100)
}
```

### Key Features & Components

**Habit Creation & Management**:
- Create habits with custom names and colors
- Delete habits with confirmation dialogs
- Color-coded visual organization

**Calendar-Based Tracking**:
- Monthly calendar view with navigation
- Click any day to set completion percentage
- Visual completion indicators (empty, partial, full)
- Historical data viewing from habit creation date

**Completion Tracking**:
- 0-100% completion scale for flexibility
- Slider interface for precise percentage input
- Bulk marking for multiple habits on the same day
- Real-time statistics calculation

**Progressive Web App**:
- Installable on mobile devices
- Works offline
- Responsive design for all screen sizes
- Dark mode support

### Component Interaction Flow

1. **HabitListShell** loads and manages the overall habit list state
2. **HabitList** displays habit cards with quick actions and navigation
3. **HabitTracker** provides detailed calendar view for individual habits
4. **DayCell** handles individual day interactions and completion marking
5. **CompletionSlider** allows precise percentage input
6. **Storage utilities** handle all data persistence and retrieval

### Performance & UX Considerations

- **Lazy Loading**: Components load data only when needed
- **Optimistic Updates**: UI updates immediately, then syncs with storage
- **Event-Driven Updates**: Real-time sync across browser tabs
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Accessibility**: Keyboard navigation and screen reader support
- **Progressive Enhancement**: Core functionality works without JavaScript

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Deployment

The app can be deployed to any platform supporting Next.js:

### Vercel (Recommended)
```bash
npm run build
```
Then connect your repository to Vercel for automatic deployments.

### Other Platforms
The app works on any static hosting platform. Build with `npm run build` and serve the `out` directory.

## Browser Support

- Modern browsers with ES2020 support
- Progressive Web App features in Chromium-based browsers
- Offline functionality in all modern browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Format code: `npm run format`
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
