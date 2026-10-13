// GET /.netlify/functions/push-public-key
// Returns the VAPID public key the browser needs to create a push subscription.

import { getVapidPublicKey, json } from "../lib/push";

export default async () => {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return json({ error: "Push notifications are not configured" }, 503);
  }
  return json({ publicKey });
};
