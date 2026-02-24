const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

const SUBCOLLECTIONS = ["packingLists", "packItems", "categories", "members", "images"];

async function copySubcollection(sourcePath, targetPath) {
  const snapshot = await db.collection(sourcePath).get();
  if (snapshot.empty) return 0;

  const batch = db.batch();
  let count = 0;
  for (const docSnap of snapshot.docs) {
    const targetRef = db.collection(targetPath).doc(docSnap.id);
    batch.set(targetRef, docSnap.data());
    count++;
  }
  await batch.commit();
  return count;
}

async function migrateUser(userRecord) {
  const userId = userRecord.uid;
  const email = userRecord.email || "";

  console.log(`Migrating user ${email} (${userId})...`);

  const spaceRef = db.collection("spaces").doc();
  const spaceId = spaceRef.id;

  await spaceRef.set({
    name: "My Lists",
    ownerId: userId,
    members: [userId],
    memberEmails: [email],
  });

  for (const sub of SUBCOLLECTIONS) {
    const sourcePath = `users/${userId}/${sub}`;
    const targetPath = `spaces/${spaceId}/${sub}`;
    const count = await copySubcollection(sourcePath, targetPath);
    if (count > 0) console.log(`  Copied ${count} docs from ${sub}`);
  }

  await db
    .collection("users")
    .doc(userId)
    .set({
      email,
      personalSpaceId: spaceId,
      spaceIds: [spaceId],
    });

  console.log(`  Created space ${spaceId} for ${email}`);
}

async function main() {
  console.log("Starting migration...\n");

  const listResult = await auth.listUsers();
  const users = listResult.users;

  console.log(`Found ${users.length} users\n`);

  for (const user of users) {
    await migrateUser(user);
  }

  console.log("\nMigration complete!");
  console.log("Old data under users/{userId}/subcollections is preserved.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
