import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { Space } from "~/types/Space.ts";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import type { UserProfile } from "~/types/UserProfile.ts";
import { firestore, getUserId } from "./firebase.ts";

const SPACES = "spaces";
const USERS = "users";
const INVITES = "invites";

export async function createSpace(name: string, email: string): Promise<Space> {
  const userId = getUserId();
  const space: Omit<Space, "id"> = {
    name,
    ownerId: userId,
    members: [userId],
    memberEmails: [email],
  };
  const ref = await addDoc(collection(firestore, SPACES), space);
  return { id: ref.id, ...space };
}

export function subscribeToSpaces(
  spaceIds: string[],
  onUpdate: (spaces: Space[]) => void,
) {
  if (spaceIds.length === 0) {
    onUpdate([]);
    return () => undefined;
  }
  const q = query(
    collection(firestore, SPACES),
    where("__name__", "in", spaceIds),
  );
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Space));
  });
}

export async function updateSpaceName(spaceId: string, name: string) {
  await updateDoc(doc(firestore, SPACES, spaceId), { name });
}

export async function addMemberEmailToSpace(spaceId: string, email: string) {
  await updateDoc(doc(firestore, SPACES, spaceId), {
    memberEmails: arrayUnion(email),
  });
}

export async function addMemberIdToSpace(spaceId: string, userId: string) {
  await updateDoc(doc(firestore, SPACES, spaceId), {
    members: arrayUnion(userId),
  });
}

export async function removeMemberFromSpace(
  spaceId: string,
  userId: string,
  email: string,
) {
  await updateDoc(doc(firestore, SPACES, spaceId), {
    members: arrayRemove(userId),
    memberEmails: arrayRemove(email),
  });
}

export async function leaveSpace(
  spaceId: string,
  userId: string,
  email: string,
) {
  const snap = await getDoc(doc(firestore, SPACES, spaceId));
  if (!snap.exists()) return;
  const space = snap.data() as Space;
  const normalizedEmail = email.trim().toLowerCase();
  const emailsToRemove = (space.memberEmails ?? []).filter(
    (value) => value.trim().toLowerCase() === normalizedEmail,
  );
  const updates: Record<string, unknown> = {};
  if ((space.members ?? []).includes(userId)) {
    updates.members = arrayRemove(userId);
  }
  if (emailsToRemove.length > 0) {
    updates.memberEmails = arrayRemove(...emailsToRemove);
  }
  if (Object.keys(updates).length === 0) return;
  await updateDoc(doc(firestore, SPACES, spaceId), updates);
}

export async function deleteSpace(spaceId: string) {
  await deleteDoc(doc(firestore, SPACES, spaceId));
}

