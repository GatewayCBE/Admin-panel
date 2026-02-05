import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

const FAST2SMS_API_KEY = "wIx43nX6L8QCiHSpskmyNZuqfohDec5aP9EzRFblj1YKrg0UvAg8QX9D3lSIik5qNtHRPeUGvjhFVnTw";
const SENDGRID_API_KEY = "wIx43nX6L8QCiHSpskmyNZuqfohDec5aP9EzRFblj1YKrg0UvAg8QX9D3lSIik5qNtHRPeUGvjhFVnTw";

const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

/* ================= SEND SMS ================= */
async function sendSMS(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");

  const res = await fetch(FAST2SMS_URL, {
    method: "POST",
    headers: {
      authorization: FAST2SMS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q",
      message,
      language: "english",
      flash: 0,
      numbers: cleanPhone,
    }),
  });

  return res.json();
}

/* ================= SEND EMAIL ================= */
async function sendEmail(to: string, subject: string, text: string) {
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "noreply@bookyourturf.com" },
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });
}

/* ========== MAIN BOOKING NOTIFICATION FUNCTION ========== */
export const sendBookingNotifications = onCall(async (request) => {
  try {
    const {
      userPhone,
      userEmail,
      partnerPhone,
      partnerEmail,
      smsMessage,
      emailMessage,
    } = request.data;

    const tasks: Promise<any>[] = [];

    if (userPhone) tasks.push(sendSMS(userPhone, smsMessage));
    if (partnerPhone) tasks.push(sendSMS(partnerPhone, smsMessage));

    if (userEmail)
      tasks.push(sendEmail(userEmail, "Booking Confirmed", emailMessage));

    if (partnerEmail)
      tasks.push(sendEmail(partnerEmail, "New Booking Received", emailMessage));

    await Promise.all(tasks);

    logger.info("Notifications sent successfully");
    return { success: true };
  } catch (err: any) {
    logger.error("Notification error", err);
    throw new Error(err.message);
  }
});
export { createWebRazorpayOrder } from "./razorpayWeb";
export { verifyWebRazorpayPayment } from "./razorpayWeb";
export { cancelWebBooking } from "./cancelWebBooking";

// Used by mobile app team (keep export so Firebase doesn't delete it)
// export { sendBookingNotifications } from "./sendBookingNotifications";
