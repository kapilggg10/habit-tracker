"use client";

import { useState } from "react";
import { CreateHabitDialog } from "./CreateHabitDialog";

export function CreateHabitButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
      >
        Create Your First Habit
      </button>
      <CreateHabitDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
