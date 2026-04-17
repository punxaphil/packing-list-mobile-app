const admin = require("firebase-admin");
const readline = require("readline");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  const { users } = await admin.auth().listUsers();
  const unverified = users.filter((u) => u.email && !u.emailVerified);

  if (!unverified.length) {
    console.log("All users are already verified.");
    return;
  }

  console.log(`\nUnverified users (${unverified.length}):\n`);
  for (const u of unverified) {
    const answer = await ask(`  Verify ${u.email}? (y/n) `);
    if (answer.toLowerCase() === "y") {
      await admin.auth().updateUser(u.uid, { emailVerified: true });
      console.log(`    ✓ Verified`);
    } else {
      console.log(`    – Skipped`);
    }
  }

  console.log("\nDone.");
  rl.close();
}

main();
