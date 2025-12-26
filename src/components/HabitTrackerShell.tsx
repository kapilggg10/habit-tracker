"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getHabitById } from "@/lib/storage";
import type { Habit } from "@/types/habit";
import { HabitTracker } from "./HabitTracker";

interface HabitTrackerShellProps {
  habitId: string;
}

export function HabitTrackerShell({ habitId }: HabitTrackerShellProps) {
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHabit = () => {
      const loadedHabit = getHabitById(habitId);
      if (!loadedHabit) {
        router.push("/");
        return;
      }
      setHabit(loadedHabit);
      setIsLoading(false);
    };

    loadHabit();

    const handleStorageChange = () => {
      loadHabit();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("habitsUpdated", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("habitsUpdated", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [habitId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!habit) {
    return null;
  }

  return (
    <div className="w-full">
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
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
        Back to Habits
      </button>
      <HabitTracker habit={habit} />
    </div>
  );
}

