// import { onRequest } from "firebase-functions/v2/https";
// import * as admin from "firebase-admin";

// if (!admin.apps.length) admin.initializeApp();
// const db = admin.firestore();

// export const deleteTurfByAdmin = onRequest(
//   { region: "asia-south1" },
//   async (req, res): Promise<void> => {

//     // ✅ CORS HEADERS (CRITICAL)
//     res.set("Access-Control-Allow-Origin", "*");
//     res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
//     res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

//     // ✅ HANDLE PREFLIGHT
//     if (req.method === "OPTIONS") {
//       res.status(204).send("");
//       return;
//     }

//     try {
//       // 1️⃣ Auth
//       const authHeader = req.headers.authorization;
//       if (!authHeader?.startsWith("Bearer ")) {
//         res.status(401).json({ error: "Unauthorized" });
//         return;
//       }

//       const token = authHeader.split("Bearer ")[1];
//       const decoded = await admin.auth().verifyIdToken(token);

//       if (!decoded.admin) {
//         res.status(403).json({ error: "Admin access required" });
//         return;
//       }

//       // 2️⃣ Input
//       const { turfId } = req.body;
//       if (!turfId) {
//         res.status(400).json({ error: "Missing turfId" });
//         return;
//       }

//       // 3️⃣ Delete ONLY this turf
//       const turfRef = db
//         .collection("environment/testing/turfs")
//         .doc(turfId);

//       const snap = await turfRef.get();
//       if (!snap.exists) {
//         res.status(404).json({ error: "Turf not found" });
//         return;
//       }

//       await turfRef.delete();

//       res.json({ success: true });
//     } catch (err) {
//       console.error("Delete error:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   }
// );
