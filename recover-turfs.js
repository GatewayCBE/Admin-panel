const admin = require('firebase-admin');

admin.initializeApp({
  projectId: "play-arena-e83d8",
  credential: admin.credential.cert("./serviceAccountKey.json")
});

const db = admin.firestore();

const turfsRef = db
  .collection('environment')
  .doc('testing')
  .collection('turfs');

// Best timestamp → 11:10 AM on 11th April 2026
const recoveryTimestamp = admin.firestore.Timestamp.fromDate(
  new Date('2026-04-29T11:30:00+05:30')
);

async function recoverTurfs() {
  console.log(`🔍 Checking turfs as of: ${recoveryTimestamp.toDate()}`);

  const currentSnap = await turfsRef.get();
  console.log(`📊 Current turfs: ${currentSnap.size}`);

  const pastSnap = await db.runTransaction(
    async (tx) => tx.get(turfsRef),
    { readOnly: true, readTime: recoveryTimestamp }
  );

  console.log(`📊 Past turfs at selected time: ${pastSnap.size}`);

  const currentIds = new Set(currentSnap.docs.map(doc => doc.id));
  const missingIds = pastSnap.docs
    .map(doc => doc.id)
    .filter(id => !currentIds.has(id));

  console.log(`\n🚨 MISSING TURFS: ${missingIds.length}`);
  if (missingIds.length > 0) {
    console.log("Sample missing IDs:", missingIds.slice(0, 15));
  }

  if (missingIds.length === 0) {
    console.log("No missing documents found.");
    return;
  }

  const readline = require('readline-sync');
  const answer = readline.question(`\nRestore these ${missingIds.length} missing turfs? (yes/no): `);

  if (answer.toLowerCase() !== 'yes') {
    console.log("Restore cancelled.");
    return;
  }

  console.log("\n🔄 Restoring 24 turfs... Please wait...");
  const batch = db.batch();
  let restored = 0;

  for (const id of missingIds) {
    const pastDoc = await db.runTransaction(
      async (tx) => tx.get(turfsRef.doc(id)),
      { readOnly: true, readTime: recoveryTimestamp }
    );

    if (pastDoc.exists) {
      batch.set(turfsRef.doc(id), pastDoc.data(), { merge: true });
      restored++;
      console.log(`✅ Restored: ${id}`);
    }
  }

  await batch.commit();
  console.log(`\n🎉 Successfully restored ${restored} turf documents!`);
}

recoverTurfs().catch(err => console.error("❌ Error:", err.message));