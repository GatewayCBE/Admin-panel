import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/* =========================================================
   🔧 HELPERS
========================================================= */
const normalizeSlotTime = (slot: string): string => {
  if (/^\d{2}:\d{2}$/.test(slot)) return slot;

  const match = slot.match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) throw new Error(`INVALID_SLOT_FORMAT: ${slot}`);

  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const meridian = match[3].toUpperCase();

  if (meridian === "PM" && hour !== 12) hour += 12;
  if (meridian === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minute}`;
};

/* =========================================================
   ❌ CANCEL BOOKING (WEB / ADMIN) – FINAL
========================================================= */
export const cancelWebBooking = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { bookingId } = req.body;

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

        console.log("🛑 Cancel request for booking:", booking);

        const batch = db.batch();

        /* 1️⃣ Cancel main booking */
        batch.update(bookingRef, {
          paymentStatus: "CANCELLED",
          cancelledAt: now,
        });

        /* 2️⃣ Cancel user copy (safe) */
        if (typeof booking.userMobile === "string" && booking.userMobile.trim()) {
          const userCopyRef = db
            .collection("environments")
            .doc("testing")
            .collection("users")
            .doc(booking.userMobile)
            .collection("payment_coppys")
            .doc(bookingId);

          batch.update(userCopyRef, {
            paymentStatus: "CANCELLED",
            cancelledAt: now,
          });
        } else {
          console.warn("⚠️ userMobile missing, user copy not updated");
        }

        /* 3️⃣ Free slots ONLY if ALL required fields exist */
        const turfId = booking.turfId;
        const date = booking.selectedDate;
        const sport = booking.sport; // ❗ missing in your data
        const court = booking.court || "court 1";
        const slots: string[] = booking.slotList || [];

        const canFreeSlots =
          typeof turfId === "string" &&
          typeof date === "string" &&
          typeof sport === "string" &&
          sport.trim() !== "" &&
          Array.isArray(slots) &&
          slots.length > 0;

        if (!canFreeSlots) {
          console.warn("⚠️ Slot release skipped due to missing data", {
            turfId,
            date,
            sport,
            court,
            slots,
          });
        } else {
          for (const rawSlot of slots) {
            const slot = normalizeSlotTime(rawSlot);

            const slotRef = db
              .collection("environment")
              .doc("testing")
              .collection("all_turfs_slot_booking")
              .doc(turfId)
              .collection(date)
              .doc(sport)
              .collection(court)
              .doc(slot);

            batch.delete(slotRef);
          }
        }

        await batch.commit();

        return res.json({
          success: true,
          slotFreed: canFreeSlots,
        });
      } catch (err: any) {
        console.error("❌ cancelWebBooking FAILED:", err);
        return res.status(500).json({ error: err.message });
      }
    });
  }
);
