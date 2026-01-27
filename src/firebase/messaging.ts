// src/firebase/messaging.ts
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

export async function registerFcmToken(
  userId: string,
  role: "user" | "owner"
) {
  try {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY!,
    });

    if (!token) return;

    // 🔥 SEND TOKEN TO BACKEND
    await fetch(
      "https://asia-south1-play-arena-e83d8.cloudfunctions.net/saveFcmToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role, token }),
      }
    );

    console.log("✅ FCM token saved");
  } catch (err) {
    console.error("FCM registration failed:", err);
  }
}
