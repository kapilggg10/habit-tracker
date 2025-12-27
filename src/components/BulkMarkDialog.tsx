"use client";

import { useState, useEffect } from "react";
import type { Habit } from "@/types/habit";
import { formatDate } from "@/lib/utils";

interface BulkMarkDialogProps {
  isOpen: boolean;
  habits: Habit[];
  onConfirm: (selectedHabitIds: string[]) => void;
  onCancel: () => void;
}

export function BulkMarkDialog({
  isOpen,
  habits,
  onConfirm,
  onCancel,
}: BulkMarkDialogProps) {
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const today = formatDate(new Date());

  useEffect(() => {
    if (isOpen) {
      // Pre-select habits that are already completed for today
      const completedIds = new Set<string>();
      habits.forEach((habit) => {
        if (habit.entries[today] === 100) {
          completedIds.add(habit.id);
        }
      });
      setSelectedHabits(completedIds);
    }
  }, [isOpen, habits, today]);

  const toggleHabit = (habitId: string) => {
    setSelectedHabits((prev) => {
      const next = new Set(prev);
      if (next.has(habitId)) {
        next.delete(habitId);
      } else {
        next.add(habitId);
      }
      return next;
    });
  };

  const handleSave = () => {
    onConfirm(Array.from(selectedHabits));
  };

  const isCompleted = (habit: Habit): boolean => {
    return habit.entries[today] === 100;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in-backdrop"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-slide-up-scale dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Mark Habits Complete
        </h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Select habits to mark as completed for today
        </p>

        <div className="mb-8 max-h-96 space-y-3 overflow-y-auto">
          {habits.map((habit) => {
            const checked = selectedHabits.has(habit.id);
            const alreadyCompleted = isCompleted(habit);

            return (
              <label
                key={habit.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:scale-[1.02] ${
                  checked
                    ? "border-gray-900 bg-gray-50 shadow-sm dark:border-gray-100 dark:bg-gray-700/50"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleHabit(habit.id)}
                  className="h-5 w-5 cursor-pointer rounded border-2 border-gray-300 text-blue-600 transition-colors checked:border-blue-600 checked:bg-blue-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-gray-600 dark:text-blue-500 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                />
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="flex-1 font-medium text-gray-900 dark:text-gray-50">
                  {habit.name}
                </span>
                {alreadyCompleted && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Completed
                  </span>
                )}
              </label>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedHabits.size === 0}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            Save ({selectedHabits.size})
          </button>
        </div>
      </div>
    </div>
  );
}
