import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Razorpay from "razorpay";
import * as crypto from "crypto";
import cors from "cors";

const corsHandler = cors({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

/* =========================================================
   🔧 HELPERS
========================================================= */
const formatDate = (dateInput: string) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) throw new Error("INVALID_DATE");

  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const getWeekday = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new Error("INVALID_DATE");
  return d
    .toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    })
    .toLowerCase();
};

const isNightSlot = (slot: string) => {
  const hour = parseInt(slot.split(":")[0], 10);
  return hour >= 18 || hour < 6;
};

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
   1️⃣ CREATE RAZORPAY ORDER (WEB)
========================================================= */
export const createWebRazorpayOrder = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        const { turf_id, turf_name, sport, date, slots, payment_type } = req.body;

        if (!turf_id || !turf_name || !sport || !date || !Array.isArray(slots)) {
          return res.status(400).json({ error: "INVALID_REQUEST" });
        }

        const turfSnap = await db
          .collection("environment")
          .doc("testing")
          .collection("turfs")
          .doc(turf_id)
          .get();

        if (!turfSnap.exists) {
          return res.status(404).json({ error: "TURF_NOT_FOUND" });
        }

        const weekday = getWeekday(date);
        const pricing =
          turfSnap.data()?.sport_specific_price?.[sport]?.[weekday];

        if (!pricing) {
          return res.status(400).json({ error: "PRICING_NOT_CONFIGURED" });
        }

        let totalAmount = 0;
        for (const rawSlot of slots) {
          const slot = normalizeSlotTime(rawSlot);
          totalAmount += isNightSlot(slot)
            ? Number(pricing.night)
            : Number(pricing.day);
        }

        const paidAmount =
          payment_type === "advance" ? slots.length : totalAmount;

        const razorpay = new Razorpay({
          key_id: RAZORPAY_KEY_ID,
          key_secret: RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
          amount: paidAmount * 100,
          currency: "INR",
          receipt: `BYT_${turf_name}_${Date.now()}`,
          payment_capture: true,
        });

        return res.status(200).json({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: RAZORPAY_KEY_ID,
          pricing: {
            totalAmount,
            paidAmount,
            balanceAmount: totalAmount - paidAmount,
          },
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "CREATE_ORDER_FAILED" });
      }
    });
  }
);

