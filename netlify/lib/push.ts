// Shared helpers for the push-notification Netlify Functions.

import { getStore } from "@netlify/blobs";
import webpush from "web-push";
import type {
  PushSyncPayload,
  ReminderPushData,
  SyncedReminder,
} from "../../src/types/reminder";

export interface DeviceRecord {
  subscription: PushSubscriptionJSON;
  timeZone: string;
  reminders: SyncedReminder[];
  doneDates: Record<string, string[]>;
  updatedAt: string;
}

/** reminderId -> key of the last occurrence we already sent */
export type SentRecord = Record<string, string>;

export const devicesStore = () => getStore("push-devices");
export const sentStore = () => getStore("push-sent");

let vapidConfigured = false;

export function getVapidPublicKey(): string | undefined {
  return process.env.VAPID_PUBLIC_KEY;
}

function configureVapid(): void {
  if (vapidConfigured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";
  if (!publicKey || !privateKey) {
    throw new Error("VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not configured");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export type SendResult = "sent" | "gone" | "error";

/** Sends a push. Returns "gone" when the subscription has expired (404/410). */
export async function sendPush(
  subscription: PushSubscriptionJSON,
  data: ReminderPushData,
): Promise<SendResult> {
  configureVapid();
  try {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify(data),
      { TTL: 60 * 10, urgency: "high", topic: data.tag.slice(0, 32) },
    );
    return "sent";
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return "gone";
    console.error("[push] send failed", status, (error as Error).message);
    return "error";
  }
}

export function buildReminderMessage(
  reminder: SyncedReminder,
): ReminderPushData {
  return {
    type: "REMINDER",
    title: `Time for ${reminder.habitName}`,
    body: "Keep your streak going. Tap to log today's progress.",
    habitId: reminder.habitId,
    habitColor: reminder.habitColor,
    reminderId: reminder.id,
    tag: `habit-${reminder.habitId}`,
  };
}

// ---- Validation ----------------------------------------------------------

const ID_RE = /^[A-Za-z0-9_-]{6,64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_REMINDERS = 200;

function isValidReminder(r: unknown): r is SyncedReminder {
  if (!r || typeof r !== "object") return false;
  const x = r as SyncedReminder;
  if (!ID_RE.test(x.id) || !ID_RE.test(x.habitId)) return false;
  if (typeof x.habitName !== "string" || x.habitName.length > 200) return false;
  if (typeof x.enabled !== "boolean" || typeof x.skipIfDone !== "boolean") {
    return false;
  }
  const s = x.schedule;
  if (!s || typeof s !== "object") return false;
  if (s.type === "daily") return TIME_RE.test(s.time);
  if (s.type === "weekly") {
    return (
      TIME_RE.test(s.time) &&
      Array.isArray(s.days) &&
      s.days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    );
  }
  if (s.type === "once") return !Number.isNaN(Date.parse(s.at));
  return false;
}

export function validateSyncPayload(
  body: unknown,
): { ok: true; payload: PushSyncPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body" };
  }
  const p = body as PushSyncPayload;
  if (!ID_RE.test(p.deviceId ?? "")) return { ok: false, error: "deviceId" };
  const sub = p.subscription;
  if (
    !sub ||
    typeof sub.endpoint !== "string" ||
    !sub.endpoint.startsWith("https://") ||
    typeof sub.keys?.p256dh !== "string" ||
    typeof sub.keys?.auth !== "string"
  ) {
    return { ok: false, error: "subscription" };
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: p.timeZone });
  } catch {
    return { ok: false, error: "timeZone" };
  }
  if (
    !Array.isArray(p.reminders) ||
    p.reminders.length > MAX_REMINDERS ||
    !p.reminders.every(isValidReminder)
  ) {
    return { ok: false, error: "reminders" };
  }
  const doneDates: Record<string, string[]> = {};
  for (const [habitId, dates] of Object.entries(p.doneDates ?? {})) {
    if (!ID_RE.test(habitId) || !Array.isArray(dates)) continue;
    doneDates[habitId] = dates
      .filter((d) => typeof d === "string" && DATE_RE.test(d))
      .slice(-14);
  }
  return { ok: true, payload: { ...p, doneDates } };
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
