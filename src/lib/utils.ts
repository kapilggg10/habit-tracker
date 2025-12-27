import type { Habit } from "@/types/habit";

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getColorWithOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function playCompletionSound(): void {
  try {
    const audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();

    // Create a pleasant ascending musical sequence (C major chord progression)
    const notes = [
      { freq: 523.25, time: 0 }, // C5
      { freq: 659.25, time: 0.1 }, // E5
      { freq: 783.99, time: 0.2 }, // G5
      { freq: 1046.5, time: 0.3 }, // C6
    ];

    notes.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = note.freq;
      oscillator.type = "sine";

      const startTime = audioContext.currentTime + note.time;
      const duration = 0.3;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  } catch (error) {
    // Silently fail if audio context is not available
    console.debug("Audio context not available", error);
  }
}

export function playClickSound(): void {
  try {
    const audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();

    // Create a pleasant, soft click sound
    // Using a quick, gentle tone that fades out smoothly
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant frequency - A4 (440 Hz) with a slight higher harmonic
    oscillator.frequency.value = 440;
    oscillator.type = "sine";

    const now = audioContext.currentTime;
    const duration = 0.1; // Short click sound

    // Quick attack, smooth decay
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Smooth decay

    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (error) {
    // Silently fail if audio context is not available
    console.debug("Click sound not available", error);
  }
}

export function getCompletionStats(habit: Habit): {
  total: number;
  completed: number;
  partial: number;
  notCompleted: number;
} {
  const entries = Object.values(habit.entries);
  const total = entries.length;
  const completed = entries.filter((p) => p === 100).length;
  const partial = entries.filter((p) => p > 0 && p < 100).length;
  const notCompleted = entries.filter((p) => p === 0).length;

  return { total, completed, partial, notCompleted };
}

export function getCurrentMonthDateRange(habit: Habit): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  // Always start from the first day of the current month
  const startDate = firstDayOfMonth;

  // End date: today
  const endDate = today;

  // Generate array of date strings
  const dates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(formatDate(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function getCurrentMonthCalendarView(habit: Habit): (string | null)[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  // Get day of week for the 1st (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Create calendar array with 7 columns (one for each day of week)
  const calendar: (string | null)[] = [];

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendar.push(null);
  }

  // Add all days from 1st to today
  const currentDate = new Date(firstDayOfMonth);
  while (currentDate <= today) {
    calendar.push(formatDate(new Date(currentDate)));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return calendar;
}
