// Scheduled function: runs every minute, finds due reminders for every
// registered device and sends a Web Push notification for each.

import type { Config } from "@netlify/functions";
import { findDueOccurrence } from "../../src/lib/reminder-schedule";
import type { DeviceRecord, SentRecord } from "../lib/push";
import {
  buildReminderMessage,
  devicesStore,
  sendPush,
  sentStore,
} from "../lib/push";

const CONCURRENCY = 10;

async function processDevice(deviceId: string, now: Date): Promise<number> {
  const devices = devicesStore();
  const sentBlobs = sentStore();

  const device = (await devices.get(deviceId, {
    type: "json",
  })) as DeviceRecord | null;
  if (!device) return 0;

  const sent = ((await sentBlobs.get(deviceId, { type: "json" })) ??
    {}) as SentRecord;
  let changed = false;
  let count = 0;

  for (const reminder of device.reminders) {
    const occurrence = findDueOccurrence(reminder, now, device.timeZone);
    if (!occurrence) continue;
    if (sent[reminder.id] === occurrence.key) continue;

    if (
      reminder.skipIfDone &&
      device.doneDates[reminder.habitId]?.includes(occurrence.localDate)
    ) {
      continue;
    }

    const result = await sendPush(
      device.subscription,
      buildReminderMessage(reminder),
    );
    if (result === "gone") {
      // Subscription expired or permission revoked: forget this device.
      await Promise.all([devices.delete(deviceId), sentBlobs.delete(deviceId)]);
      return count;
    }
    if (result === "sent") {
      sent[reminder.id] = occurrence.key;
      changed = true;
      count++;
    }
  }

  // Drop bookkeeping for reminders that no longer exist.
  const liveIds = new Set(device.reminders.map((r) => r.id));
  for (const id of Object.keys(sent)) {
    if (!liveIds.has(id)) {
      delete sent[id];
      changed = true;
    }
  }

  if (changed) await sentBlobs.setJSON(deviceId, sent);
  return count;
}

export default async () => {
  const now = new Date();
  const { blobs } = await devicesStore().list();
  let total = 0;

  for (let i = 0; i < blobs.length; i += CONCURRENCY) {
    const batch = blobs.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((b) => processDevice(b.key, now)),
    );
    for (const r of results) {
      if (r.status === "fulfilled") total += r.value;
      else console.error("[send-reminders] device failed", r.reason);
    }
  }

  console.log(
    `[send-reminders] ${now.toISOString()} devices=${blobs.length} sent=${total}`,
  );
};

export const config: Config = {
  schedule: "* * * * *",
};