export async function moveListToSpace(
  sourceSpaceId: string,
  targetSpaceId: string,
  listId: string,
): Promise<void> {
  const userId = getUserId();
  const profile = await getUserProfile(userId);
  const userEmail = profile?.email?.trim().toLowerCase() ?? "";
  if (userEmail) {
    await ensureUserMemberId(sourceSpaceId, userId, userEmail);
    await ensureUserMemberId(targetSpaceId, userId, userEmail);
  }

  const listSnap = await getDoc(
    doc(firestore, SPACES, sourceSpaceId, "packingLists", listId),
  );
  if (!listSnap.exists()) return;
  const listData = listSnap.data();
  const targetListDoc = doc(
    firestore,
    SPACES,
    targetSpaceId,
    "packingLists",
    listId,
  );
  const targetListSnap = await getDoc(targetListDoc);

  const itemsSnap = await getDocs(
    query(
      collection(firestore, SPACES, sourceSpaceId, "packItems"),
      where("packingList", "==", listId),
    ),
  );
  const items: { id: string; category?: string; members?: { id: string }[] }[] =
    itemsSnap.docs.map((itemDoc) => ({
      id: itemDoc.id,
      ...(itemDoc.data() as { category?: string; members?: { id: string }[] }),
    }));
  const categoryIds = [
    ...new Set(
      items.map((item) => (item.category as string) ?? "").filter(Boolean),
    ),
  ];
  const memberIds = [
    ...new Set(
      items.flatMap((item) =>
        ((item.members as { id: string }[] | undefined) ?? []).map(
          (member) => member.id,
        ),
      ),
    ),
  ];

  const [
    sourceCategoriesSnap,
    sourceMembersSnap,
    targetCategoriesSnap,
    targetMembersSnap,
  ] = await Promise.all([
    getDocs(collection(firestore, SPACES, sourceSpaceId, "categories")),
    getDocs(collection(firestore, SPACES, sourceSpaceId, "members")),
    getDocs(collection(firestore, SPACES, targetSpaceId, "categories")),
    getDocs(collection(firestore, SPACES, targetSpaceId, "members")),
  ]);

  const [sourceImagesSnap, targetImagesSnap] = await Promise.all([
    getDocs(collection(firestore, SPACES, sourceSpaceId, "images")),
    getDocs(collection(firestore, SPACES, targetSpaceId, "images")),
  ]);

  const sourceCategories = sourceCategoriesSnap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((entry) => categoryIds.includes(entry.id));
  const sourceMembers = sourceMembersSnap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((entry) => memberIds.includes(entry.id));
  const targetCategoryByName = buildEntityNameMap(
    targetCategoriesSnap.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    })),
  );
  const targetMemberByName = buildEntityNameMap(
    targetMembersSnap.docs.map((entry) => ({ id: entry.id, ...entry.data() })),
  );

  const categoryIdMap = await ensureEntityMapping(
    sourceCategories,
    targetCategoryByName,
    targetSpaceId,
    "categories",
  );
  const memberIdMap = await ensureEntityMapping(
    sourceMembers,
    targetMemberByName,
    targetSpaceId,
    "members",
  );

  const sourceImages = sourceImagesSnap.docs.map((entry) => ({
    id: entry.id,
    ...entry.data(),
  })) as {
    id: string;
    type: string;
    typeId: string;
    url: string;
  }[];
  const targetImageKeys = new Set(
    targetImagesSnap.docs
      .map((entry) => entry.data() as { type?: string; typeId?: string })
      .filter(
        (image) =>
          typeof image.type === "string" && typeof image.typeId === "string",
      )
      .map((image) => `${image.type}:${image.typeId}`),
  );

  const targetListRef = targetListSnap.exists()
    ? doc(collection(firestore, SPACES, targetSpaceId, "packingLists"))
    : targetListDoc;
  const targetListId = targetListRef.id;

  const batch = writeBatch(firestore);
  batch.set(targetListRef, listData);

  for (const image of sourceImages) {
    const mappedTypeId =
      image.type === "categories"
        ? categoryIdMap.get(image.typeId)
        : image.type === "members"
          ? memberIdMap.get(image.typeId)
          : undefined;
    if (!mappedTypeId) continue;
    const key = `${image.type}:${mappedTypeId}`;
    if (targetImageKeys.has(key)) continue;
    const targetImageRef = doc(
      collection(firestore, SPACES, targetSpaceId, "images"),
    );
    batch.set(targetImageRef, {
      type: image.type,
      typeId: mappedTypeId,
      url: image.url,
    });
    targetImageKeys.add(key);
  }

  for (const itemDoc of itemsSnap.docs) {
    const itemData = itemDoc.data();
    const mappedCategory = (itemData.category as string)
      ? (categoryIdMap.get(itemData.category as string) ?? "")
      : "";
    const mappedMembers = (
      (itemData.members as { id: string; checked: boolean }[] | undefined) ?? []
    )
      .map((member) => {
        const mappedId = memberIdMap.get(member.id);
        return mappedId ? { ...member, id: mappedId } : null;
      })
      .filter(
        (member): member is { id: string; checked: boolean } => member !== null,
      );
    const sourceItemRef = doc(
      firestore,
      SPACES,
      sourceSpaceId,
      "packItems",
      itemDoc.id,
    );
    const targetItemRef = doc(
      firestore,
      SPACES,
      targetSpaceId,
      "packItems",
      itemDoc.id,
    );
    batch.set(targetItemRef, {
      ...itemData,
      category: mappedCategory,
      members: mappedMembers,
      packingList: targetListId,
    });
    batch.delete(sourceItemRef);
  }
  batch.delete(doc(firestore, SPACES, sourceSpaceId, "packingLists", listId));
  await batch.commit();
}

