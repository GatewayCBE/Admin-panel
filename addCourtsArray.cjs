/**
 * addCourtsArray.cjs
 * Node.js script to populate courts array field in sport documents
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Download from Firebase Console

// 🔥 Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function updateCourtsArray() {
  console.log("🚀 Updating courts array...");

  const turfCollection = db
    .collection("environment")
    .doc("testing")
    .collection("all_turfs_slot_booking");

  const turfDocs = await turfCollection.listDocuments();

  for (const turfDoc of turfDocs) {
    console.log(`➡ Turf: ${turfDoc.id}`);

    const dateCollections = await turfDoc.listCollections();

    for (const dateCol of dateCollections) {
      console.log(`  📅 Date: ${dateCol.id}`);

      const sportDocs = await dateCol.listDocuments();

      for (const sportDoc of sportDocs) {
        console.log(`    🏅 Sport: ${sportDoc.id}`);

        const courtCollections = await sportDoc.listCollections();
        const courtNames = courtCollections.map((courtCol) => courtCol.id);

        if (courtNames.length > 0) {
          await sportDoc.set({ courts: courtNames }, { merge: true });
          console.log(`      ✔ Courts added: ${courtNames.join(", ")}`);
        } else {
          console.log("      ⚠ No courts found");
        }
      }
    }
  }

  console.log("🎉 Courts array update complete!");
}

updateCourtsArray()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("🔥 Error updating courts:", error);
    process.exit(1);
  });