/* =========================================================
   2️⃣ VERIFY PAYMENT & FINALIZE BOOKING (FIXED)
========================================================= */
export const verifyWebRazorpayPayment = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        console.log("🔔 verifyWebRazorpayPayment called");
        console.log("📥 Request body:", JSON.stringify(req.body, null, 2));

        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          turf_id,
          turf_name,
          owner_id,
          user_id,
          user_name,
          user_mobile_number,
          user_email,
          sport,
          court,
          slots,
          date,
          payment_type,
        } = req.body;

        if (!turf_id || !Array.isArray(slots) || !slots.length || !user_mobile_number) {
          console.error("❌ INVALID_REQUEST", { turf_id, slots, user_mobile_number });
          return res.status(400).json({ error: "INVALID_REQUEST" });
        }

        const formattedDate = formatDate(date);
        const normalizedCourt = court?.trim() || "court 1";

        console.log("📅 Raw date:", date);
        console.log("📅 Formatted date:", formattedDate);
        console.log("⏱ Slots:", slots);

        const generatedSignature = crypto
          .createHmac("sha256", RAZORPAY_KEY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");

        if (generatedSignature !== razorpay_signature) {
          console.error("❌ INVALID_SIGNATURE");
          return res.status(401).json({ error: "INVALID_SIGNATURE" });
        }

        const bookingId = `BYT_U_${Date.now()}`;
        console.log("🆔 Generated bookingId:", bookingId);

        const baseRef = db.collection("environments").doc("testing");

        const userRef = baseRef
          .collection("users")
          .doc(user_mobile_number);

        const turfRef = baseRef
          .collection("turfs")
          .doc(turf_id);

        const bookingRef = baseRef
          .collection("bookings")
          .doc(bookingId);

        const userPaymentCopyRef = baseRef
          .collection("users")
          .doc(user_mobile_number)
          .collection("payment_coppys")
          .doc(bookingId);

        const result = await db.runTransaction(async (tx) => {
          console.log("🔄 Transaction started");

          const userSnap = await tx.get(userRef);
          const turfSnap = await tx.get(turfRef);

          if (!userSnap.exists) throw new Error("USER_NOT_FOUND");
          if (!turfSnap.exists) throw new Error("TURF_NOT_FOUND");

          const weekday = getWeekday(date);
          const pricing =
            turfSnap.data()?.sport_specific_price?.[sport]?.[weekday];

          if (!pricing) throw new Error("PRICING_NOT_CONFIGURED");

          const slotRefs = slots.map((rawSlot: string) => {
            const slot = normalizeSlotTime(rawSlot);

            const ref = baseRef
              .collection("all_turfs_slot_booking")
              .doc(turf_id)
              .collection(formattedDate)
              .doc(sport)
              .collection(normalizedCourt)
              .doc(slot);

            console.log("🧩 Slot ref:", ref.path);
            return ref;
          });

          const slotSnaps = await Promise.all(slotRefs.map(ref => tx.get(ref)));
          slotSnaps.forEach((snap) => {
            if (snap.exists) throw new Error("SLOT_ALREADY_BOOKED");
          });

          let totalAmount = 0;
          for (const rawSlot of slots) {
            const slot = normalizeSlotTime(rawSlot);
            totalAmount += isNightSlot(slot)
              ? Number(pricing.night)
              : Number(pricing.day);
          }

          const paidAmount =
            payment_type === "advance" ? slots.length : totalAmount;

          const balanceAmount = totalAmount - paidAmount;
          const now = admin.firestore.Timestamp.now();

          console.log("💰 Amounts", { totalAmount, paidAmount, balanceAmount });

          tx.set(bookingRef, {
            bookingId,
            bookingType: payment_type === "advance" ? "ADVANCE" : "FULL",
            turfId: turf_id,
            turfName: turf_name,
            ownerId: owner_id,
            userId: user_id,
            userName: user_name,
            userMobile: user_mobile_number,
            userEmail: user_email || null,
            selectedDate: formattedDate,
            slots,
            slotList: slots,
            slotCount: slots.length,
            slotStartTime: slots[0],
            slotEndTime: slots[slots.length - 1],
            totalAmount,
            paidAmount,
            balanceAmount,
            paymentId: razorpay_payment_id,
            paymentMethod: "Razorpay",
            paymentStatus: "PAID",
            createdAt: now,
            updatedAt: now,
          });

          slotRefs.forEach((ref, i) => {
            tx.set(ref, {
              bookingId,
              turfId: turf_id,
              court: normalizedCourt,
              sport: sport,
              slot: normalizeSlotTime(slots[i]),
              date: formattedDate,
              ownerId: owner_id,
              userId: user_id,
              createdAt: now,
            });
          });

          tx.set(userPaymentCopyRef, {
            bookingId,
            turfId: turf_id,
            turfName: turf_name,
            selectedDate: formattedDate,
            slotList: slots,
            slotCount: slots.length,
            totalAmount,
            paidAmount,
            unpaidAmount: balanceAmount,
            paymentStatus: "PAID",
            bookingType: payment_type === "advance" ? "ADVANCE" : "FULL",
            userName: user_name,
            userMobile: user_mobile_number,
            createdAt: now,
          });

          console.log("✅ Transaction writes prepared");
          return { success: true, bookingId };
        });

        console.log("🎉 Booking completed:", result);
        return res.status(200).json(result);

      } catch (err: any) {
        console.error("❌ verifyWebRazorpayPayment FAILED:", err);
        return res.status(400).json({
          error: "PAYMENT_VERIFICATION_FAILED",
          reason: err.message,
        });
      }
    });
  }
);
