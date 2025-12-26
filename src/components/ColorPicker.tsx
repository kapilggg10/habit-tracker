"use client";

import { PRESET_COLORS } from "@/lib/colors";
import type { ColorOption } from "@/types/habit";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="w-full">
      <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Choose a color
      </label>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
        {PRESET_COLORS.map((color: ColorOption) => {
          const isSelected = selectedColor === color.hex;
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onColorChange(color.hex)}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSelected
                  ? "ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100"
                  : ""
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select ${color.name} color`}
            >
              {isSelected && (
                <svg
                  className="h-6 w-6 text-white drop-shadow-lg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

