const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function resetPassword() {
  try {
    await admin.auth().updateUser("OPuLEAEfkiUA0LVoholLaenj0OU2", {
      password: "BYTNOTTAM@2026"
    });

    console.log("Password updated successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetPassword();