"use client";

import { useState, useEffect } from "react";
import { getHabits } from "@/lib/storage";
import type { Habit } from "@/types/habit";
import { HabitList } from "./HabitList";
import { EmptyState } from "./EmptyState";

export function HabitListShell() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHabits = () => {
    const loadedHabits = getHabits();
    setHabits(loadedHabits);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHabits();

    const handleStorageChange = () => {
      loadHabits();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("habitsUpdated", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("habitsUpdated", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (habits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HabitList habits={habits} onHabitCreated={loadHabits} />
    </div>
  );
}

