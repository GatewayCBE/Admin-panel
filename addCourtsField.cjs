/**
 * addCourtsField.cjs
 * Ensures every sport document has a courts field (default empty array)
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Same key used

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addCourtsField() {
  console.log("🚀 Ensuring courts field exists...");

  const turfCollection = db
    .collection("environment")
    .doc("testing")
    .collection("all_turfs_slot_booking");

  const turfDocs = await turfCollection.listDocuments();

  for (const turfDoc of turfDocs) {
    const dateCollections = await turfDoc.listCollections();

    for (const dateCol of dateCollections) {
      const sportDocs = await dateCol.listDocuments();

      for (const sportDoc of sportDocs) {
        const sportData = (await sportDoc.get()).data() || {};

        if (!sportData.courts) {
          await sportDoc.set({ courts: [] }, { merge: true });
          console.log(`✔ Added empty courts field to sport: ${sportDoc.id}`);
        }
      }
    }
  }

  console.log("🎉 Courts field creation complete!");
}

addCourtsField()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("🔥 Error adding courts field:", error);
    process.exit(1);
  });
