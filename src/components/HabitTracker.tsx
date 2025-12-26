"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDaysInMonth, formatDate } from "@/lib/utils";
import { updateHabitEntry, getHabitById, deleteHabit } from "@/lib/storage";
import type { Habit } from "@/types/habit";
import { DayCell } from "./DayCell";
import { CompletionSlider } from "./CompletionSlider";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Confetti } from "./Confetti";

interface HabitTrackerProps {
  habit: Habit;
}

export function HabitTracker({ habit: initialHabit }: HabitTrackerProps) {
  const router = useRouter();
  const [habit, setHabit] = useState<Habit>(initialHabit);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get habit creation date
  const habitCreatedDate = new Date(habit.createdAt);
  const habitCreatedMonth = habitCreatedDate.getMonth();
  const habitCreatedYear = habitCreatedDate.getFullYear();

  // Current viewing month/year (default to current month)
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Sync habit state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedHabit = getHabitById(habit.id);
      if (updatedHabit) {
        setHabit(updatedHabit);
      }
    };

    // Listen to native storage events (from other tabs)
    window.addEventListener("storage", handleStorageChange);
    // Listen to custom events (from same tab)
    window.addEventListener("habitsUpdated", handleStorageChange);

    // Also sync when component mounts
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("habitsUpdated", handleStorageChange);
    };
  }, [habit.id]);

  // Sync when initial habit prop changes
  useEffect(() => {
    setHabit(initialHabit);
  }, [initialHabit]);

  const currentMonthDays = getDaysInMonth(viewYear, viewMonth);

  // Check if we can navigate to previous month
  const canGoPrevious =
    viewYear > habitCreatedYear ||
    (viewYear === habitCreatedYear && viewMonth > habitCreatedMonth);

  // Check if we can navigate to next month (not future)
  const canGoNext =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  const handlePreviousMonth = () => {
    if (!canGoPrevious) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSave = (
    date: Date,
    percentage: number,
    wasNewCompletion: boolean,
  ) => {
    const dateStr = formatDate(date);
    updateHabitEntry(habit.id, dateStr, percentage);
    // Update local state immediately
    const updatedHabit = getHabitById(habit.id);
    if (updatedHabit) {
      setHabit(updatedHabit);
    }
    setSelectedDate(null);

    // Show confetti if it's a new completion
    if (wasNewCompletion) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    // Trigger re-render in other components (custom event for same-tab updates)
    window.dispatchEvent(new Event("habitsUpdated"));
  };

  const getDayOfWeek = (date: Date): number => {
    return date.getDay();
  };

  const getPercentageForDate = (date: Date): number => {
    const dateStr = formatDate(date);
    return habit.entries[dateStr] ?? 0;
  };

  const isToday = (date: Date): boolean => {
    return formatDate(date) === formatDate(today);
  };

  const isFuture = (date: Date): boolean => {
    return date > today;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderCalendar = (days: Date[], year: number, month: number) => {
    const firstDay = days[0]!;
    const firstDayOfWeek = getDayOfWeek(firstDay);
    const calendarDays: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }

    // Add all days of the month
    days.forEach((day) => calendarDays.push(day));

    return (
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          if (date === null) {
            return <div key={`empty-${index}`} />;
          }
          const percentage = getPercentageForDate(date);
          return (
            <DayCell
              key={formatDate(date)}
              date={date}
              percentage={percentage}
              habitColor={habit.color}
              isToday={isToday(date)}
              isFuture={isFuture(date)}
              onClick={() => handleDayClick(date)}
            />
          );
        })}
      </div>
    );
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    window.dispatchEvent(new Event("habitsUpdated"));
    setShowDeleteConfirm(false);
    window.location.hash = "";
    router.push("/");
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {habit.name}
          </h1>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:hover:bg-red-900/20"
          aria-label={`Delete ${habit.name}`}
        >
          Delete
        </button>
      </div>

      {/* Month Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handlePreviousMonth}
          disabled={!canGoPrevious}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            canGoPrevious
              ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              : "cursor-not-allowed text-gray-400 opacity-50 dark:text-gray-600"
          }`}
          aria-label="Previous month"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            canGoNext
              ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              : "cursor-not-allowed text-gray-400 opacity-50 dark:text-gray-600"
          }`}
          aria-label="Next month"
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar */}
      <div>
        <div className="mb-2 grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>
        {renderCalendar(currentMonthDays, viewYear, viewMonth)}
      </div>

      {selectedDate && (
        <CompletionSlider
          date={selectedDate}
          initialPercentage={getPercentageForDate(selectedDate)}
          habitColor={habit.color}
          onSave={(percentage, wasNewCompletion) =>
            handleSave(selectedDate, percentage, wasNewCompletion)
          }
          onClose={() => setSelectedDate(null)}
        />
      )}

      {showConfetti && <Confetti color={habit.color} />}

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        habitName={habit.name}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
