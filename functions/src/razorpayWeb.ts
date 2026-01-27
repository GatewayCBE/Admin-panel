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

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

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
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).toLowerCase();
};

const isNightSlot = (slot: string) => {
  if (/pm$/i.test(slot)) return true;
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
   🔔 FCM NOTIFICATION HELPER
========================================================= */
async function sendNotification(
  token: string | undefined,
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  if (!token) return;

  await admin.messaging().send({
    token,
    notification: { title, body },
    data,
    android: { priority: "high" },
    apns: { payload: { aps: { sound: "default" } } },
  });
}

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

        if (!turf_id || !turf_name || !sport || !date || !Array.isArray(slots) || !slots.length) {
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
        const pricing = turfSnap.data()?.sport_specific_price?.[sport]?.[weekday];
        if (!pricing) return res.status(400).json({ error: "PRICING_NOT_CONFIGURED" });

        let slotTotal = 0;
        for (const rawSlot of slots) {
          const slot = normalizeSlotTime(rawSlot);
          slotTotal += isNightSlot(slot)
            ? Number(pricing.night)
            : Number(pricing.day);
        }

        const serviceFee = 10 * slots.length;
        const totalAmount = slotTotal + serviceFee;
        const paidAmount = payment_type === "advance" ? slots.length : totalAmount;

        const razorpay = new Razorpay({
          key_id: RAZORPAY_KEY_ID!,
          key_secret: RAZORPAY_KEY_SECRET!,
        });

        const order = await razorpay.orders.create({
          amount: paidAmount * 100,
          currency: "INR",
          receipt: `BS_${turf_name}_${Date.now()}`,
          payment_capture: true,
        });

        return res.status(200).json({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: RAZORPAY_KEY_ID,
          pricing: {
            slot_total: slotTotal,
            service_fee: serviceFee,
            total_amount: totalAmount,
            paid_amount: paidAmount,
            unpaid_amount: totalAmount - paidAmount,
          },
        });
      } catch (err) {
        console.error("❌ createWebRazorpayOrder:", err);
        return res.status(500).json({ error: "CREATE_ORDER_FAILED" });
      }
    });
  }
);

/* =========================================================
   2️⃣ VERIFY PAYMENT & FINALIZE BOOKING + NOTIFICATIONS
========================================================= */
export const verifyWebRazorpayPayment = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
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
          sport,
          court,
          slots,
          date,
          payment_type,
        } = req.body;

        const formattedDate = formatDate(date);
        const normalizedCourt = court?.trim() || "court 1";

        if (!user_mobile_number || !turf_id || !slots?.length) {
          return res.status(400).json({ error: "INVALID_REQUEST" });
        }

        const generatedSignature = crypto
          .createHmac("sha256", RAZORPAY_KEY_SECRET!)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest("hex");

        if (generatedSignature !== razorpay_signature) {
          return res.status(401).json({ error: "INVALID_SIGNATURE" });
        }

        const userRef = db
          .collection("environment").doc("testing")
          .collection("users").doc(user_mobile_number);

        const turfRef = db
          .collection("environment").doc("testing")
          .collection("turfs").doc(turf_id);

        const result = await db.runTransaction(async (tx) => {
          const userSnap = await tx.get(userRef);
          const turfSnap = await tx.get(turfRef);

          if (!userSnap.exists) throw new Error("USER_NOT_FOUND");
          if (!turfSnap.exists) throw new Error("TURF_NOT_FOUND");

          const weekday = getWeekday(date);
          const pricing = turfSnap.data()?.sport_specific_price?.[sport]?.[weekday];
          if (!pricing) throw new Error("PRICING_NOT_CONFIGURED");

          let slotTotal = 0;
          for (const slot of slots) {
            slotTotal += isNightSlot(slot)
              ? Number(pricing.night)
              : Number(pricing.day);
          }

          const serviceFee = 10 * slots.length;
          const totalAmount = slotTotal + serviceFee;
          const paidAmount = payment_type === "advance" ? slots.length : totalAmount;
          const unpaidAmount = totalAmount - paidAmount;

          const bookingId = `BS_${turf_name}_${Date.now()}`;

          for (const rawSlot of slots) {
            const slot = normalizeSlotTime(rawSlot);
            const slotRef = db
              .collection("environment").doc("testing")
              .collection("all_turfs_slot_booking")
              .doc(turf_id)
              .collection(formattedDate)
              .doc(sport)
              .collection(normalizedCourt)
              .doc(slot);

            if ((await tx.get(slotRef)).exists) {
              throw new Error("SLOT_ALREADY_BOOKED");
            }

            tx.set(slotRef, {
              booking_id: bookingId,
              booking_username: user_name,
              user_id,
              booked_sports_name: sport,
              court,
              date: formattedDate,
              slot_start_time: slot,
              day_price: pricing.day,
              night_price: pricing.night,
              total_amount: totalAmount,
              paid_amount: paidAmount,
              unpaid_amount: unpaidAmount,
              payment_status: "paymentSuccess",
              payment_transaction_id: razorpay_payment_id,
              payment_completed_time: new Date().toISOString(),
              payment_initiated_time: new Date().toISOString(),
              turf_id,
              turf_name,
              owner_id,
              turf_closed: false,
              platform: "web",
            });
          }

          tx.update(userRef, {
            payment_copies: admin.firestore.FieldValue.arrayUnion({
              booking_id: bookingId,
              turf_id,
              turf_name,
              court,
              sport,
              date,
              slots,
              total_amount: totalAmount,
              paid_amount: paidAmount,
              unpaid_amount: unpaidAmount,
              payment_status: "paymentSuccess",
              payment_transaction_id: razorpay_payment_id,
              platform: "web",
            }),
          });

          return { success: true, booking_id: bookingId };
        });

        /* =====================================================
           🔔 SEND NOTIFICATIONS (OUTSIDE TRANSACTION)
        ===================================================== */
        try {
          const userSnap = await userRef.get();
          const ownerSnap = await db
            .collection("environment").doc("testing")
            .collection("owners").doc(owner_id)
            .get();

          const userTokens: string[] = userSnap.data()?.fcm_tokens || [];
const ownerTokens: string[] = ownerSnap.data()?.fcm_tokens || [];

// 🔔 Notify User (ALL DEVICES)
for (const token of userTokens) {
  await sendNotification(
    token,
    "🎉 Booking Confirmed",
    `Your slot at ${turf_name} on ${formattedDate} is confirmed.`,
    { booking_id: result.booking_id }
  );
}

// 🔔 Notify Owner (ALL DEVICES)
for (const token of ownerTokens) {
  await sendNotification(
    token,
    "📢 New Booking",
    `${user_name} booked ${sport} (${normalizedCourt}) on ${formattedDate}.`,
    { booking_id: result.booking_id }
  );
}
        } catch (e) {
          console.error("⚠️ Notification failed:", e);
        }

        return res.status(200).json(result);
      } catch (err: any) {
        console.error("❌ verifyWebRazorpayPayment:", err.message);
        return res.status(400).json({
          error: "Payment verification failed",
          reason: err.message,
        });
      }
    });
  }
);
