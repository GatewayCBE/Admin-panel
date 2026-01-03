import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import Razorpay from "razorpay";
// import * as crypto from "crypto";
import cors from "cors";

const corsHandler = cors({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/* =========================================================
   🔐 Load Razorpay keys (SAFE at top-level)
   ========================================================= */
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/* =========================================================
   1️⃣ CREATE RAZORPAY ORDER (WEB)
   ========================================================= */
export const createWebRazorpayOrder = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
          return res.status(500).json({
            error: "Server configuration error (Razorpay keys missing)",
          });
        }

        const { turf_id, slots, payment_type } = req.body;

        console.log("🔥 createWebRazorpayOrder CALLED");
        console.log("🔥 turf_id:", turf_id);

        if (!turf_id || !Array.isArray(slots) || slots.length === 0) {
          return res.status(400).json({ error: "Invalid request payload" });
        }

        console.log(
          "🔥 Reading Firestore path: environment/testing/turfs/",
          turf_id
        );

        /* 🔒 Server-side pricing */
        const turfSnap = await db
          .collection("environment")
          .doc("testing")
          .collection("turfs")
          .doc(turf_id)
          .get();

        console.log("🔥 turfSnap.exists =", turfSnap.exists);

        if (!turfSnap.exists) {
          return res.status(404).json({ error: "Turf not found" });
        }

        const pricePerSlot = turfSnap.data()!.slot_price;
        const totalAmount = pricePerSlot * slots.length;
        const advanceAmount = slots.length * 1;

        const payableAmount =
          payment_type === "advance" ? advanceAmount : totalAmount;

        /* ✅ Razorpay instance (LAZY INIT — THIS IS CRITICAL) */
        const razorpay = new Razorpay({
          key_id: RAZORPAY_KEY_ID,
          key_secret: RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
          amount: payableAmount * 100, // paise
          currency: "INR",
          receipt: `WEB_${turf_id}_${Date.now()}`,
          payment_capture: true,
        });

        return res.status(200).json({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: RAZORPAY_KEY_ID, // safe to expose
        });
      } catch (error) {
        console.error("❌ createWebRazorpayOrder:", error);
        return res.status(500).json({ error: "Failed to create order" });
      }
    });
  }
);

/* =========================================================
   2️⃣ VERIFY PAYMENT & FINALIZE BOOKING (WEB)
   ========================================================= */
export const verifyWebRazorpayPayment = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        if (!RAZORPAY_KEY_SECRET) {
          return res.status(500).json({
            error: "Server configuration error (Razorpay key missing)",
          });
        }

        const {
          // razorpay_order_id,
          razorpay_payment_id,
          // razorpay_signature,

          turf_id,
          turf_name,
          owner_id,
          user_id,
          user_name,
          user_mobile_number,

          slots,
          court,
          sport,
          date,
          payment_type,
        } = req.body;

        // ---- Normalize date (CRITICAL FIX)
const normalizedDate =
  typeof date === "string"
    ? date
    : date instanceof Date
    ? date.toISOString().split("T")[0]
    : "";

// ---- Normalize court
const courtLabel =
  typeof court === "number" ? `court ${court}` : court;

