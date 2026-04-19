/**
 * APNs push notification sender.
 * Sends notifications via Apple Push Notification service using HTTP/2.
 *
 * Requires: APNS_KEY_ID, APNS_TEAM_ID, APNS_KEY (base64-encoded .p8 key)
 *
 * Note: This uses the native fetch API with HTTP/2 support.
 * In production on Vercel, this works with Node 18+.
 * For local dev, push notifications require a real device and APNs sandbox.
 */

interface PushPayload {
  title: string;
  body: string;
  podcastId: string;
}

export async function sendPushNotification(
  deviceToken: string,
  payload: PushPayload
): Promise<boolean> {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const keyBase64 = process.env.APNS_KEY;

  if (!keyId || !teamId || !keyBase64) {
    console.log(`[apns] Would push to ${deviceToken.slice(0, 8)}...: "${payload.title}"`);
    return false;
  }

  try {
    // Generate JWT for APNs authentication
    const jwt = await generateApnsJwt(keyId, teamId, keyBase64);

    const isProduction = process.env.NODE_ENV === "production";
    const host = isProduction
      ? "https://api.push.apple.com"
      : "https://api.sandbox.push.apple.com";

    const response = await fetch(`${host}/3/device/${deviceToken}`, {
      method: "POST",
      headers: {
        "authorization": `bearer ${jwt}`,
        "apns-topic": "com.podcraft.app",
        "apns-push-type": "alert",
        "apns-priority": "10",
      },
      body: JSON.stringify({
        aps: {
          alert: {
            title: payload.title,
            body: payload.body,
          },
          badge: 1,
          sound: "default",
        },
        podcastId: payload.podcastId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[apns] Push failed for ${deviceToken.slice(0, 8)}...: ${error}`);
      return false;
    }

    return true;
  } catch (e) {
    console.error("[apns] Push error:", e);
    return false;
  }
}

async function generateApnsJwt(keyId: string, teamId: string, keyBase64: string): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const now = Math.floor(Date.now() / 1000);
  const claims = base64url(JSON.stringify({ iss: teamId, iat: now }));
  const unsigned = `${header}.${claims}`;

  // Import the private key
  const keyPem = Buffer.from(keyBase64, "base64").toString("utf-8");
  const keyData = keyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const key = await crypto.subtle.importKey(
    "pkcs8",
    Buffer.from(keyData, "base64"),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${base64url(Buffer.from(signature))}`;
}

function base64url(input: string | Buffer): string {
  const str = typeof input === "string"
    ? Buffer.from(input).toString("base64")
    : input.toString("base64");
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
