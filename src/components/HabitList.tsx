"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatDate,
  playCompletionSound,
  playClickSound,
  getCurrentMonthCalendarView,
  getColorWithOpacity,
} from "@/lib/utils";
import { deleteHabit, updateHabitEntry, getEntryPercentage } from "@/lib/storage";
import type { Habit } from "@/types/habit";
import { CreateHabitDialog } from "./CreateHabitDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { BulkMarkDialog } from "./BulkMarkDialog";
import { Confetti } from "./Confetti";

interface HabitListProps {
  habits: Habit[];
  onHabitCreated: () => void;
}

export function HabitList({ habits, onHabitCreated }: HabitListProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [isBulkMarkDialogOpen, setIsBulkMarkDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleBulkMark = (selectedHabitIds: string[]) => {
    const today = formatDate(new Date());
    const selectedSet = new Set(selectedHabitIds);
    let hasNewCompletions = false;

    // Mark selected habits as 100%
    selectedHabitIds.forEach((habitId) => {
      const habit = habits.find((h) => h.id === habitId);
      const wasCompleted = getEntryPercentage(habit?.entries[today]) === 100;
      updateHabitEntry(habitId, today, 100);
      // Track if this is a new completion (wasn't 100% before)
      if (!wasCompleted) {
        hasNewCompletions = true;
      }
    });

    // Mark deselected habits that were previously completed as 0%
    habits.forEach((habit) => {
      const wasCompleted = getEntryPercentage(habit.entries[today]) === 100;
      const isSelected = selectedSet.has(habit.id);

      // If habit was completed but is now deselected, mark as 0%
      if (wasCompleted && !isSelected) {
        updateHabitEntry(habit.id, today, 0);
      }
    });

    // Trigger confetti and sound if at least one new habit was marked as complete
    if (hasNewCompletions) {
      setShowConfetti(true);
      playCompletionSound();
      setTimeout(() => setShowConfetti(false), 2000);
    }

    // Update UI
    window.dispatchEvent(new Event("habitsUpdated"));
    setIsBulkMarkDialogOpen(false);
    onHabitCreated();
  };

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          My Habits
        </h1>
        <button
          onClick={() => {
            playClickSound();
            setIsDialogOpen(true);
          }}
          className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 dark:focus:ring-offset-gray-800"
        >
          + New Habit
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit, index) => {
          const calendar = getCurrentMonthCalendarView(habit);
          
          return (
            <div
              key={habit.id}
              className="group relative rounded-2xl bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-pink-50/60 p-[2px] shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.25),0_20px_40px_-10px_rgba(147,51,234,0.25)] active:scale-[0.98] dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 dark:hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15),0_20px_40px_-10px_rgba(147,51,234,0.15)] animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative h-full rounded-2xl bg-gradient-to-br from-white via-blue-50/5 to-purple-50/5 p-7 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-750/20 dark:to-gray-700/40">
                <button
                  onClick={() => {
                    playClickSound();
                    window.location.hash = `habit-${habit.id}`;
                  }}
                  className="w-full text-left focus:outline-none"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="h-6 w-6 rounded-full shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:shadow-md"
                      style={{ backgroundColor: habit.color }}
                    />
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                      {habit.name}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {/* Calendar grid */}
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

                        const entry = habit.entries[dateStr];
                        const percentage = getEntryPercentage(entry);
                        const isCompleted = percentage === 100;
                        const isPartial = percentage > 0 && percentage < 100;
                        const isIncomplete = percentage === 0 || !entry;

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
                                backgroundColor: habit.color,
                              }}
                              title={`${dateStr}: ${percentage}%`}
                            />
                          );
                        }

                        if (isPartial) {
                          // Create tilted grid pattern with partial opacity
                          const partialColor = getColorWithOpacity(habit.color, 0.65);
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

                        return (
                          <div
                            key={dateStr}
                            className="h-3.5 w-3.5 rounded-full bg-gray-200 dark:bg-gray-600 transition-all duration-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                            title={`${dateStr}: ${percentage}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(habit);
                  }}
                  className="absolute right-3 top-3 rounded-xl p-2 text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:hover:bg-red-900/20 active:scale-95"
                  aria-label={`Delete ${habit.name}`}
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CreateHabitDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onHabitCreated={onHabitCreated}
      />

      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        habitName={deleteTarget?.name ?? ""}
        onConfirm={() => {
          if (deleteTarget) {
            deleteHabit(deleteTarget.id);
            window.dispatchEvent(new Event("habitsUpdated"));
            onHabitCreated();
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <BulkMarkDialog
        isOpen={isBulkMarkDialogOpen}
        habits={habits}
        onConfirm={handleBulkMark}
        onCancel={() => setIsBulkMarkDialogOpen(false)}
      />

      {showConfetti && <Confetti />}

      {/* Floating Action Button */}
      {habits.length > 0 && (
        <button
          onClick={() => setIsBulkMarkDialogOpen(true)}
          className="fixed bottom-20 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:scale-95"
          aria-label="Mark habits complete"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
