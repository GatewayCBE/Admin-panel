import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const saveFcmToken = onRequest(
  { region: "asia-south1" },
  async (req, res): Promise<void> => {
    return corsHandler(req, res, async () => {
      try {
        if (req.method !== "POST") {
          res.status(405).json({ error: "Method not allowed" });
          return;
        }

        const { role, userId, token } = req.body;

        if (!role || !userId || !token) {
          res.status(400).json({ error: "INVALID_REQUEST" });
          return;
        }

        const ref = db
          .collection("environment")
          .doc("testing")
          .collection(role === "owner" ? "owners" : "users")
          .doc(userId);

        await ref.set(
          {
            fcm_tokens: admin.firestore.FieldValue.arrayUnion(token),
            last_token_update: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        res.status(200).json({ success: true });
      } catch (err) {
        console.error("saveFcmToken error:", err);
        res.status(500).json({ error: "INTERNAL_ERROR" });
      }
    });
  }
);
