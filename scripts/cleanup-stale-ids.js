const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const SUBCOLLECTIONS = [
  "packingLists",
  "packItems",
  "categories",
  "members",
  "images",
];

async function cleanStaleIds() {
  const spacesSnap = await db.collection("spaces").get();
  let totalFixed = 0;

  for (const spaceDoc of spacesSnap.docs) {
    const spaceName = spaceDoc.data().name;
    for (const sub of SUBCOLLECTIONS) {
      const docsSnap = await spaceDoc.ref.collection(sub).get();
      for (const docSnap of docsSnap.docs) {
        const data = docSnap.data();
        if (!("id" in data)) continue;
        if (data.id === docSnap.id) {
          await docSnap.ref.update({ id: admin.firestore.FieldValue.delete() });
          console.log(
            `  [${spaceName}] ${sub}/${docSnap.id}: removed matching id field`,
          );
          totalFixed++;
        } else {
          await docSnap.ref.update({ id: admin.firestore.FieldValue.delete() });
          console.log(
            `  [${spaceName}] ${sub}/${docSnap.id}: removed STALE id="${data.id}"`,
          );
          totalFixed++;
        }
      }
    }
  }

  console.log(`\nDone. Cleaned ${totalFixed} documents.`);
}

cleanStaleIds().catch(console.error);
