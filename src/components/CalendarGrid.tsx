import { getColorWithOpacity } from "@/lib/utils";
import { getEntryPercentage } from "@/lib/storage";
import type { HabitEntry } from "@/types/habit";

interface CalendarGridProps {
  calendar: (string | null)[];
  entries: Record<string, HabitEntry | number>;
  color: string;
}

export function CalendarGrid({ calendar, entries, color }: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {calendar.map((dateStr, index) => {
        if (dateStr === null) {
          return (
            <div
              key={`empty-${index}`}
              className="h-3.5 w-3.5"
            />
          );
        }

        const entry = entries[dateStr];
        const percentage = getEntryPercentage(entry);
        const isCompleted = percentage === 100;
        const isPartial = percentage > 0 && percentage < 100;
        const isIncomplete = percentage === 0;

        if (isCompleted) {
          // Create tilted grid pattern using linear gradients
          const gridPattern = `repeating-linear-gradient(15deg, transparent, transparent 1px, rgba(255,255,255,0.2) 1px, rgba(255,255,255,0.2) 1.5px),
            repeating-linear-gradient(105deg, transparent, transparent 1px, rgba(255,255,255,0.2) 1px, rgba(255,255,255,0.2) 1.5px)`;
          return (
            <div
              key={dateStr}
              className="h-3.5 w-3.5 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundImage: gridPattern,
                backgroundColor: color,
              }}
              title={`${dateStr}: ${percentage}%`}
            />
          );
        }

        if (isPartial) {
          // Create tilted grid pattern with partial opacity
          const partialColor = getColorWithOpacity(color, 0.65);
          const gridPattern = `repeating-linear-gradient(15deg, transparent, transparent 1px, rgba(255,255,255,0.25) 1px, rgba(255,255,255,0.25) 1.5px),
            repeating-linear-gradient(105deg, transparent, transparent 1px, rgba(255,255,255,0.25) 1px, rgba(255,255,255,0.25) 1.5px)`;
          return (
            <div
              key={dateStr}
              className="h-3.5 w-3.5 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundImage: gridPattern,
                backgroundColor: partialColor,
              }}
              title={`${dateStr}: ${percentage}%`}
            />
          );
        }

        if (isIncomplete) {
          // show a small cross icon in the center of the cell
          return (
            <div
              key={dateStr}
              className="flex items-center justify-center h-3.5 w-3.5 rounded-full bg-gray-200 dark:bg-gray-600 transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              <svg
                className="h-2 w-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="red"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          );
        }

        return (
          <div
            key={dateStr}
            className="h-3.5 w-3.5 rounded-full bg-gray-200 dark:bg-gray-600 transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-500"
            title={`${dateStr}: ${percentage}%`}
          />
        );
      })}
    </div>
  );
}
