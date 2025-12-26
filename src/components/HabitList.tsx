"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCompletionStats, formatDate, playCompletionSound } from "@/lib/utils";
import { deleteHabit, updateHabitEntry } from "@/lib/storage";
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
      const wasCompleted = habit?.entries[today] === 100;
      updateHabitEntry(habitId, today, 100);
      // Track if this is a new completion (wasn't 100% before)
      if (!wasCompleted) {
        hasNewCompletions = true;
      }
    });
    
    // Mark deselected habits that were previously completed as 0%
    habits.forEach((habit) => {
      const wasCompleted = habit.entries[today] === 100;
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
          My Habits
        </h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-100"
        >
          + New Habit
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const stats = getCompletionStats(habit);
          return (
            <div
              key={habit.id}
              className="group relative rounded-lg bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-[2px] shadow-sm transition-all hover:shadow-[0_10px_30px_-5px_rgba(59,130,246,0.3),0_10px_30px_-5px_rgba(147,51,234,0.3)] active:shadow-[0_10px_30px_-5px_rgba(59,130,246,0.3),0_10px_30px_-5px_rgba(147,51,234,0.3)] dark:from-blue-800/50 dark:via-purple-800/50 dark:to-pink-800/50 dark:hover:shadow-[0_10px_30px_-5px_rgba(59,130,246,0.2),0_10px_30px_-5px_rgba(147,51,234,0.2)] dark:active:shadow-[0_10px_30px_-5px_rgba(59,130,246,0.2),0_10px_30px_-5px_rgba(147,51,234,0.2)]"
            >
              <div className="relative h-full rounded-lg bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 p-6 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-700/60 dark:to-gray-700/90">
                <button
                  onClick={() => router.push(`/habit/${habit.id}`)}
                  className="w-full text-left focus:outline-none"
                >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="h-5 w-5 rounded-full transition-transform group-hover:scale-110"
                    style={{ backgroundColor: habit.color }}
                  />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                    {habit.name}
                  </h2>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium">{stats.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partial:</span>
                    <span className="font-medium">{stats.partial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Days:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(habit);
                  }}
                  className="absolute right-2 top-2 rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:hover:bg-red-900/20"
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
            setDeleteTarget(null);
            onHabitCreated();
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
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 active:scale-95"
          aria-label="Mark habits complete"
        >
          <svg
            className="h-6 w-6"
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

