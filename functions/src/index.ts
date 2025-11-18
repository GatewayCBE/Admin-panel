// // index.ts
// import { onDocumentCreated } from "firebase-functions/v2/firestore";
// import * as admin from "firebase-admin";

// if (admin.apps.length === 0) admin.initializeApp();

// const db = admin.firestore();

// export const onSlotCreated = onDocumentCreated(
//   {
//     region: "asia-south1",
//     document:
//       "environment/testing/all_turfs_slot_booking/{turfId}/{dateId}/{sport}/{court}/{time}",
//   },
//   async (event) => {
//     const { turfId, dateId } = event.params;
//     const slotData = event.data?.data();

//     if (!slotData) {
//       console.warn("⚠️ No slot data found, skipping operations.");
//       return;
//     }

//     const validStatuses = ["Paid", "paymentSuccess"];
//     if (!validStatuses.includes(slotData.payment_status)) {
//       console.log(
//         `🟡 Skipping analytics (payment_status = ${slotData.payment_status})`
//       );
//       return;
//     }

//     const amount = slotData.paid_amount || slotData.amount || 0;
//     // userId might be stored in a few places in your payload:
//     const userId =
//       slotData.user_id ||
//       slotData.booking_user_id ||
//       slotData.paid_by ||
//       "unknown_user";

//     console.log(
//       `📊 Updating analytics: turf=${turfId} date=${dateId} user=${userId} amount=${amount}`
//     );

//     const basePath = `environment/testing/analytics/data`;
//     const batch = db.batch();

//     // --- read turf profile for name if exists ---
//     let turfName = "Unknown Turf";
//     try {
//       const turfDoc = await db.collection("environment/testing/turfs").doc(turfId).get();
//       if (turfDoc.exists) {
//         const t = turfDoc.data();
//         turfName = t?.turf_name || t?.name || turfName;
//       }
//     } catch (e) {
//       console.warn("Could not read turf profile:", e);
//     }

//     // --- read user profile for name if exists ---
//     let userName = "Unknown User";
//     try {
//       // If your users collection stores doc keyed by phone (like +91...), try doc lookup first
//       // But if in some situations userId is like 'USID_xxx' and stored in a doc field, we also try query.
//       let userDocSnap = null;
//       try {
//         userDocSnap = await db.collection("environment/testing/users").doc(userId).get();
//       } catch (e) {
//         userDocSnap = null;
//       }

//       if (userDocSnap && userDocSnap.exists) {
//         const ud = userDocSnap.data();
//         userName = ud?.user_name || ud?.user || ud?.name || userName;
//       } else {
//         // fallback to query by user_id field (if your schema uses user_id field inside doc)
//         const userQuery = await db
//           .collection("environment/testing/users")
//           .where("user_id", "==", userId)
//           .limit(1)
//           .get();
//         if (!userQuery.empty) {
//           const ud = userQuery.docs[0].data();
//           userName = ud?.user_name || ud?.user || ud?.name || userName;
//         }
//       }
//     } catch (e) {
//       console.warn("Could not resolve user profile:", e);
//     }

//     try {
//       // --- Global summary (top-level) ---
//       const globalRef = db.doc(`${basePath}/global/summary`);
//       batch.set(
//         globalRef,
//         {
//           total_revenue: admin.firestore.FieldValue.increment(amount),
//           total_bookings: admin.firestore.FieldValue.increment(1),
//           last_updated: admin.firestore.FieldValue.serverTimestamp(),
//         },
//         { merge: true }
//       );

//       // --- Daily totals ---
//       const dailyRef = db.doc(`${basePath}/daily/${dateId}`);
//       // Increment totals at daily doc
//       batch.set(
//         dailyRef,
//         {
//           date: dateId,
//           total_revenue: admin.firestore.FieldValue.increment(amount),
//           total_bookings: admin.firestore.FieldValue.increment(1),
//           last_updated: admin.firestore.FieldValue.serverTimestamp(),
//         },
//         { merge: true }
//       );

//       // --- Also store per-day nested breakdown for turfs & users so front-end can filter ---
//       // Use dynamic merge to increment nested fields:
//       const turfNestedKeyRevenue = `turfs.${turfId}.revenue`;
//       const turfNestedKeyBookings = `turfs.${turfId}.bookings`;
//       const turfNestedKeyName = `turfs.${turfId}.turf_name`;

//       const userNestedKeySpent = `users.${userId}.spent`;
//       const userNestedKeyBookings = `users.${userId}.bookings`;
//       const userNestedKeyName = `users.${userId}.user_name`;

//       // Use batch.set with merge to update nested fields (contains FieldValue.increment)
//       const dailySetObj: any = {
//         // top-level date & totals already set above; include the nested increments:
//         [turfNestedKeyRevenue]: admin.firestore.FieldValue.increment(amount),
//         [turfNestedKeyBookings]: admin.firestore.FieldValue.increment(1),
//         [turfNestedKeyName]: turfName,
//         [userNestedKeySpent]: admin.firestore.FieldValue.increment(amount),
//         [userNestedKeyBookings]: admin.firestore.FieldValue.increment(1),
//         [userNestedKeyName]: userName,
//       };

//       batch.set(dailyRef, dailySetObj, { merge: true });

//       // --- Turf summary (aggregate) ---
//       const turfAnalyticsRef = db.doc(`${basePath}/turf/${turfId}`);
//       batch.set(
//         turfAnalyticsRef,
//         {
//           turf_id: turfId,
//           turf_name: turfName,
//           total_revenue: admin.firestore.FieldValue.increment(amount),
//           total_bookings: admin.firestore.FieldValue.increment(1),
//           last_updated: admin.firestore.FieldValue.serverTimestamp(),
//         },
//         { merge: true }
//       );

//       // --- User summary (aggregate) ---
//       const userRef = db.doc(`${basePath}/users/${userId}`);
//       batch.set(
//         userRef,
//         {
//           user_id: userId,
//           user_name: userName,
//           total_spent: admin.firestore.FieldValue.increment(amount),
//           total_bookings: admin.firestore.FieldValue.increment(1),
//           last_booking: dateId,
//           last_updated: admin.firestore.FieldValue.serverTimestamp(),
//         },
//         { merge: true }
//       );

//       await batch.commit();
//       console.log("✅ Analytics (global/daily/turf/user) updated successfully");
//     } catch (err) {
//       console.error("Error updating analytics:", err);
//     }
//   }
// );