// ---- Validate ALL path segments
assertPath("USER_MOBILE", user_mobile_number);
assertPath("TURF_ID", turf_id);
assertPath("DATE", normalizedDate);
assertPath("SPORT", sport);
assertPath("COURT", courtLabel);

        /* ===============================
           1️⃣ Verify Razorpay signature
           =============================== */
        // const generatedSignature = crypto
        //   .createHmac("sha256", RAZORPAY_KEY_SECRET)
        //   .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        //   .digest("hex");

        // if (generatedSignature !== razorpay_signature) {
        //   return res.status(401).json({ error: "Invalid payment signature" });
        // }

        /* ===============================
           2️⃣ Normalize values
           =============================== */

        if (!turf_id || !sport || !date || !slots?.length || !courtLabel) {
          return res.status(400).json({ error: "Invalid booking data" });
        }

        function assertPath(label: string, value: any) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`INVALID_PATH_${label}`);
  }
}

        const userRef = db
          .collection("environment")
          .doc("testing")
          .collection("users")
          .doc(user_mobile_number);

        /* ===============================
           3️⃣ Firestore Transaction
           =============================== */
        const result = await db.runTransaction(async (tx) => {
          // ---- User existence
          const userSnap = await tx.get(userRef);
          if (!userSnap.exists) {
            throw new Error("USER_NOT_FOUND");
          }

          // ---- Idempotency check
          const paymentCopies = userSnap.data()?.payment_copies || [];
          const alreadyExists = paymentCopies.some(
            (p: any) =>
              p.payment_transaction_id === razorpay_payment_id
          );

          if (alreadyExists) {
            return { success: true, duplicate: true };
          }

          // ---- Turf pricing
          const turfSnap = await db
            .collection("environment")
            .doc("testing")
            .collection("turfs")
            .doc(turf_id)
            .get();

          if (!turfSnap.exists) {
            throw new Error("TURF_NOT_FOUND");
          }

          const pricePerSlot = turfSnap.data()!.slot_price;
          const totalAmount = pricePerSlot * slots.length;
          const advanceAmount = slots.length * 1;

          const paidAmount =
            payment_type === "advance" ? advanceAmount : totalAmount;

          const unpaidAmount =
            payment_type === "advance"
              ? totalAmount - advanceAmount
              : 0;

          const bookingId = `WEB_${turf_id}_${Date.now()}`;

          /* ===============================
             4️⃣ SLOT LOCK (MOBILE STRUCTURE)
             =============================== */
          for (const slotStart of slots) {
  if (typeof slotStart !== "string") {
    throw new Error("INVALID_SLOT_VALUE");
  }

  const slotKey = slotStart.replace(/\s/g, "");
  assertPath("SLOT_KEY", slotKey);

            const slotRef = db
              .collection("environment")
              .doc("testing")
              .collection("all_turfs_slot_booking")
              .doc(turf_id)
              .collection(normalizedDate)
              .doc(sport)
              .collection("courts")
              .doc(courtLabel)
              .collection("slots")
              .doc(slotKey);

            const slotSnap = await tx.get(slotRef);
            if (slotSnap.exists) {
              throw new Error("SLOT_ALREADY_BOOKED");
            }

            tx.set(slotRef, {
              booking_id: bookingId,
              turf_id,
              turf_name,
              owner_id,
              user_id,
              booking_username: user_name,
              booked_sports_name: sport,
              court: courtLabel,
              date,
              slot_start_time: slotStart,
              paid_amount: paidAmount,
              unpaid_amount: unpaidAmount,
              total_amount: totalAmount,
              payment_status: "paymentSuccess",
              payment_transaction_id: razorpay_payment_id,
              payment_initiated_time: new Date().toISOString(),
              platform: "web",
              created_at: admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          /* ===============================
             5️⃣ USER PAYMENT COPY
             =============================== */
          tx.update(userRef, {
            payment_copies: admin.firestore.FieldValue.arrayUnion({
              booking_id: bookingId,
              turf_id,
              turf_name,
              owner_id,
              user_id,
              booking_username: user_name,
              booked_sports_name: sport,
              court: courtLabel,
              date,
              slots,
              total_amount: totalAmount,
              paid_amount: paidAmount,
              unpaid_amount: unpaidAmount,
              payment_status: "paymentSuccess",
              payment_transaction_id: razorpay_payment_id,
              payment_initiated_time: new Date().toISOString(),
              platform: "web",
            }),
          });

          return { success: true, booking_id: bookingId };
        });

        return res.status(200).json(result);
      } catch (error: any) {
        console.error("verifyWebRazorpayPayment FAILED:", error);

        if (error.message === "SLOT_ALREADY_BOOKED") {
          return res
            .status(409)
            .json({ error: "One or more slots already booked" });
        }

        if (error.message === "USER_NOT_FOUND") {
          return res.status(404).json({ error: "User not found" });
        }

        return res
          .status(500)
          .json({ error: "Payment verification failed" });
      }
    });
  }
);

