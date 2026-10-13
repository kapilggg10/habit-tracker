"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { markHabitDoneToday, syncReminders } from "@/lib/push-client";
import { REMINDERS_UPDATED_EVENT } from "@/lib/reminders";
import { getHabitById } from "@/lib/storage";
import { playCompletionSound } from "@/lib/utils";
import type { ReminderPushData } from "@/types/reminder";
import { Confetti } from "./Confetti";

interface PopupState {
  habitId: string;
  title: string;
  body: string;
  color: string;
}

const SYNC_DEBOUNCE_MS = 1500;

/**
 * App-wide glue for reminders:
 * - keeps the push backend in sync with local reminders / completions
 * - shows an in-app popup when a reminder push arrives while the app is open
 * - handles "Mark done" / "Open" actions coming from notifications
 */
export function NotificationManager() {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [showConfetti, setShowConfetti] = useState<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSync = useCallback(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncReminders().catch((error) =>
        console.warn("[reminders] sync failed", error),
      );
    }, SYNC_DEBOUNCE_MS);
  }, []);

  const completeHabit = useCallback((habitId: string) => {
    const habit = getHabitById(habitId);
    if (!habit) return;
    if (markHabitDoneToday(habitId)) {
      playCompletionSound();
      setShowConfetti(habit.color);
      setTimeout(() => setShowConfetti(null), 2000);
    }
  }, []);

  // Keep backend in sync
  useEffect(() => {
    scheduleSync();
    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleSync();
    };
    window.addEventListener("habitsUpdated", scheduleSync);
    window.addEventListener(REMINDERS_UPDATED_EVENT, scheduleSync);
    window.addEventListener("storage", scheduleSync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("habitsUpdated", scheduleSync);
      window.removeEventListener(REMINDERS_UPDATED_EVENT, scheduleSync);
      window.removeEventListener("storage", scheduleSync);
      document.removeEventListener("visibilitychange", onVisible);
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [scheduleSync]);

  // "Mark done" from a notification when the app wasn't open: /?markDone=<id>#habit-<id>
  useEffect(() => {
    const url = new URL(window.location.href);
    const habitId = url.searchParams.get("markDone");
    if (!habitId) return;
    url.searchParams.delete("markDone");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    completeHabit(habitId);
  }, [completeHabit]);

  // Messages from the service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const data = event.data as
        | (Omit<ReminderPushData, "type"> & { type: "REMINDER_FIRED" })
        | { type: "MARK_DONE" | "OPEN_HABIT"; habitId: string }
        | undefined;
      if (!data) return;

      if (data.type === "REMINDER_FIRED") {
        if (document.visibilityState !== "visible" || !data.habitId) return;
        if (!getHabitById(data.habitId)) return;
        setPopup({
          habitId: data.habitId,
          title: data.title,
          body: data.body,
          color: data.habitColor || "#6366f1",
        });
      } else if (data.type === "MARK_DONE") {
        window.location.hash = `habit-${data.habitId}`;
        completeHabit(data.habitId);
      } else if (data.type === "OPEN_HABIT") {
        window.location.hash = `habit-${data.habitId}`;
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [completeHabit]);

  return (
    <>
      {popup && (
        <div
          className="fixed inset-x-0 top-0 z-[60] flex justify-center p-4 animate-fade-in-up"
          role="alertdialog"
          aria-live="assertive"
          aria-labelledby="reminder-popup-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <div className="h-1.5" style={{ backgroundColor: popup.color }} />
            <div className="p-5">
              <div className="mb-1 flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: popup.color }}
                  aria-hidden="true"
                >
                  <BellIcon className="h-4 w-4" />
                </span>
                <h3
                  id="reminder-popup-title"
                  className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50"
                >
                  {popup.title}
                </h3>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {popup.body}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    completeHabit(popup.habitId);
                    setPopup(null);
                  }}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: popup.color }}
                >
                  Mark done
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = `habit-${popup.habitId}`;
                    setPopup(null);
                  }}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => setPopup(null)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showConfetti && <Confetti color={showConfetti} />}
    </>
  );
}

export function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}
