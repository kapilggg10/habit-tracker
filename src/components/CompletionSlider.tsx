"use client";

import { useState } from "react";
import { getColorWithOpacity, playCompletionSound } from "@/lib/utils";

interface CompletionSliderProps {
  date: Date;
  initialPercentage: number;
  initialDescription?: string;
  habitColor: string;
  onSave: (percentage: number, wasNewCompletion: boolean, description?: string) => void;
  onClose: () => void;
}

export function CompletionSlider({
  date,
  initialPercentage,
  initialDescription,
  habitColor,
  onSave,
  onClose,
}: CompletionSliderProps) {
  const [percentage, setPercentage] = useState(initialPercentage);
  const [description, setDescription] = useState(initialDescription || "");

  const handleSave = () => {
    // Check if this is a new completion (wasn't 100% before, now is 100%)
    const isNewCompletion = percentage === 100 && initialPercentage !== 100;

    if (isNewCompletion) {
      // Play sound
      playCompletionSound();
    }

    // Save the data and pass completion status
    // Only pass description if percentage < 100 (not completed)
    const descriptionToSave = percentage < 100 ? description : undefined;
    onSave(percentage, isNewCompletion, descriptionToSave);
    onClose();
  };

  const handleQuickSelect = (value: number) => {
    setPercentage(value);
  };

  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in-backdrop"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-slide-up-scale dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4">
            <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              {dateStr}
            </h2>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Mark your completion
            </p>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center gap-4">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Completion
              </span>
              {/* Percentage as preview - parallel to Completion */}
              <div
                className={`ml-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                  percentage === 0
                    ? "bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                    : percentage === 100
                      ? "border-2 shadow-md"
                      : "border-2 border-gray-200 dark:border-gray-700"
                }`}
                style={{
                  backgroundColor:
                    percentage === 0
                      ? undefined
                      : percentage === 100
                        ? habitColor
                        : getColorWithOpacity(habitColor, percentage / 100),
                  borderColor: percentage === 100 ? habitColor : undefined,
                  backgroundImage:
                    percentage > 0
                      ? percentage === 100
                        ? `repeating-linear-gradient(15deg, transparent, transparent 1px, rgba(255,255,255,0.25) 1px, rgba(255,255,255,0.25) 1.5px),
                          repeating-linear-gradient(105deg, transparent, transparent 1px, rgba(255,255,255,0.25) 1px, rgba(255,255,255,0.25) 1.5px)`
                        : `repeating-linear-gradient(15deg, transparent, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 1.5px),
                          repeating-linear-gradient(105deg, transparent, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 1.5px)`
                      : undefined,
                }}
              >
                <span
                  className={`text-sm font-bold ${
                    percentage === 100
                      ? "text-white"
                      : percentage > 0
                        ? "text-gray-900 dark:text-gray-50"
                        : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {percentage}%
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              style={{
                background: `linear-gradient(to right, ${habitColor} 0%, ${habitColor} ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`,
              }}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect(0)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                percentage === 0
                  ? "border-gray-900 bg-gray-900 text-white shadow-sm dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Not Done
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(50)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                percentage === 50
                  ? "border-gray-900 bg-gray-900 text-white shadow-sm dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(100)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                percentage === 100
                  ? "border-gray-900 bg-gray-900 text-white shadow-sm dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Complete
            </button>
          </div>

          {/* Description field - always rendered to maintain modal height */}
          <div className={`mb-4 ${percentage < 100 ? "" : "pointer-events-none"}`}>
            <label className={`mb-1.5 block text-xs font-medium ${percentage < 100 ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}`}>
              Why wasn't this completed? <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Was busy with work, felt unwell..."
              rows={2}
              readOnly={percentage >= 100}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:scale-105 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:scale-95 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
