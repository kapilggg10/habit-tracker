export interface HabitEntry {
  percentage: number; // 0-100
  description?: string; // Optional description for incomplete/partial entries
}

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  entries: Record<string, HabitEntry | number>; // date (YYYY-MM-DD) -> entry (backward compatible: can be number or HabitEntry)
}

export interface ColorOption {
  name: string;
  hex: string;
}
