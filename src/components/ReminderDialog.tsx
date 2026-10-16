"use client";

import { useEffect, useState } from "react";
import {
  enablePush,
  getNotificationPermission,
  getPushSupport,
  showLocalNotification,
  syncReminders,
} from "@/lib/push-client";
import {
  describeSchedule,
  getNextOccurrence,
  WEEKDAY_LABELS,
} from "@/lib/reminder-schedule";
import {
  createReminder,
  deleteReminder,
  getRemindersForHabit,
  REMINDERS_UPDATED_EVENT,
  updateReminder,
} from "@/lib/reminders";
import type { Habit } from "@/types/habit";
import type { Reminder, ReminderSchedule } from "@/types/reminder";

interface ReminderDialogProps {
  isOpen: boolean;
  habit: Habit;
  onClose: () => void;
}

type ScheduleType = ReminderSchedule["type"];

const TYPE_OPTIONS: { value: ScheduleType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekdays" },
  { value: "once", label: "One-off" },
];

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatNext(date: Date | null): string {
  if (!date) return "No upcoming reminder";
  return `Next: ${date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function ReminderDialog({
  isOpen,
  habit,
  onClose,
}: ReminderDialogProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [type, setType] = useState<ScheduleType>("daily");
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [onceAt, setOnceAt] = useState("");
  const [skipIfDone, setSkipIfDone] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [permission, setPermission] = useState<string>("default");
  const [support, setSupport] = useState<ReturnType<typeof getPushSupport>>({
    supported: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    const load = () => setReminders(getRemindersForHabit(habit.id));
    load();
    setError(null);
    setNotice(null);
    setSupport(getPushSupport());
    setPermission(getNotificationPermission());
    const inAnHour = new Date(Date.now() + 60 * 60 * 1000);
    inAnHour.setSeconds(0, 0);
    setOnceAt(toLocalInputValue(inAnHour));
    window.addEventListener(REMINDERS_UPDATED_EVENT, load);
    return () => window.removeEventListener(REMINDERS_UPDATED_EVENT, load);
  }, [isOpen, habit.id]);

  if (!isOpen) return null;

  const buildSchedule = (): ReminderSchedule | string => {
    if (type === "daily") return { type: "daily", time };
    if (type === "weekly") {
      if (days.length === 0) return "Pick at least one day.";
      return { type: "weekly", days: [...days].sort((a, b) => a - b), time };
    }
    const at = new Date(onceAt);
    if (Number.isNaN(at.getTime())) return "Pick a date and time.";
    if (at.getTime() <= Date.now()) return "Pick a time in the future.";
    return { type: "once", at: at.toISOString() };
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const schedule = buildSchedule();
    if (typeof schedule === "string") {
      setError(schedule);
      return;
    }

    setBusy(true);
    try {
      // Must run first so the permission prompt stays inside the click gesture.
      await enablePush();
      setPermission(getNotificationPermission());
    } catch (err) {
      setPermission(getNotificationPermission());
      setError((err as Error).message);
      setBusy(false);
      return;
    }

    createReminder(habit.id, schedule, skipIfDone);
    const description = describeSchedule(schedule);
    try {
      const result = await syncReminders({
        sendTest: {
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color,
          description,
        },
      });
      if (result.test !== "sent") {
        // Server couldn't deliver the confirmation; show one locally instead.
        await showLocalNotification(
          `Reminder set for ${habit.name}`,
          `${description}.`,
          habit.id,
        );
      }
      setNotice(`Reminder set: ${description}`);
    } catch (err) {
      console.error(err);
      setError(
        "Reminder saved, but it couldn't reach the notification server. It will retry automatically when you're online.",
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleDay = (d: number) =>
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  const inputClass =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 transition-all duration-200 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50 dark:focus:border-gray-400 dark:focus:ring-gray-400";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click closes the dialog; Escape handles keyboard users
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-slide-up-scale sm:p-8 dark:bg-gray-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-dialog-title"
      >
        <div className="mb-5 flex items-center gap-3">
          <div
            className="h-5 w-5 rounded-full"
            style={{ backgroundColor: habit.color }}
          />
          <h2
            id="reminder-dialog-title"
            className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50"
          >
            Reminders
          </h2>
        </div>

        {!support.supported && (
          <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
            {support.reason === "ios-not-installed" ? (
              <>
                On iPhone and iPad, notifications only work when the app is
                installed. Tap <strong>Share</strong> →{" "}
                <strong>Add to Home Screen</strong>, then open Habit Tracker
                from your Home Screen.
              </>
            ) : (
              "This browser doesn't support push notifications."
            )}
          </div>
        )}
        {support.supported && permission === "denied" && (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
            Notifications are blocked for this app. Allow them in your browser
            or phone settings, then try again.
          </div>
        )}

        {/* Existing reminders */}
        {reminders.length > 0 && (
          <ul className="mb-6 space-y-2">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${r.enabled ? "text-gray-900 dark:text-gray-50" : "text-gray-400 line-through dark:text-gray-500"}`}
                  >
                    {describeSchedule(r.schedule)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {r.enabled
                      ? formatNext(getNextOccurrence(r.schedule))
                      : "Paused"}
                    {r.skipIfDone && " · skipped if done"}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={r.enabled}
                  aria-label={r.enabled ? "Pause reminder" : "Resume reminder"}
                  onClick={() => updateReminder(r.id, { enabled: !r.enabled })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${r.enabled ? "" : "bg-gray-300 dark:bg-gray-600"}`}
                  style={
                    r.enabled ? { backgroundColor: habit.color } : undefined
                  }
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${r.enabled ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => deleteReminder(r.id)}
                  aria-label="Delete reminder"
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                >
                  <svg
                    className="h-4 w-4"
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* New reminder form */}
        <form onSubmit={handleAdd}>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            New reminder
          </p>
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-700">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`rounded-lg py-2 text-sm font-medium transition-all ${
                  type === opt.value
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-50"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {type === "weekly" && (
            <div className="mb-4 flex justify-between gap-1">
              {WEEKDAY_LABELS.map((label, d) => {
                const active = days.includes(d);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDay(d)}
                    aria-pressed={active}
                    className={`h-10 w-10 rounded-full text-xs font-semibold transition-all ${
                      active
                        ? "text-white shadow"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                    style={
                      active ? { backgroundColor: habit.color } : undefined
                    }
                  >
                    {label.slice(0, 2)}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mb-4">
            {type === "once" ? (
              <input
                type="datetime-local"
                aria-label="Reminder date and time"
                value={onceAt}
                min={toLocalInputValue(new Date())}
                onChange={(e) => setOnceAt(e.target.value)}
                className={inputClass}
                required
              />
            ) : (
              <input
                type="time"
                aria-label="Reminder time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
                required
              />
            )}
          </div>

          <label className="mb-5 flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={skipIfDone}
              onChange={(e) => setSkipIfDone(e.target.checked)}
              className="h-4 w-4 rounded"
              style={{ accentColor: habit.color }}
            />
            Skip if I've already completed it that day
          </label>

          {error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {notice && (
            <p className="mb-4 text-sm text-green-700 dark:text-green-400">
              {notice}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Done
            </button>
            <button
              type="submit"
              disabled={busy || !support.supported}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 font-medium text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {busy ? "Saving…" : "Add reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
