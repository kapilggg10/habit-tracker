export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  entries: Record<string, number>; // date (YYYY-MM-DD) -> percentage (0-100)
}

export interface ColorOption {
  name: string;
  hex: string;
}
