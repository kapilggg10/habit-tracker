"use client";

import { useState } from "react";
import { CreateHabitDialog } from "./CreateHabitDialog";

export function CreateHabitButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-100"
      >
        Create Your First Habit
      </button>
      <CreateHabitDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

