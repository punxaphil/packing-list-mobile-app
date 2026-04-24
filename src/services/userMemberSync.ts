import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { firestore } from "~/services/firebase.ts";
import { normalizePackItem, withPackItemMembers } from "~/services/packItemState.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";
import type { Space } from "~/types/Space.ts";
import { getDisplayName, type UserProfile } from "~/types/UserProfile.ts";

const SPACES = "spaces";
const MEMBERS = "members";
const IMAGES = "images";
const PACK_ITEMS = "packItems";
const USERS = "users";
const BATCH_LIMIT = 450;

const membersCol = (spaceId: string) => collection(firestore, SPACES, spaceId, MEMBERS);
const imagesCol = (spaceId: string) => collection(firestore, SPACES, spaceId, IMAGES);
const packItemsCol = (spaceId: string) => collection(firestore, SPACES, spaceId, PACK_ITEMS);
const spaceDoc = (spaceId: string) => doc(firestore, SPACES, spaceId);
const userDoc = (userId: string) => doc(firestore, USERS, userId);

const lowestRank = (docs: { data: () => Record<string, unknown> }[]): number => {
  const ranks = docs.map((d) => (d.data().rank as number) ?? 0);
  return ranks.length ? Math.min(...ranks) - 1 : 0;
};

const activeSyncs = new Set<string>();

export async function syncUserMember(spaceId: string, profile: UserProfile): Promise<void> {
  const key = `${spaceId}:${profile.id}`;
  if (activeSyncs.has(key)) return;
  activeSyncs.add(key);
  try {
    await doSync(spaceId, profile);
  } finally {
    activeSyncs.delete(key);
  }
}

async function doSync(spaceId: string, profile: UserProfile): Promise<void> {
  const displayName = getDisplayName(profile);
  const allSnap = await getDocs(membersCol(spaceId));
  const allMembers = allSnap.docs.map((d) => ({ ref: d.ref, ...(d.data() as NamedEntity), id: d.id }));

  const byUserId = allMembers.find((m) => m.userId === profile.id);
  if (byUserId) {
    if (byUserId.name !== displayName) await updateDoc(byUserId.ref, { name: displayName });
    await syncMemberImage(spaceId, byUserId.id, profile.imageUrl);
    return;
  }

  const byEmail = allMembers.find((m) => !m.userId && m.name.toLowerCase() === profile.email.toLowerCase());
  const byName = allMembers.find((m) => !m.userId && m.name.toLowerCase() === displayName.toLowerCase());
  const claimable = byEmail ?? byName;

  if (claimable) {
    await updateDoc(claimable.ref, { userId: profile.id, name: displayName });
    await syncMemberImage(spaceId, claimable.id, profile.imageUrl);
    return;
  }

  const rank = lowestRank(allSnap.docs);
  const ref = await addDoc(membersCol(spaceId), { name: displayName, rank, userId: profile.id });
  await syncMemberImage(spaceId, ref.id, profile.imageUrl);
}

export async function unassignUserFromPackItems(spaceId: string, userId: string): Promise<void> {
  const memberSnap = await getDocs(query(membersCol(spaceId), where("userId", "==", userId)));
  if (memberSnap.empty) return;

  const memberIds = memberSnap.docs.map((entry) => entry.id);
  const packItemSnap = await getDocs(packItemsCol(spaceId));
  let batch = writeBatch(firestore);
  let writes = 0;
  for (const itemDoc of packItemSnap.docs) {
    const item = normalizePackItem(itemDoc.data() as PackItem);
    const members = (item.members ?? []).filter((member) => !memberIds.includes(member.id));
    if (members.length === (item.members ?? []).length) continue;
    const nextItem = withPackItemMembers(item, members);
    batch.update(itemDoc.ref, { members: nextItem.members, checked: nextItem.checked });
    writes += 1;
    if (writes < BATCH_LIMIT) continue;
    await batch.commit();
    batch = writeBatch(firestore);
    writes = 0;
  }

  if (writes > 0) await batch.commit();
}

export async function finalizeUserRemoval(spaceId: string, userId: string, email: string): Promise<void> {
  const spaceSnap = await getDoc(spaceDoc(spaceId));
  const memberSnap = await getDocs(query(membersCol(spaceId), where("userId", "==", userId)));
  const batch = writeBatch(firestore);
  const normalizedEmail = email.trim().toLowerCase();
  const space = spaceSnap.data() as Space | undefined;
  const emailsToRemove = (space?.memberEmails ?? []).filter((value) => value.trim().toLowerCase() === normalizedEmail);
  batch.update(spaceDoc(spaceId), {
    members: arrayRemove(userId),
    memberEmails: arrayRemove(...emailsToRemove),
  });
  batch.update(userDoc(userId), {
    spaceIds: arrayRemove(spaceId),
  });

  for (const memberDoc of memberSnap.docs) batch.delete(memberDoc.ref);
  await batch.commit();
}

async function syncMemberImage(spaceId: string, memberId: string, imageUrl?: string): Promise<void> {
  const imageSnap = await getDocs(
    query(imagesCol(spaceId), where("type", "==", MEMBERS), where("typeId", "==", memberId))
  );

  if (!imageUrl) {
    for (const imgDoc of imageSnap.docs) await deleteDoc(imgDoc.ref);
    return;
  }

  if (imageSnap.empty) {
    await addDoc(imagesCol(spaceId), { type: MEMBERS, typeId: memberId, url: imageUrl });
    return;
  }

  const existing = imageSnap.docs[0];
  if ((existing.data().url as string) !== imageUrl) {
    await updateDoc(existing.ref, { url: imageUrl });
  }
}

const DEBOUNCE_MS = 500;

export function subscribeToSpaceUserProfiles(
  userIds: string[],
  onUpdate: (profiles: Map<string, UserProfile>) => void
) {
  if (!userIds.length) {
    onUpdate(new Map());
    return () => {};
  }
  const profileMap = new Map<string, UserProfile>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  const scheduleUpdate = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => onUpdate(new Map(profileMap)), DEBOUNCE_MS);
  };
  const unsubscribes = userIds.map((uid) =>
    onSnapshot(doc(firestore, "users", uid), (snap) => {
      if (snap.exists()) {
        profileMap.set(uid, { id: snap.id, ...snap.data() } as UserProfile);
      }
      scheduleUpdate();
    })
  );
  return () => {
    if (timer) clearTimeout(timer);
    for (const u of unsubscribes) u();
  };
}
