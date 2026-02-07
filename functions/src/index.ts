import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import * as nodemailer from "nodemailer";

const corsHandler = cors({ origin: true });

// ✅ YOUR REAL CREDENTIALS
const FAST2SMS_API_KEY = "wIx43nX6L8QCiHSpskmyNZuqfohDec5aP9EzRFblj1YKrg0UvAg8QX9D3lSIik5qNtHRPeUGvjhFVnTw";
const GMAIL_USER = "developmentgateway111@gmail.com";
const GMAIL_APP_PASSWORD = "qzofgfvrjbjroqol";
const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

// ✅ Create Gmail transporter
const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

/* ================= SEND SMS via Fast2SMS ================= */
async function sendSMS(phone: string, message: string) {
  try {
    let cleanPhone = phone.replace(/\D/g, "");

    // ✅ Always force last 10 digits (India safe)
    cleanPhone = cleanPhone.slice(-10);

    logger.info(`📱 Sending SMS to: ${cleanPhone}`);

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

    const data = await res.json();
    logger.info("📨 Fast2SMS response:", data);

    if (!data.return) {
      throw new Error(data.message || "Fast2SMS failed");
    }

    return data;
  } catch (error: any) {
    logger.error("❌ SMS failed:", error.message);
    throw error;
  }
}


/* ================= SEND EMAIL via Gmail SMTP ================= */
async function sendEmailViaGmail(
  to: string,
  subject: string,
  textContent: string,
  htmlContent?: string
) {
  try {
    logger.info(`📧 Sending email to: ${to}`);
    logger.info(`📝 Subject: ${subject}`);

    const mailOptions = {
      from: {
        name: "Book Your Turf",
        address: GMAIL_USER,
      },
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent || textContent.replace(/\n/g, "<br>"),
    };

    const info = await gmailTransporter.sendMail(mailOptions);
    logger.info("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    logger.error("❌ Email Error:", error);
    throw new Error(`Email Error: ${error.message}`);
  }
}

/* ========== HELPER: Convert text message to HTML ========== */
function convertTextToHTML(textMessage: string): string {
  // Convert plain text booking message to nice HTML
  const lines = textMessage.split("\n");
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #28a745; margin-bottom: 20px;">🎉 Booking Confirmed!</h2>
  `;

  lines.forEach((line) => {
    if (line.trim()) {
      if (line.includes("Dear") || line.includes("Thank you")) {
        html += `<p style="margin: 10px 0;"><strong>${line}</strong></p>`;
      } else if (line.startsWith("•")) {
        html += `<p style="margin: 5px 0; padding-left: 20px;">${line}</p>`;
      } else if (line.includes(":")) {
        const [key, value] = line.split(":");
        html += `<p style="margin: 8px 0;"><strong>${key}:</strong> ${value}</p>`;
      } else {
        html += `<p style="margin: 8px 0;">${line}</p>`;
      }
    }
  });

  html += `
      </div>
      <p style="text-align: center; color: #666; margin-top: 20px; font-size: 12px;">
        This is an automated message from Book Your Turf
      </p>
    </div>
  `;

  return html;
}

/* ========== MAIN BOOKING NOTIFICATION FUNCTION ========== */
export const sendBookingNotifications = onRequest(
  { region: "asia-south1", cors: true, timeoutSeconds: 60 },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const data = req.body.data || req.body;

        const {
          userPhone,
          userEmail,
          partnerPhone,
          partnerEmail,
          smsMessage,
          emailMessage,
        } = data;

        logger.info("📦 Notification Payload:", data);

        const results: any[] = [];
        let successCount = 0;

        // ===== USER SMS =====
        if (userPhone && smsMessage) {
          try {
            await sendSMS(userPhone, smsMessage);
            results.push({ type: "SMS_USER", status: "success" });
            successCount++;
          } catch (e: any) {
            results.push({ type: "SMS_USER", status: "failed", error: e.message });
          }
        }

        // ===== OWNER SMS =====
        if (partnerPhone && smsMessage && partnerPhone !== userPhone) {
          try {
            await sendSMS(partnerPhone, smsMessage);
            results.push({ type: "SMS_OWNER", status: "success" });
            successCount++;
          } catch (e: any) {
            results.push({ type: "SMS_OWNER", status: "failed", error: e.message });
          }
        }

        // ===== USER EMAIL =====
        if (userEmail && emailMessage) {
          try {
            await sendEmailViaGmail(
              userEmail,
              "Booking Confirmed - Book Your Turf",
              emailMessage,
              convertTextToHTML(emailMessage)
            );
            results.push({ type: "EMAIL_USER", status: "success" });
            successCount++;
          } catch (e: any) {
            results.push({ type: "EMAIL_USER", status: "failed", error: e.message });
          }
        }

        // ===== OWNER EMAIL =====
        if (partnerEmail && emailMessage && partnerEmail !== userEmail) {
          try {
            await sendEmailViaGmail(
              partnerEmail,
              "New Booking Received - Book Your Turf",
              emailMessage,
              convertTextToHTML(emailMessage)
            );
            results.push({ type: "EMAIL_OWNER", status: "success" });
            successCount++;
          } catch (e: any) {
            results.push({ type: "EMAIL_OWNER", status: "failed", error: e.message });
          }
        }

        if (successCount === 0) {
          return res.status(500).json({
            success: false,
            message: "All notifications failed",
            results,
          });
        }

        return res.status(200).json({
          success: true,
          results,
        });
      } catch (err: any) {
        logger.error("❌ Notification crash:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
    });
  }
);





// Export other functions
export {
  createWebRazorpayOrder,
  verifyWebRazorpayPayment,
} from "./razorpayWeb";
export { cancelWebBooking } from "./cancelWebBooking";