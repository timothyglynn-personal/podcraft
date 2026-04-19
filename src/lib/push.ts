"use client";

/**
 * Client-side push notification registration for Capacitor iOS.
 * Call registerPush() after the user signs in.
 */

let pushRegistered = false;

export async function registerPush(): Promise<void> {
  if (pushRegistered) return;
  if (typeof window === "undefined") return;

  try {
    // Dynamically import Capacitor push notifications (only available in native app)
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const { Capacitor } = await import("@capacitor/core");

    if (!Capacitor.isNativePlatform()) {
      console.log("[push] Not a native platform, skipping registration");
      return;
    }

    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== "granted") {
      console.log("[push] Permission not granted");
      return;
    }

    // Register with APNs
    await PushNotifications.register();

    // Handle registration success — send token to server
    PushNotifications.addListener("registration", async (token) => {
      console.log("[push] Registered with token:", token.value.slice(0, 16) + "...");
      try {
        await fetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.value, platform: "ios" }),
        });
      } catch (e) {
        console.error("[push] Failed to save token:", e);
      }
    });

    // Handle registration error
    PushNotifications.addListener("registrationError", (error) => {
      console.error("[push] Registration error:", error);
    });

    // Handle notification received while app is in foreground
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("[push] Notification received:", notification);
    });

    // Handle notification tap — deep link to podcast
    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const podcastId = action.notification.data?.podcastId;
      if (podcastId) {
        window.location.href = `/podcast/${podcastId}`;
      }
    });

    pushRegistered = true;
  } catch (e) {
    // Capacitor not available (running in browser)
    console.log("[push] Capacitor push not available:", e);
  }
}
