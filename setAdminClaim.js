const admin = require("firebase-admin");

// 🔑 Download serviceAccountKey.json from Firebase Console
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdmin(uid, role) {
  try {
    await admin.auth().setCustomUserClaims(uid, {
      admin: true,  
      role: role,
    });

    console.log(`Admin claim set successfully for UID: ${uid} → ${role}`);
  } catch (err) {
    console.error(`Failed for ${uid}:`, err.message);
  }
}

const ADMIN_UID = [
  {uid: "OPuLEAEfkiUA0LVoholLaenj0OU2", role: "super_admin"},
  {uid: "9tGTpi6BENP0CyRrQlbuPVNKxIi2", role: "accounting"},
  {uid: "74C4TR8mrpdoHGZHRCFJyUSJQff1", role: "edit"},
];

async function makeAllAdmins() {
  for (const uid of ADMIN_UID) {
    await setAdmin(uid.uid, uid.role);
  }
  console.log("All claims updated.");
  process.exit(0);
}

makeAllAdmins().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
