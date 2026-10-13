"use client";

import { nanoid } from "nanoid";
import type { Reminder, ReminderSchedule } from "@/types/reminder";

const STORAGE_KEY = "reminders";
export const REMINDERS_UPDATED_EVENT = "remindersUpdated";

export function getReminders(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Reminder[]) : [];
  } catch (error) {
    console.error("Error reading reminders from localStorage:", error);
    return [];
  }
}

function saveReminders(reminders: Reminder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  window.dispatchEvent(new Event(REMINDERS_UPDATED_EVENT));
}

export function getRemindersForHabit(habitId: string): Reminder[] {
  return getReminders().filter((r) => r.habitId === habitId);
}

export function createReminder(
  habitId: string,
  schedule: ReminderSchedule,
  skipIfDone: boolean,
): Reminder {
  const reminder: Reminder = {
    id: nanoid(),
    habitId,
    schedule,
    skipIfDone,
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  saveReminders([...getReminders(), reminder]);
  return reminder;
}

export function updateReminder(
  id: string,
  changes: Partial<Omit<Reminder, "id" | "habitId" | "createdAt">>,
): void {
  saveReminders(
    getReminders().map((r) => (r.id === id ? { ...r, ...changes } : r)),
  );
}

export function deleteReminder(id: string): void {
  saveReminders(getReminders().filter((r) => r.id !== id));
}

export function deleteRemindersForHabit(habitId: string): void {
  const all = getReminders();
  const remaining = all.filter((r) => r.habitId !== habitId);
  if (remaining.length !== all.length) saveReminders(remaining);
}
