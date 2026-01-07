"use client";

import { nanoid } from "nanoid";
import type { Habit, HabitEntry } from "@/types/habit";
import { DEFAULT_COLOR } from "./colors";

const STORAGE_KEY = "habits";

export function getHabits(): Habit[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as Habit[];
  } catch (error) {
    console.error("Error reading habits from localStorage:", error);
    return [];
  }
}

export function createHabit(
  name: string,
  color: string = DEFAULT_COLOR,
): Habit {
  const habit: Habit = {
    id: nanoid(),
    name: name.trim(),
    color,
    createdAt: new Date().toISOString(),
    entries: {},
  };

  const habits = getHabits();
  habits.push(habit);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));

  return habit;
}

// Helper function to normalize entry (convert old number format to new object format)
function normalizeEntry(entry: HabitEntry | number | undefined): HabitEntry {
  if (entry === undefined) {
    return { percentage: -1 };
  }
  if (typeof entry === "number") {
    return { percentage: entry };
  }
  return entry;
}

// Helper function to get percentage from entry (handles both old and new formats)
export function getEntryPercentage(entry: HabitEntry | number | undefined): number {
  return normalizeEntry(entry).percentage;
}

// Helper function to get description from entry
export function getEntryDescription(entry: HabitEntry | number | undefined): string | undefined {
  const normalized = normalizeEntry(entry);
  return normalized.description;
}

export function updateHabitEntry(
  habitId: string,
  date: string,
  percentage: number,
  description?: string,
): void {
  const habits = getHabits();
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    throw new Error(`Habit with id ${habitId} not found`);
  }

  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Only save description if percentage < 100 (not completed)
  if (normalizedPercentage < 100 && description !== undefined) {
    habit.entries[date] = {
      percentage: normalizedPercentage,
      description: description.trim() || undefined,
    };
  } else {
    // For completed entries (100%), just store percentage
    habit.entries[date] = normalizedPercentage;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

export function deleteHabit(habitId: string): void {
  const habits = getHabits();
  const filtered = habits.filter((h) => h.id !== habitId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getHabitById(habitId: string): Habit | undefined {
  const habits = getHabits();
  return habits.find((h) => h.id === habitId);
}

export function bulkMarkHabitsForDate(
  date: string,
  percentage: number = 100,
): void {
  const habits = getHabits();
  habits.forEach((habit) => {
    const normalizedPercentage = Math.max(0, Math.min(100, percentage));
    // For bulk mark, we don't include descriptions (just mark as complete/partial)
    if (normalizedPercentage === 100) {
      habit.entries[date] = normalizedPercentage;
    } else {
      habit.entries[date] = { percentage: normalizedPercentage };
    }
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}
