// functions/src/index.ts
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) admin.initializeApp();

const db = admin.firestore();

/** Helper: parse "19-Nov-2025" into a Date */
const parseDateId = (s: string): Date => {
  const [dd, monStr, yyyy] = s.split("-");
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const monthIndex = months[monStr] ?? 0;
  return new Date(Number(yyyy), monthIndex, Number(dd));
};

/** Helper: convert "06:00", "6:00 AM", "06:00 PM" → minutes since midnight */
const toMinutes = (t?: string): number => {
  if (!t) return 0;
  const trimmed = t.trim();
  let timePart = trimmed;
  let modifier = "";

  // formats like "6:00 AM"
  if (trimmed.includes(" ")) {
    const parts = trimmed.split(" ");
    timePart = parts[0];
    modifier = (parts[1] || "").toUpperCase();
  }

  const [hStr, mStr] = timePart.split(":");
  let h = Number(hStr || "0");
  const m = Number(mStr || "0");

  if (modifier === "PM" && h < 12) h += 12;
  if (modifier === "AM" && h === 12) h = 0;

  return h * 60 + m;
};

/**
 * Main analytics + courts fix trigger
 * Triggers on every new paid booking
 */
export const onSlotCreated = onDocumentCreated(
  {
    region: "asia-south1",
    document:
      "environment/testing/all_turfs_slot_booking/{turfId}/{dateId}/{sport}/{court}/{time}",
  },
  async (event) => {
    const { turfId, dateId, sport } = event.params;
    const slotData = event.data?.data();

    if (!slotData) {
      console.warn("No slot data found, skipping operations.");
      return;
    }

    const validStatuses = ["Paid", "paymentSuccess"];
    if (!validStatuses.includes(slotData.payment_status)) {
      console.log(
        `Skipping analytics (payment_status = ${slotData.payment_status})`
      );
      return;
    }

    const amount = slotData.paid_amount || slotData.amount || 0;
    const userId =
      slotData.user_id ||
      slotData.booking_user_id ||
      slotData.paid_by ||
      "unknown_user";

    console.log(
      `Updating analytics: turf=${turfId} date=${dateId} user=${userId} amount=${amount}`
    );

    // ---------- NEW: day/night + weekday/weekend classification ----------
    // we’ll fill these once we read turf timings
    let pricePeriod: "day" | "night" = "day";

    // figure out booking time from data/path
    const bookedTimeStr: string =
      slotData.slot_start_time ||
      slotData.time ||
      event.params.time ||
      "";

    // parse dateId into a JS Date to know weekday / weekend
    const bookingDate = parseDateId(dateId);
    const jsDay = bookingDate.getDay(); // 0=Sun ... 6=Sat
    const isWeekend = jsDay === 0 || jsDay === 6;
    const weekdayName = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
    }); // "Monday", ...

    const basePath = `environment/testing/analytics/data`;
    const batch = db.batch();

    // === Resolve turf name & day/night based on sport_specific_timing ===
    let turfName = "Unknown Turf";
    try {
      const turfDoc = await db
        .collection("environment/testing/turfs")
        .doc(turfId)
        .get();
      if (turfDoc.exists) {
        const t = turfDoc.data();
        turfName = t?.turf_name || t?.name || turfName;

        const timingMap = t?.sport_specific_timing || {};
        const timing = timingMap[sport];

        if (timing) {
          const bookedMinutes = toMinutes(bookedTimeStr);
          const dayStart = toMinutes(timing.day_start_time);
          const dayEnd = toMinutes(timing.day_end_time);
          // if between configured day window -> day, else night
          if (bookedMinutes >= dayStart && bookedMinutes < dayEnd) {
            pricePeriod = "day";
          } else {
            pricePeriod = "night";
          }
        }
      }
    } catch (e) {
      console.warn("Could not read turf profile:", e);
    }

    // === Resolve user name ===
    let userName = "Unknown User";
    try {
      let userDocSnap = null;
      try {
        userDocSnap = await db
          .collection("environment/testing/users")
          .doc(userId)
          .get();
      } catch {
        userDocSnap = null;
      }

      if (userDocSnap?.exists) {
        const ud = userDocSnap.data();
        userName = ud?.user_name || ud?.user || ud?.name || userName;
      } else {
        const userQuery = await db
          .collection("environment/testing/users")
          .where("user_id", "==", userId)
          .limit(1)
          .get();
        if (!userQuery.empty) {
          const ud = userQuery.docs[0].data();
          userName = ud?.user_name || ud?.user || ud?.name || userName;
        }
      }
    } catch (e) {
      console.warn("Could not resolve user profile:", e);
    }

    try {
      // === 1. Global summary ===
      const globalRef = db.doc(`${basePath}/global/summary`);
      batch.set(
        globalRef,
        {
          total_revenue: admin.firestore.FieldValue.increment(amount),
          total_bookings: admin.firestore.FieldValue.increment(1),
          last_updated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // === 2. Daily totals + nested breakdowns ===
      const dailyRef = db.doc(`${basePath}/daily/${dateId}`);
      batch.set(
        dailyRef,
        {
          date: dateId,
          total_revenue: admin.firestore.FieldValue.increment(amount),
          total_bookings: admin.firestore.FieldValue.increment(1),
          last_updated: admin.firestore.FieldValue.serverTimestamp(),

          // Nested turf breakdown
          [`turfs.${turfId}.revenue`]:
            admin.firestore.FieldValue.increment(amount),
          [`turfs.${turfId}.bookings`]:
            admin.firestore.FieldValue.increment(1),
          [`turfs.${turfId}.turf_name`]: turfName,

          // Nested user breakdown
          [`users.${userId}.spent`]:
            admin.firestore.FieldValue.increment(amount),
          [`users.${userId}.bookings`]:
            admin.firestore.FieldValue.increment(1),
          [`users.${userId}.user_name`]: userName,

          // ---------- NEW: day vs night split ----------
          [`time_split.${pricePeriod}.revenue`]:
            admin.firestore.FieldValue.increment(amount),
          [`time_split.${pricePeriod}.bookings`]:
            admin.firestore.FieldValue.increment(1),

          // ---------- NEW: weekday / weekend splits ----------
          [`weekday_split.${weekdayName}.revenue`]:
            admin.firestore.FieldValue.increment(amount),
          [`weekday_split.${weekdayName}.bookings`]:
            admin.firestore.FieldValue.increment(1),
          [isWeekend ? "weekend_revenue" : "weekday_revenue"]:
            admin.firestore.FieldValue.increment(amount),
          [isWeekend ? "weekend_bookings" : "weekday_bookings"]:
            admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );

      // === 3. Turf aggregate ===
      const turfAnalyticsRef = db.doc(`${basePath}/turf/${turfId}`);
      batch.set(
        turfAnalyticsRef,
        {
          turf_id: turfId,
          turf_name: turfName,
          total_revenue: admin.firestore.FieldValue.increment(amount),
          total_bookings: admin.firestore.FieldValue.increment(1),
          last_updated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // === 4. User aggregate ===
      const userRef = db.doc(`${basePath}/users/${userId}`);
      batch.set(
        userRef,
        {
          user_id: userId,
          user_name: userName,
          total_spent: admin.firestore.FieldValue.increment(amount),
          total_bookings: admin.firestore.FieldValue.increment(1),
          last_booking: dateId,
          last_updated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // === 5. FIX COURTS ARRAY AUTOMATICALLY ===
      const sportDocRef = db
        .collection("environment/testing/all_turfs_slot_booking")
        .doc(turfId)
        .collection(dateId)
        .doc(sport);

      let courtNames: string[] = [];
      try {
        const collections = await sportDocRef.listCollections();
        courtNames = collections.map((col) => col.id);
        if (courtNames.length > 0) {
          batch.set(sportDocRef, { courts: courtNames }, { merge: true });
          console.log(`Updated courts for ${sport}:`, courtNames.join(", "));
        }
      } catch (e) {
        console.warn("Failed to update courts array:", e);
      }

      await batch.commit();
      console.log("Analytics + courts updated successfully");
    } catch (err) {
      console.error("Error in onSlotCreated:", err);
    }
  }
);

// keep your existing HTTPS function export
export { getRecentBookings } from "./getRecentBookings";
export { deleteTurfByAdmin } from "./deleteTurf";
export { createWebRazorpayOrder, verifyWebRazorpayPayment } from "./razorpayWeb";
export { cancelWebBooking } from "./cancelWebBooking";
export { saveFcmToken } from "./saveFcmToken";