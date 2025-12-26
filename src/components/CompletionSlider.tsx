"use client";

import { useState } from "react";
import { getColorWithOpacity, playCompletionSound } from "@/lib/utils";

interface CompletionSliderProps {
  date: Date;
  initialPercentage: number;
  habitColor: string;
  onSave: (percentage: number, wasNewCompletion: boolean) => void;
  onClose: () => void;
}

export function CompletionSlider({
  date,
  initialPercentage,
  habitColor,
  onSave,
  onClose,
}: CompletionSliderProps) {
  const [percentage, setPercentage] = useState(initialPercentage);

  const handleSave = () => {
    // Check if this is a new completion (wasn't 100% before, now is 100%)
    const isNewCompletion = percentage === 100 && initialPercentage !== 100;

    if (isNewCompletion) {
      // Play sound
      playCompletionSound();
    }

    // Save the data and pass completion status
    onSave(percentage, isNewCompletion);
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-50">
            {dateStr}
          </h2>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Mark your completion for this day
          </p>

          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Completion
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                {percentage}%
              </span>
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
            <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect(0)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                percentage === 0
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Not Done
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(50)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                percentage === 50
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(100)}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                percentage === 100
                  ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Complete
            </button>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview
            </label>
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                percentage === 0
                  ? "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  : percentage === 100
                    ? "border-2"
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
              }}
            >
              <span
                className={`text-sm font-semibold ${
                  percentage === 100
                    ? "text-white"
                    : percentage > 0
                      ? "text-gray-900 dark:text-gray-50"
                      : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {date.getDate()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-100"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
