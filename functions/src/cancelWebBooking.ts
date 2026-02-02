import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/* =========================================================
   ❌ CANCEL BOOKING (WEB / ADMIN) – SINGLE PATH, CLEANED
========================================================= */
export const cancelWebBooking = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { bookingId, reason } = req.body;

        if (!bookingId) {
          return res.status(400).json({ error: "BOOKING_ID_REQUIRED" });
        }

        const bookingRef = db
          .collection("environments")
          .doc("testing")
          .collection("bookings")
          .doc(bookingId);

        const snap = await bookingRef.get();
        if (!snap.exists) {
          return res.status(404).json({ error: "BOOKING_NOT_FOUND" });
        }

        const booking = snap.data()!;
        const now = admin.firestore.Timestamp.now();

        console.log("🛑 Cancelling booking:", bookingId, booking);

        // Optional: prevent double-cancellation
        if (booking.paymentStatus === "CANCELLED") {
          return res.status(400).json({ error: "ALREADY_CANCELLED" });
        }

        // Update the only document we care about
        await bookingRef.update({
          paymentStatus: "CANCELLED",
          cancelledAt: now,
          cancelledBy: "OWNER",           // change to dynamic value if you pass UID
          cancelledReason: reason || null,
          // Optional: preserve original payment info for audit/refund
          originalPaidAmount: booking.paidAmount ?? booking.paid_amount ?? 0,
          originalUnpaidAmount: booking.unpaidAmount ?? booking.unpaid_amount ?? 0,
        });

        return res.json({
          success: true,
          message: "Booking cancelled successfully. Slot is now available again."
        });

      } catch (err: any) {
        console.error("❌ cancelWebBooking FAILED:", err);
        return res.status(500).json({ error: err.message || "Internal server error" });
      }
    });
  }
);