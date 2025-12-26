"use client";

import { useState, useEffect } from "react";
import { HabitListShell } from "@/components/HabitListShell";
import { HabitTrackerShell } from "@/components/HabitTrackerShell";

export default function Home() {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#habit-")) {
        const habitId = hash.replace("#habit-", "");
        setSelectedHabitId(habitId);
      } else {
        setSelectedHabitId(null);
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (selectedHabitId) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <HabitTrackerShell habitId={selectedHabitId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HabitListShell />
    </div>
  );
}
