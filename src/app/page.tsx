"use client";

import { useState, useEffect } from "react";
import { HabitListShell } from "@/components/HabitListShell";
import { HabitTrackerShell } from "@/components/HabitTrackerShell";
import { InspirationFooter } from "@/components/InspirationFooter";

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
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <HabitTrackerShell habitId={selectedHabitId} />
          </div>
        </div>
        <InspirationFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HabitListShell />
      <InspirationFooter />
    </div>
  );
}
