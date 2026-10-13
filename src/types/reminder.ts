/**
 * A reminder schedule.
 * - `daily`:  every day at `time` (HH:MM, 24h, in the user's timezone)
 * - `weekly`: on the given weekdays (0 = Sunday … 6 = Saturday) at `time`
 * - `once`:   a single reminder at `at` (absolute ISO timestamp)
 */
export type ReminderSchedule =
  | { type: "daily"; time: string }
  | { type: "weekly"; days: number[]; time: string }
  | { type: "once"; at: string };

export interface Reminder {
  id: string;
  habitId: string;
  schedule: ReminderSchedule;
  /** Don't send the reminder if the habit is already 100% done that day. */
  skipIfDone: boolean;
  enabled: boolean;
  createdAt: string;
}

/** Reminder as sent to the push backend (adds display info for the notification). */
export interface SyncedReminder extends Reminder {
  habitName: string;
  habitColor: string;
}

/** Payload the client POSTs to the push-sync function. */
export interface PushSyncPayload {
  deviceId: string;
  subscription: PushSubscriptionJSON;
  timeZone: string;
  reminders: SyncedReminder[];
  /** habitId -> recent local dates (YYYY-MM-DD) on which the habit was 100% complete */
  doneDates: Record<string, string[]>;
}

/** Data carried inside a push message / posted to open app windows. */
export interface ReminderPushData {
  type: "REMINDER";
  title: string;
  body: string;
  habitId: string;
  habitColor: string;
  reminderId: string;
  tag: string;
}
