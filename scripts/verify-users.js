const admin = require("firebase-admin");
const readline = require("node:readline");

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const PAGE_SIZE = 1000;

async function listAllUsers(nextPageToken, allUsers = []) {
  const { users, pageToken } = await admin.auth().listUsers(PAGE_SIZE, nextPageToken);
  const nextUsers = [...allUsers, ...users];
  if (!pageToken) return nextUsers;
  return listAllUsers(pageToken, nextUsers);
}

const userLabel = (user) => user.email || user.phoneNumber || user.uid;

async function promptToggle(user, index, total) {
  const state = user.emailVerified ? "verified" : "unverified";
  console.log(`\n[${index}/${total}] ${userLabel(user)} (${state})`);
  const answer = await ask("  Toggle verified state? (y/n/q) ");
  return answer.trim().toLowerCase();
}

async function processUser(user, index, total) {
  const answer = await promptToggle(user, index, total);
  if (answer === "q") return false;
  if (answer !== "y") {
    console.log("    - Skipped");
    return true;
  }

  const nextState = !user.emailVerified;
  await admin.auth().updateUser(user.uid, { emailVerified: nextState });
  console.log(`    ✓ Updated to ${nextState ? "verified" : "unverified"}`);
  return true;
}

async function main() {
  const users = await listAllUsers();
  const emailUsers = users.filter((user) => Boolean(user.email));

  if (!emailUsers.length) {
    console.log("No users with email addresses found.");
    return;
  }

  console.log(`\nUsers with email (${emailUsers.length}):`);
  let index = 1;
  for (const user of emailUsers) {
    const shouldContinue = await processUser(user, index, emailUsers.length);
    if (!shouldContinue) {
      console.log("\nStopped by user.");
      return;
    }
    index += 1;
  }

  console.log("\nDone.");
}

main().finally(() => rl.close());
