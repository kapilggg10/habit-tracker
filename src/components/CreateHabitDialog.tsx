"use client";

import { useState, useEffect } from "react";
import { createHabit } from "@/lib/storage";
import { DEFAULT_COLOR } from "@/lib/colors";
import { ColorPicker } from "./ColorPicker";

interface CreateHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitCreated?: () => void;
}

export function CreateHabitDialog({
  isOpen,
  onClose,
  onHabitCreated,
}: CreateHabitDialogProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSelectedColor(DEFAULT_COLOR);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createHabit(name.trim(), selectedColor);
      // Trigger update event for other components
      window.dispatchEvent(new Event("habitsUpdated"));
      onHabitCreated?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-slide-up-scale dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Create New Habit
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="habit-name"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Habit Name
            </label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Exercise, Read, Meditate"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 dark:focus:border-gray-400 dark:focus:ring-gray-400"
              autoFocus
              required
            />
          </div>
          <div className="mb-6">
            <ColorPicker
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
