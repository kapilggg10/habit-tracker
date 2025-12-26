"use client";

import { formatDate, getColorWithOpacity } from "@/lib/utils";

interface DayCellProps {
  date: Date;
  percentage: number;
  habitColor: string;
  isToday: boolean;
  isFuture: boolean;
  onClick: () => void;
}

export function DayCell({
  date,
  percentage,
  habitColor,
  isToday,
  isFuture,
  onClick,
}: DayCellProps) {
  const dayNumber = date.getDate();
  const isCompleted = percentage === 100;
  const isPartial = percentage > 0 && percentage < 100;

  let bgColor = "";
  let borderColor = "border";
  let textColor = "text-gray-600 dark:text-gray-400";

  if (isCompleted) {
    bgColor = "";
    borderColor = "border-2";
    textColor = "text-white font-semibold";
  } else if (isPartial) {
    bgColor = "";
    borderColor = "border-2 border-gray-200 dark:border-gray-700";
    textColor = "text-gray-900 dark:text-gray-50 font-medium";
  } else {
    // Non-completed: use gradient grey
    bgColor =
      "bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-700/80 dark:to-gray-800";
  }

  const cellStyle: React.CSSProperties = {};

  if (isCompleted) {
    cellStyle.backgroundColor = habitColor;
    cellStyle.borderColor = habitColor;
  } else if (isPartial) {
    cellStyle.backgroundColor = getColorWithOpacity(
      habitColor,
      percentage / 100,
    );
  }

  if (isToday) {
    return (
      <div className="mx-auto flex h-10 w-10 max-[300px]:h-8 max-[300px]:w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-[2px]">
        <button
          onClick={onClick}
          disabled={isFuture}
          className={`
            relative flex h-full w-full items-center justify-center rounded-full border transition-all
            ${bgColor}
            ${borderColor}
            ${textColor}
            ${isFuture ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105 active:scale-95"}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
          `}
          style={cellStyle}
          aria-label={`${formatDate(date)} - ${isCompleted ? "Completed" : isPartial ? `${percentage}% completed` : "Not completed"}`}
        >
          <span className="text-sm max-[300px]:text-xs">{dayNumber}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isFuture}
      className={`
        relative mx-auto flex h-10 w-10 max-[300px]:h-8 max-[300px]:w-8 items-center justify-center rounded-full border transition-all
        ${bgColor}
        ${borderColor}
        ${textColor}
        ${isFuture ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105 active:scale-95"}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100
      `}
      style={cellStyle}
      aria-label={`${formatDate(date)} - ${isCompleted ? "Completed" : isPartial ? `${percentage}% completed` : "Not completed"}`}
    >
      <span className="text-sm max-[300px]:text-xs">{dayNumber}</span>
    </button>
  );
}
