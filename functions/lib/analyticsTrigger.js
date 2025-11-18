// "use strict";
// var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
//     if (k2 === undefined) k2 = k;
//     var desc = Object.getOwnPropertyDescriptor(m, k);
//     if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
//       desc = { enumerable: true, get: function() { return m[k]; } };
//     }
//     Object.defineProperty(o, k2, desc);
// }) : (function(o, m, k, k2) {
//     if (k2 === undefined) k2 = k;
//     o[k2] = m[k];
// }));
// var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
//     Object.defineProperty(o, "default", { enumerable: true, value: v });
// }) : function(o, v) {
//     o["default"] = v;
// });
// var __importStar = (this && this.__importStar) || (function () {
//     var ownKeys = function(o) {
//         ownKeys = Object.getOwnPropertyNames || function (o) {
//             var ar = [];
//             for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
//             return ar;
//         };
//         return ownKeys(o);
//     };
//     return function (mod) {
//         if (mod && mod.__esModule) return mod;
//         var result = {};
//         if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
//         __setModuleDefault(result, mod);
//         return result;
//     };
// })();
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.analyticsTrigger = void 0;
// const firestore_1 = require("firebase-functions/v2/firestore");
// const admin = __importStar(require("firebase-admin"));
// if (admin.apps.length === 0) {
//     admin.initializeApp();
// }
// const db = admin.firestore();
// /**
//  * 📊 Cloud Function: analyticsTrigger
//  * Triggered when a new slot is created in all_turfs_slot_booking.
//  *
//  * ✅ Updates analytics inside:
//  * /environment/testing/analytics/
//  * ├── global
//  * ├── daily/{dateId}
//  * └── turf/{turfId}
//  */
// exports.analyticsTrigger = (0, firestore_1.onDocumentCreated)({
//     region: "asia-south1",
//     document: "environment/testing/all_turfs_slot_booking/{turfId}/{dateId}/{sport}/{court}/{time}",
// }, async (event) => {
//     const { turfId, dateId } = event.params;
//     const slotData = event.data?.data();
//     if (!slotData) {
//         console.warn("⚠️ No slot data found, skipping analytics update.");
//         return;
//     }
//     console.log("🧩 Slot data received:", slotData);
//     // ✅ Accept both "Paid" and "paymentSuccess"
//     const validStatuses = ["Paid", "paymentSuccess"];
//     if (!validStatuses.includes(slotData.payment_status)) {
//         console.log(`🟡 Skipping analytics (payment_status = ${slotData.payment_status})`);
//         return;
//     }
//     // ✅ Correct field for amount
//     const amount = slotData.paid_amount || slotData.amount || 0;
//     console.log(`📊 [analyticsTrigger] Updating analytics for Turf=${turfId}, Date=${dateId}, Amount=${amount}`);
//     const analyticsBatch = db.batch();
//     try {
//         // ✅ Define analytics base path under environment/testing
//         const basePath = `environment/testing/analytics`;
//         // 1️⃣ Global analytics
//         const globalRef = db.doc(`${basePath}/global`);
//         analyticsBatch.set(globalRef, {
//             total_revenue: admin.firestore.FieldValue.increment(amount),
//             total_bookings: admin.firestore.FieldValue.increment(1),
//             last_updated: admin.firestore.FieldValue.serverTimestamp(),
//         }, { merge: true });
//         // 2️⃣ Daily analytics
//         const dailyRef = db.doc(`${basePath}/daily/${dateId}`);
//         analyticsBatch.set(dailyRef, {
//             date: dateId,
//             total_revenue: admin.firestore.FieldValue.increment(amount),
//             total_bookings: admin.firestore.FieldValue.increment(1),
//             last_updated: admin.firestore.FieldValue.serverTimestamp(),
//         }, { merge: true });
//         // 3️⃣ Turf-level analytics
//         const turfRef = db.doc(`${basePath}/turf/${turfId}`);
//         analyticsBatch.set(turfRef, {
//             turf_id: turfId,
//             total_revenue: admin.firestore.FieldValue.increment(amount),
//             total_bookings: admin.firestore.FieldValue.increment(1),
//             last_updated: admin.firestore.FieldValue.serverTimestamp(),
//         }, { merge: true });
//         await analyticsBatch.commit();
//         console.log("Analytics updated successfully");
//     }
//     catch (error) {
//         console.error("Error updating analytics:", error);
//     }
// });
