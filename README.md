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

## Habit Reminders (Push Notifications)

Each habit can have one or more reminders. Open a habit and tap the **bell** icon next to *Delete*.

- **Schedules**: daily at a time, on chosen weekdays, or a one-off date and time
- **Skip if done**: don't send the reminder if the habit is already at 100% that day
- **Pause/resume** or delete reminders at any time
- When a reminder fires you get a **system notification**. On Android and desktop it has *Mark done* and *Open* actions. If the app is open, an **in-app popup** with the same actions also appears.
- When you add a reminder, a confirmation notification is sent right away so you can check that delivery works.

### How it works

```
Browser / PWA                                  Netlify
─────────────                                  ───────
ReminderDialog ──▶ localStorage ("reminders")
NotificationManager ──POST push-sync──▶  push-sync fn ──▶ Netlify Blobs (push-devices)
                                                                ▲
public/sw.js  ◀── Web Push (VAPID) ── send-reminders fn (scheduled, every minute)
  ├─ showNotification()
  └─ postMessage → in-app popup
```

- There are no user accounts. Each install gets a random `deviceId`, and the backend stores that device's push subscription, timezone, reminders and recent completion dates.
- `src/lib/reminder-schedule.ts` holds the scheduling logic and is shared by the UI and the scheduled function. Due times are evaluated in the device's timezone, with a 10-minute grace window and per-occurrence de-duplication.
- Subscriptions that the push service reports as expired (404/410) are removed automatically.

### Setup (one-time)

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. In Netlify → *Site configuration → Environment variables*, add:
   | Variable | Value |
   |---|---|
   | `VAPID_PUBLIC_KEY` | public key from step 1 |
   | `VAPID_PRIVATE_KEY` | private key from step 1 |
   | `VAPID_SUBJECT` | `mailto:you@example.com` |
3. Redeploy. Netlify Blobs needs no extra setup. Scheduled functions only run on the **published** production deploy.

### Platform notes

- **iPhone / iPad (iOS 16.4+)**: Web Push only works for the installed PWA. Tap *Share → Add to Home Screen*, open the app from the Home Screen, then add a reminder. Notification action buttons aren't supported on iOS, so tapping the notification opens the habit.
- **Android / desktop Chrome, Edge, Firefox**: works in the browser and in the installed PWA.
- **Local testing**: the service worker is disabled under `next dev`. Use `npm run build` and then `npx netlify dev` (with the env vars in a local `.env`) to exercise the full flow.
- "Skip if done" uses the completion data last synced from the device. If you mark a habit done while offline, you may still get that day's reminder.

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
