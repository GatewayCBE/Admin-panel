// import { onRequest } from "firebase-functions/v2/https";
// import * as admin from "firebase-admin";

// if (!admin.apps.length) admin.initializeApp();
// const db = admin.firestore();

// export const getRecentBookings = onRequest(
//   {
//     region: "asia-south1",
//     cors: true,
//     timeoutSeconds: 60,
//     memory: "512MiB",
//   },
//   async (req, res): Promise<void> => {
//     try {
//       const bookings: any[] = [];

//       /* =====================================================
//          1️⃣ LOAD TURF ID → NAME MAP (ONCE)
//       ===================================================== */
//       const turfSnap = await db
//         .collection("environment/testing/turfs")
//         .get();

//       const turfMap = new Map<string, string>();
//       turfSnap.docs.forEach(d => {
//         turfMap.set(d.id, d.data().turf_name || d.id);
//       });

//       /* =====================================================
//          2️⃣ SINGLE FAST QUERY (ALL BOOKINGS)
//          Uses collectionGroup → NO listCollections()
//       ===================================================== */
//       const slotSnap = await db
//         .collectionGroup("court 1")
//         .limit(500) // ✅ safety cap (adjust if needed)
//         .get();

//       slotSnap.forEach(doc => {
//         const s = doc.data();

//         const paid = Number(s.paid_amount || 0);
//         const unpaid = Number(s.unpaid_amount || 0);
//         const cancelled = Boolean(s.cancelled);

//         /* =====================================================
//            3️⃣ NORMALIZED STATUS (SINGLE SOURCE OF TRUTH)
//         ===================================================== */
//         let booking_status: "paid" | "pending" | "cancelled";
//         if (cancelled) booking_status = "cancelled";
//         else if (unpaid > 0) booking_status = "pending";
//         else booking_status = "paid";

//         bookings.push({
//           booking_id: s.booking_id || doc.id,
//           booking_username: s.booking_username || "Guest",

//           turf_id: s.turf_id,
//           turf_name: turfMap.get(s.turf_id) || s.turf_name || "Unknown",

//           sport: s.booked_sports_name || s.sport,
//           court: s.court,
//           date: s.date,
//           slot_start_time: s.slot_start_time || doc.id,

//           paid_amount: paid,
//           unpaid_amount: unpaid,

//           booking_status,   // 🔥 UI FILTER FIELD
//           cancelled,        // 🔥 REPORTING FIELD

//           payment_initiated_time: s.payment_initiated_time || null,
//         });
//       });

//       /* =====================================================
//          4️⃣ RESPONSE
//       ===================================================== */
//       res.status(200).json({
//         success: true,
//         total: bookings.length,
//         bookings,
//       });
//     } catch (error: any) {
//       console.error("getRecentBookings ERROR:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }
// );
