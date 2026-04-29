const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.auth().updateUser("OPuLEAEfkiUA0LVoholLaenj0OU2", {
  emailVerified: true
})
.then(() => console.log("Admin email verified"))
.catch(console.error);