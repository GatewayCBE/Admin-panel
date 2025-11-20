// functions/src/getRecentBookings.ts
import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

setGlobalOptions({ region: "asia-south1" }); // or put in firebase.json

if (admin.apps.length === 0) admin.initializeApp();
const db = admin.firestore();

export const getRecentBookings = onCall(
  {
    cors: true, // ← THIS IS THE KEY LINE
    region: "asia-south1",
  },
  async (request) => {
    try {
      const snapshot = await db
        .collectionGroup("time")
        .orderBy("payment_initiated_time", "desc")
        .limit(500)
        .get();

      const bookings = snapshot.docs.map((doc) => {
        const data = doc.data();
        const path = doc.ref.path.split("/");

        return {
          booking_id: doc.id,
          turfId: path[5],
          date: path[7],
          sport: path[8],
          court: path[10],
          slot_start_time: data.slot_start_time || doc.id,
          booking_username: data.booking_username || "Unknown",
          paid_amount: data.paid_amount || 0,
          unpaid_amount: data.unpaid_amount || 0,
          payment_status: data.payment_status,
          payment_initiated_time: data.payment_initiated_time,
          turf_name: data.turf_name || "Unknown Turf",
          user_name: data.user_name || data.booking_username,
          ...data,
        };
      });

      return { success: true, bookings };
    } catch (error) {
      console.error("getRecentBookings error:", error);
      throw new Error("Failed to load bookings");
    }
  }
);