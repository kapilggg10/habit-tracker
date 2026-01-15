"use client";

import { useState, useEffect } from "react";
import { getHabits } from "@/lib/storage";
import { HabitList } from "./HabitList";
import { EmptyState } from "./EmptyState";

import type { Habit } from "@/types/habit";

export function HabitListShell() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isHabitLoaded, setIsHabitLoaded] = useState(false);

  const loadHabits = () => {
    const loadedHabits = getHabits();
    setHabits(loadedHabits);
    setIsHabitLoaded(true);
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

  if (!isHabitLoaded) {
    return null;
  }

  if (habits.length === 0) {
    return (
      <div className="flex-1">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <HabitList habits={habits} onHabitCreated={loadHabits} />
        </div>
      </div>
    </div>
  );
}