export async function ensureUserMemberId(
  spaceId: string,
  userId: string,
  normalizedEmail: string,
) {
  const spaceSnap = await getDoc(doc(firestore, SPACES, spaceId));
  if (!spaceSnap.exists()) return;
  const space = spaceSnap.data() as Space;
  const hasUserId = (space.members ?? []).includes(userId);
  if (hasUserId) return;
  const hasEmail = (space.memberEmails ?? []).some(
    (value) => value.trim().toLowerCase() === normalizedEmail,
  );
  if (!hasEmail) return;
  await updateDoc(doc(firestore, SPACES, spaceId), {
    members: arrayUnion(userId),
  });
}

type SpaceEntity = { id: string; name?: string } & Record<string, unknown>;

function buildEntityNameMap(entities: SpaceEntity[]) {
  const byName = new Map<string, string>();
  for (const entity of entities) {
    const key = normalizeName(entity.name);
    if (key) byName.set(key, entity.id);
  }
  return byName;
}

async function ensureEntityMapping(
  sourceEntities: SpaceEntity[],
  targetByName: Map<string, string>,
  targetSpaceId: string,
  collectionName: "categories" | "members",
) {
  const idMap = new Map<string, string>();
  for (const source of sourceEntities) {
    const key = normalizeName(source.name);
    if (!key) continue;
    const existingId = targetByName.get(key);
    if (existingId) {
      idMap.set(source.id, existingId);
      continue;
    }
    const { id: _id, ...payload } = source;
    const created = await addDoc(
      collection(firestore, SPACES, targetSpaceId, collectionName),
      payload,
    );
    targetByName.set(key, created.id);
    idMap.set(source.id, created.id);
  }
  return idMap;
}

function normalizeName(name: unknown) {
  return typeof name === "string" ? name.trim().toLowerCase() : "";
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | undefined> {
  const snap = await getDoc(doc(firestore, USERS, userId));
  return snap.exists()
    ? ({ id: snap.id, ...snap.data() } as UserProfile)
    : undefined;
}

export async function getUserImagesByEmail(
  memberIds: string[],
): Promise<Record<string, string>> {
  const profiles = await Promise.all(memberIds.map(getUserProfile));
  const result: Record<string, string> = {};
  for (const p of profiles) {
    if (p?.email && p.imageUrl) result[p.email.toLowerCase()] = p.imageUrl;
  }
  return result;
}

export async function setUserProfile(
  userId: string,
  profile: Omit<UserProfile, "id">,
) {
  await setDoc(doc(firestore, USERS, userId), profile);
}

export async function addSpaceToProfile(userId: string, spaceId: string) {
  await updateDoc(doc(firestore, USERS, userId), {
    spaceIds: arrayUnion(spaceId),
  });
}

export async function removeSpaceFromProfile(userId: string, spaceId: string) {
  await updateDoc(doc(firestore, USERS, userId), {
    spaceIds: arrayRemove(spaceId),
  });
}

export async function updateProfileImageUrl(
  userId: string,
  imageUrl: string | null,
) {
  await updateDoc(doc(firestore, USERS, userId), {
    imageUrl: imageUrl ?? deleteField(),
  });
}

export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | undefined) => void,
) {
  return onSnapshot(doc(firestore, USERS, userId), (snap) => {
    onUpdate(
      snap.exists()
        ? ({ id: snap.id, ...snap.data() } as UserProfile)
        : undefined,
    );
  });
}

export async function createInvite(
  invite: Omit<SpaceInvite, "id">,
): Promise<SpaceInvite> {
  const ref = await addDoc(collection(firestore, INVITES), invite);
  return { id: ref.id, ...invite };
}

export function subscribeToPendingInvites(
  email: string,
  onUpdate: (invites: SpaceInvite[]) => void,
) {
  const q = query(
    collection(firestore, INVITES),
    where("toEmail", "==", email),
    where("status", "==", "pending"),
  );
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SpaceInvite));
  });
}

export async function updateInviteStatus(
  inviteId: string,
  status: "accepted" | "declined",
) {
  await updateDoc(doc(firestore, INVITES, inviteId), { status });
}
