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

    console.log(`Admin claim set successfully for UID: ${uid}`);
  } catch (err) {
    console.error(`Failed for ${uid}:`, err.message);
  }
}

const ADMIN_UID = [
  "coGUbxu4mLZVpJhDmAl2aqG8zsj2",
  "bVvLILbnsSPJBQEhUiztgMQ5Cre2",
  "zGWf5MR0k6bCgFE7zWoK8Gtu0lI3",
];

async function makeAllAdmins() {
  for (const uid of ADMIN_UID) {
    await setAdmin(uid);
  }
  console.log("All done.");
  process.exit(0);
}

makeAllAdmins().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
