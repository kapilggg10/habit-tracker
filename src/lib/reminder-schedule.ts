// Pure scheduling helpers shared by the browser and the Netlify push functions.
// Keep this file free of browser/Node-only APIs.

import type { Reminder, ReminderSchedule } from "@/types/reminder";

/** How long after its scheduled minute a reminder is still considered due. */
export const DEFAULT_GRACE_MINUTES = 10;

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface ZonedParts {
  /** Local date as YYYY-MM-DD */
  date: string;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  /** Minutes since local midnight */
  minutes: number;
}

/** Returns wall-clock parts of `date` in `timeZone`. */
export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    parts[p.type] = p.value;
  }
  const hour = Number(parts.hour) % 24;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: WEEKDAY_INDEX[parts.weekday ?? "Sun"] ?? 0,
    minutes: hour * 60 + Number(parts.minute),
  };
}

/** Parses "HH:MM" into minutes since midnight, or null if invalid. */
export function parseTime(time: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export interface DueOccurrence {
  /** Unique key for this occurrence, used to avoid sending twice. */
  key: string;
  /** Local date (YYYY-MM-DD) of the occurrence, used for skip-if-done. */
  localDate: string;
}

/**
 * If `reminder` has an occurrence within [scheduled, scheduled + grace) of `now`
 * (evaluated in `timeZone`), returns it. Otherwise null.
 */
export function findDueOccurrence(
  reminder: Pick<Reminder, "schedule" | "enabled">,
  now: Date,
  timeZone: string,
  graceMinutes: number = DEFAULT_GRACE_MINUTES,
): DueOccurrence | null {
  if (!reminder.enabled) return null;
  const { schedule } = reminder;

  if (schedule.type === "once") {
    const at = Date.parse(schedule.at);
    if (Number.isNaN(at)) return null;
    const diff = now.getTime() - at;
    if (diff < 0 || diff >= graceMinutes * 60_000) return null;
    return {
      key: `once:${schedule.at}`,
      localDate: getZonedParts(new Date(at), timeZone).date,
    };
  }

  const target = parseTime(schedule.time);
  if (target === null) return null;
  const parts = getZonedParts(now, timeZone);
  if (schedule.type === "weekly" && !schedule.days.includes(parts.weekday)) {
    return null;
  }
  if (parts.minutes < target || parts.minutes >= target + graceMinutes) {
    return null;
  }
  return { key: parts.date, localDate: parts.date };
}

/**
 * Next time the reminder will fire, using the device's local timezone.
 * Intended for display in the UI.
 */
export function getNextOccurrence(
  schedule: ReminderSchedule,
  now: Date = new Date(),
): Date | null {
  if (schedule.type === "once") {
    const at = new Date(schedule.at);
    return at.getTime() > now.getTime() ? at : null;
  }
  const target = parseTime(schedule.time);
  if (target === null) return null;
  if (schedule.type === "weekly" && schedule.days.length === 0) return null;

  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
      Math.floor(target / 60),
      target % 60,
    );
    if (candidate.getTime() <= now.getTime()) continue;
    if (
      schedule.type === "weekly" &&
      !schedule.days.includes(candidate.getDay())
    ) {
      continue;
    }
    return candidate;
  }
  return null;
}

export function formatTime12h(time: string): string {
  const minutes = parseTime(time);
  if (minutes === null) return time;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Human-readable description, e.g. "Every day at 7:00 AM". */
export function describeSchedule(schedule: ReminderSchedule): string {
  if (schedule.type === "daily") {
    return `Every day at ${formatTime12h(schedule.time)}`;
  }
  if (schedule.type === "weekly") {
    const days = [...schedule.days].sort((a, b) => a - b);
    let label: string;
    if (days.join() === "1,2,3,4,5") label = "Weekdays";
    else if (days.join() === "0,6") label = "Weekends";
    else if (days.length === 7) label = "Every day";
    else label = days.map((d) => WEEKDAY_LABELS[d]).join(", ");
    return `${label} at ${formatTime12h(schedule.time)}`;
  }
  const at = new Date(schedule.at);
  return `Once on ${at.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}
