// POST   /.netlify/functions/push-sync   -> store this device's subscription + reminders
// DELETE /.netlify/functions/push-sync   -> forget this device
//
// The app has no accounts: each browser/PWA install is identified by a random
// deviceId it generates and keeps in localStorage.

import type { DeviceRecord } from "../lib/push";
import {
  devicesStore,
  json,
  sendPush,
  sentStore,
  validateSyncPayload,
} from "../lib/push";

const MAX_BODY_BYTES = 200_000;

export default async (req: Request) => {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return json({ error: "Method not allowed" }, 405);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "Too large" }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (req.method === "DELETE") {
    const deviceId = (body as { deviceId?: string })?.deviceId;
    if (
      typeof deviceId !== "string" ||
      !/^[A-Za-z0-9_-]{6,64}$/.test(deviceId)
    ) {
      return json({ error: "deviceId" }, 400);
    }
    await Promise.all([
      devicesStore().delete(deviceId),
      sentStore().delete(deviceId),
    ]);
    return json({ ok: true });
  }

  const result = validateSyncPayload(body);
  if (!result.ok) return json({ error: result.error }, 400);
  const { payload } = result;

  // Nothing to schedule: don't keep the subscription around.
  if (payload.reminders.length === 0) {
    await Promise.all([
      devicesStore().delete(payload.deviceId),
      sentStore().delete(payload.deviceId),
    ]);
  } else {
    const record: DeviceRecord = {
      subscription: payload.subscription,
      timeZone: payload.timeZone,
      reminders: payload.reminders,
      doneDates: payload.doneDates,
      updatedAt: new Date().toISOString(),
    };
    await devicesStore().setJSON(payload.deviceId, record);
  }

  // Optional confirmation push so the user immediately sees that it works.
  const test = (
    body as {
      sendTest?: {
        habitId: string;
        habitName: string;
        habitColor: string;
        description: string;
      };
    }
  ).sendTest;
  let testResult: string | undefined;
  if (test && typeof test.habitName === "string") {
    testResult = await sendPush(payload.subscription, {
      type: "REMINDER",
      title: `Reminder set for ${test.habitName.slice(0, 100)}`,
      body: `${String(test.description ?? "").slice(0, 120)}. You'll get a notification like this one.`,
      habitId: String(test.habitId ?? ""),
      habitColor: String(test.habitColor ?? ""),
      reminderId: "test",
      tag: `reminder-set-${String(test.habitId ?? "")}`,
    });
  }

  return json({ ok: true, test: testResult });
};
