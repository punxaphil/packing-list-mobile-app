import admin from "firebase-admin";
import { logger } from "firebase-functions";
import { HttpsError, onCall } from "firebase-functions/v2/https";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();
const SPACES = "spaces";
const USERS = "users";
const INVITES = "invites";

type SpaceDoc = {
  ownerId?: string;
  members?: string[];
  memberEmails?: string[];
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const toUniqueDocs = (...snaps: FirebaseFirestore.QuerySnapshot[]) => {
  const docs = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  for (const snap of snaps) {
    for (const docSnap of snap.docs) docs.set(docSnap.id, docSnap);
  }
  return [...docs.values()];
};

const getSpaceUpdates = (space: SpaceDoc, userId: string, email: string) => {
  const members = (space.members ?? []).filter((id) => id !== userId);
  const emailsToRemove = (space.memberEmails ?? []).filter((value) => normalizeEmail(value) === email);
  const updates: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData> = {};
  if ((space.members ?? []).includes(userId)) {
    updates.members = admin.firestore.FieldValue.arrayRemove(userId);
  }
  if (emailsToRemove.length > 0) {
    updates.memberEmails = admin.firestore.FieldValue.arrayRemove(...emailsToRemove);
  }
  if (space.ownerId === userId && members.length > 0) {
    updates.ownerId = members[0];
  }
  return { updates, members };
};

export const deleteMyAccount = onCall(async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Must be logged in.");
  const userId = request.auth.uid;
  const email = normalizeEmail(String(request.auth.token.email ?? ""));
  if (!email) throw new HttpsError("failed-precondition", "Account email is missing.");

  try {
    const [memberSpaces, emailSpaces, sentInvites, receivedInvites] = await Promise.all([
      db.collection(SPACES).where("members", "array-contains", userId).get(),
      db.collection(SPACES).where("memberEmails", "array-contains", email).get(),
      db.collection(INVITES).where("fromEmail", "==", email).get(),
      db.collection(INVITES).where("toEmail", "==", email).get(),
    ]);

    for (const spaceDoc of toUniqueDocs(memberSpaces, emailSpaces)) {
      const space = spaceDoc.data() as SpaceDoc;
      const { updates, members } = getSpaceUpdates(space, userId, email);
      if (space.ownerId === userId && members.length === 0) {
        await db.recursiveDelete(spaceDoc.ref);
        continue;
      }
      if (Object.keys(updates).length > 0) {
        await spaceDoc.ref.update(updates);
      }
    }

    const inviteDeletes = toUniqueDocs(sentInvites, receivedInvites).map((docSnap) => docSnap.ref.delete());
    await Promise.all(inviteDeletes);
    await db.collection(USERS).doc(userId).delete();
    await auth.deleteUser(userId);
    return { ok: true };
  } catch (error) {
    logger.error("deleteMyAccount failed", { userId, error });
    throw new HttpsError("internal", "Account deletion failed.");
  }
});
