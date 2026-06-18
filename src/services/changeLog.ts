import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import type { PackItem } from "~/types/PackItem.ts";
import { firestore } from "./firebase.ts";
import { getPackItemChecked } from "./packItemState.ts";

const SPACES_KEY = "spaces";
const CHANGES_KEY = "changes";
const CHANGES_LIMIT = 100;

export type ChangeAction =
  | "added"
  | "ticked"
  | "unticked"
  | "deleted"
  | "renamed"
  | "moved"
  | "image"
  | "assigned"
  | "unassigned";

export type ChangeActor = { id: string; name: string };

export type ChangeLogEntry = {
  id: string;
  packingList: string;
  userId: string;
  userName: string;
  action: ChangeAction;
  itemName: string;
  categoryId: string;
  fromCategoryId?: string;
  createdAt: number;
};

type LoggableItem = Pick<PackItem, "name" | "category" | "packingList">;

const changesCol = (spaceId: string) => collection(firestore, SPACES_KEY, spaceId, CHANGES_KEY);

const memberCount = (item: PackItem) => new Set(item.members.map((member) => member.id)).size;

function diffPackItemAction(before: PackItem, next: PackItem): ChangeAction | null {
  if (memberCount(next) > memberCount(before)) return "assigned";
  if (memberCount(next) < memberCount(before)) return "unassigned";
  if (before.name !== next.name) return "renamed";
  if (before.category !== next.category) return "moved";
  if (getPackItemChecked(before) === getPackItemChecked(next)) return null;
  return getPackItemChecked(next) ? "ticked" : "unticked";
}

async function record(
  spaceId: string,
  actor: ChangeActor | undefined,
  item: LoggableItem,
  action: ChangeAction,
  fromCategoryId?: string
) {
  if (!actor) return;
  await addDoc(changesCol(spaceId), {
    packingList: item.packingList,
    categoryId: item.category,
    itemName: item.name,
    userId: actor.id,
    userName: actor.name,
    action,
    createdAt: Date.now(),
    ...(fromCategoryId === undefined ? {} : { fromCategoryId }),
  });
}

export const logItemAdded = (spaceId: string, actor: ChangeActor | undefined, item: PackItem) =>
  record(spaceId, actor, item, "added");

export async function logItemImage(spaceId: string, actor: ChangeActor | undefined, item: PackItem | undefined) {
  if (item) await record(spaceId, actor, item, "image");
}

export async function logItemDeleted(spaceId: string, actor: ChangeActor | undefined, item: PackItem | undefined) {
  if (item) await record(spaceId, actor, item, "deleted");
}

export async function logItemUpdated(
  spaceId: string,
  actor: ChangeActor | undefined,
  before: PackItem | undefined,
  next: PackItem
) {
  if (!before) return;
  const action = diffPackItemAction(before, next);
  if (!action) return;
  await record(spaceId, actor, next, action, action === "moved" ? before.category : undefined);
}

export function subscribeToChanges(
  spaceId: string,
  packingListId: string,
  onUpdate: (entries: ChangeLogEntry[]) => void
) {
  const changesQuery = query(changesCol(spaceId), where("packingList", "==", packingListId));
  return onSnapshot(
    changesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as ChangeLogEntry);
      entries.sort((first, second) => second.createdAt - first.createdAt);
      onUpdate(entries.slice(0, CHANGES_LIMIT));
    },
    () => onUpdate([])
  );
}
