const admin = require("firebase-admin");

// 🔑 Download serviceAccountKey.json from Firebase Console
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdmin(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
    });

    console.log(`✅ Admin claim set successfully for UID: ${uid}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error setting admin claim:", err);
    process.exit(1);
  }
}

// 🔁 REPLACE THIS
const ADMIN_UID = "zx1mlwMcTtNJVyQwTMCpzxjHCiq2";

setAdmin(ADMIN_UID);
