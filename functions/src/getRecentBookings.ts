import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();

export const getRecentBookings = onRequest(
  {
    region: "asia-south1",
    cors: true,
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (req, res): Promise<void> => {
    try {
      let bookings: any[] = [];

      // Get turf IDs
      const turfDocs = await db.collection("environment/testing/turfs").get();
      const turfIds = turfDocs.docs.map((d) => d.id);

      for (const turfId of turfIds) {
        // Loop all date collections inside turf
        const dateCollections = await db
          .collection("environment/testing/all_turfs_slot_booking")
          .doc(turfId)
          .listCollections();

        for (const dateCol of dateCollections) {
          const dateId = dateCol.id;

          // Loop sports in date
          const sportsDocs = await dateCol.listDocuments();

          for (const sportDoc of sportsDocs) {
            const sport = sportDoc.id;
            const sportData = (await sportDoc.get()).data() || {};
            const courts: string[] = sportData.courts || []; // use courts array

            // Loop all courts
            for (const court of courts) {
              const slotsSnapshot = await sportDoc
                .collection(court)
                .orderBy("payment_initiated_time", "desc")
                .get();

              slotsSnapshot.forEach((slotDoc) => {
                const slotData = slotDoc.data();

                bookings.push({
                  booking_id: slotDoc.id,
                  turfId,
                  date: dateId,
                  sport,
                  court,
                  slot_start_time: slotData.slot_start_time || slotDoc.id,
                  booking_username: slotData.booking_username || "Unknown",
                  paid_amount: slotData.paid_amount || 0,
                  unpaid_amount: slotData.unpaid_amount || 0,
                  payment_status: slotData.payment_status || "unknown",
                  payment_initiated_time: slotData.payment_initiated_time,
                  ...slotData,
                });
              });
            }
          }
        }
      }

      // Sort newest → oldest
      bookings.sort((a, b) => {
        const ta = new Date(a.payment_initiated_time || "").getTime() || 0;
        const tb = new Date(b.payment_initiated_time || "").getTime() || 0;
        return tb - ta;
      });

      // ⚠ DO NOT return `res.json(...)`
      res.status(200).json({
        success: true,
        total: bookings.length,
        bookings,
      });
    } catch (error: any) {
      console.error("getRecentBookings ERROR:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);
