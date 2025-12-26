"use client";

import { nanoid } from "nanoid";
import type { Habit } from "@/types/habit";
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

export function createHabit(name: string, color: string = DEFAULT_COLOR): Habit {
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

export function updateHabitEntry(
  habitId: string,
  date: string,
  percentage: number,
): void {
  const habits = getHabits();
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    throw new Error(`Habit with id ${habitId} not found`);
  }

  habit.entries[date] = Math.max(0, Math.min(100, percentage));
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
    habit.entries[date] = Math.max(0, Math.min(100, percentage));
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

