const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function addMemberEmailsToSpaces() {
  const spacesSnap = await db.collection("spaces").get();
  let updated = 0;
  for (const spaceDoc of spacesSnap.docs) {
    const data = spaceDoc.data();
    if (data.memberEmails && data.memberEmails.length > 0) continue;
    const emails = await resolveEmails(data.members || []);
    if (emails.length === 0) continue;
    await spaceDoc.ref.update({ memberEmails: emails });
    console.log(`  Space "${data.name}" (${spaceDoc.id}): added memberEmails ${JSON.stringify(emails)}`);
    updated++;
  }
  console.log(`Updated ${updated} spaces with memberEmails.`);
}

async function resolveEmails(memberIds) {
  const emails = [];
  for (const uid of memberIds) {
    try {
      const user = await auth.getUser(uid);
      if (user.email) emails.push(user.email.toLowerCase());
    } catch {
      console.warn(`  Could not resolve user ${uid}`);
    }
  }
  return emails;
}

async function cleanupInvites() {
  const invitesSnap = await db.collection("invites").get();
  let deleted = 0;
  for (const inviteDoc of invitesSnap.docs) {
    const data = inviteDoc.data();
    const hasUppercase =
      data.toEmail !== data.toEmail?.toLowerCase() || data.fromEmail !== data.fromEmail?.toLowerCase();
    const isStale = data.status === "declined" || data.status === "accepted";
    if (hasUppercase || isStale) {
      console.log(`  Deleting invite ${inviteDoc.id}: to=${data.toEmail} status=${data.status}`);
      await inviteDoc.ref.delete();
      deleted++;
    }
  }
  console.log(`Deleted ${deleted} stale/invalid invites.`);
}

async function main() {
  console.log("=== Adding memberEmails to spaces ===");
  await addMemberEmailsToSpaces();
  console.log("\n=== Cleaning up invites ===");
  await cleanupInvites();
  console.log("\nDone!");
}

main().catch(console.error);
