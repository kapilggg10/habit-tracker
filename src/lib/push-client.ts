"use client";

import { nanoid } from "nanoid";
import type { PushSyncPayload, SyncedReminder } from "@/types/reminder";
import { getReminders } from "./reminders";
import {
  getEntryPercentage,
  getHabitById,
  getHabits,
  updateHabitEntry,
} from "./storage";
import { formatDate } from "./utils";

const DEVICE_ID_KEY = "pushDeviceId";
const FUNCTIONS_BASE = "/.netlify/functions";
const DONE_DATES_LOOKBACK_DAYS = 14;

export type PushSupport =
  | { supported: true }
  | { supported: false; reason: "ios-not-installed" | "unsupported" };

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") {
    return { supported: false, reason: "unsupported" };
  }
  const ok =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  if (ok) return { supported: true };
  // iOS/iPadOS only exposes Web Push to PWAs added to the Home Screen (16.4+).
  if (isIOS() && !isStandalone()) {
    return { supported: false, reason: "ios-not-installed" };
  }
  return { supported: false, reason: "unsupported" };
}

export function getNotificationPermission():
  | NotificationPermission
  | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = nanoid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "Service worker isn't registered in dev mode. Use a production build (npm run build + netlify dev) to test notifications.",
    );
  }
  return navigator.serviceWorker.register("/sw.js");
}

async function fetchPublicKey(): Promise<string> {
  const res = await fetch(`${FUNCTIONS_BASE}/push-public-key`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Push server is not configured");
  const { publicKey } = (await res.json()) as { publicKey: string };
  return publicKey;
}

/**
 * Asks for notification permission (must be called from a user gesture,
 * e.g. a button click) and makes sure this device has a push subscription.
 */
export async function enablePush(): Promise<PushSubscription> {
  const support = getPushSupport();
  if (!support.supported) {
    throw new Error(
      support.reason === "ios-not-installed"
        ? "On iPhone/iPad, add this app to your Home Screen first, then open it from there."
        : "This browser doesn't support push notifications.",
    );
  }

  // Request permission first, before any other await, so it stays inside the
  // user gesture (required by Safari).
  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") {
    throw new Error(
      "Notifications are blocked. Allow them in your browser or system settings.",
    );
  }

  const registration = await getRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const publicKey = await fetchPublicKey();
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

function collectDoneDates(habitIds: Set<string>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const today = new Date();
  const dates: string[] = [];
  for (let i = DONE_DATES_LOOKBACK_DAYS - 1; i >= -1; i--) {
    // include tomorrow (-1) so a just-after-midnight check still works
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    );
    dates.push(formatDate(d));
  }
  for (const habit of getHabits()) {
    if (!habitIds.has(habit.id)) continue;
    result[habit.id] = dates.filter(
      (date) => getEntryPercentage(habit.entries[date]) === 100,
    );
  }
  return result;
}

export interface SyncOptions {
  sendTest?: {
    habitId: string;
    habitName: string;
    habitColor: string;
    description: string;
  };
}

/**
 * Pushes the current reminders (and recent completions for skip-if-done) to
 * the backend. No-op if notifications aren't enabled on this device.
 * Returns the backend's test-push result when `sendTest` is given.
 */
export async function syncReminders(
  options: SyncOptions = {},
): Promise<{ synced: boolean; test?: string }> {
  if (!getPushSupport().supported) return { synced: false };
  if (Notification.permission !== "granted") return { synced: false };

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return { synced: false };

  const habits = new Map(getHabits().map((h) => [h.id, h]));
  const reminders: SyncedReminder[] = [];
  for (const r of getReminders()) {
    const habit = habits.get(r.habitId);
    if (habit) {
      reminders.push({ ...r, habitName: habit.name, habitColor: habit.color });
    }
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    if (reminders.length === 0) return { synced: false };
    // Subscription was lost (browser rotated it); re-subscribe silently.
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(await fetchPublicKey()),
    });
  }

  const payload: PushSyncPayload & SyncOptions = {
    deviceId: getDeviceId(),
    subscription: subscription.toJSON(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    reminders,
    doneDates: collectDoneDates(new Set(reminders.map((r) => r.habitId))),
    sendTest: options.sendTest,
  };

  const res = await fetch(`${FUNCTIONS_BASE}/push-sync`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Sync failed (${res.status})`);
  const data = (await res.json()) as { test?: string };
  return { synced: true, test: data.test };
}

/** Shows a notification locally via the service worker (no server involved). */
export async function showLocalNotification(
  title: string,
  body: string,
  habitId?: string,
): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration || Notification.permission !== "granted") return;
  await registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: habitId ? `reminder-set-${habitId}` : undefined,
    data: habitId ? { habitId } : undefined,
  });
}

/** Marks a habit 100% complete for today. Returns true if it was newly completed. */
export function markHabitDoneToday(habitId: string): boolean {
  const habit = getHabitById(habitId);
  if (!habit) return false;
  const today = formatDate(new Date());
  const wasDone = getEntryPercentage(habit.entries[today]) === 100;
  if (!wasDone) {
    updateHabitEntry(habitId, today, 100);
    window.dispatchEvent(new Event("habitsUpdated"));
  }
  return !wasDone;
}
