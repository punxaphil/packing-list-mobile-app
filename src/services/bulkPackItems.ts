import { collection, doc, getDoc, type QueryDocumentSnapshot } from "firebase/firestore";
import type { PackItem } from "~/types/PackItem.ts";
import { getBulkDocuments } from "./bulkDocuments.ts";
import type { ChangeAction, ChangeActor } from "./changeLog.ts";
import { createChangeRecord } from "./changeRecord.ts";
import { type BulkWrite, commitBulkWrites } from "./commitBulkWrites.ts";
import { firestore } from "./firebase.ts";
import { normalizePackItem, withoutPackItemMembers } from "./packItemState.ts";

type ReportProgress = (completed: number) => void;
const itemFromDocument = (snapshot: QueryDocumentSnapshot) =>
  normalizePackItem({ ...snapshot.data(), id: snapshot.id } as PackItem);

function changeWrite(
  spaceId: string,
  actor: ChangeActor | undefined,
  item: PackItem,
  action: ChangeAction
): BulkWrite[] {
  if (!actor) return [];
  const reference = doc(collection(firestore, "spaces", spaceId, "changes"));
  return [{ apply: (batch) => batch.set(reference, createChangeRecord(actor, item, action)) }];
}

function completeItem(writes: BulkWrite[], completed: number) {
  return { writes, completed };
}

async function assertListsExist(spaceId: string, items: PackItem[]) {
  for (const listId of new Set(items.map((item) => item.packingList))) {
    if (!listId || !(await getDoc(doc(firestore, "spaces", spaceId, "packingLists", listId))).exists())
      throw new Error("Pack item references a missing packing list");
  }
}

function groupItemImages(images: QueryDocumentSnapshot[]) {
  const grouped = new Map<string, QueryDocumentSnapshot[]>();
  for (const image of images) {
    const { type, typeId } = image.data();
    if (type !== "packItem" && type !== "packItems") continue;
    grouped.set(typeId, [...(grouped.get(typeId) ?? []), image]);
  }
  return grouped;
}

export function createBulkPackItemOperations(spaceId: string, actor?: ChangeActor) {
  return {
    async deletePackItems(items: PackItem[], report: ReportProgress) {
      const ids = items.map((item) => item.id);
      const [documents, imageDocuments] = await Promise.all([
        getBulkDocuments(spaceId, "packItems", ids),
        getBulkDocuments(spaceId, "images", ids, "typeId"),
      ]);
      const images = groupItemImages(imageDocuments);
      const writes = documents.map((snapshot) =>
        completeItem(
          [
            ...(images.get(snapshot.id) ?? []).map(
              (image) => ({ apply: (batch) => batch.delete(image.ref) }) as BulkWrite
            ),
            { apply: (batch) => batch.delete(snapshot.ref) },
            ...changeWrite(spaceId, actor, itemFromDocument(snapshot), "deleted"),
          ],
          1
        )
      );
      await commitBulkWrites(writes, report);
    },
    async removePackItemMembers(items: PackItem[], report: ReportProgress) {
      const documents = await getBulkDocuments(
        spaceId,
        "packItems",
        items.map((item) => item.id)
      );
      const currentItems = documents.map(itemFromDocument);
      await assertListsExist(spaceId, currentItems);
      const writes = currentItems.map((item, index) => {
        const { members, checked } = withoutPackItemMembers(item);
        return completeItem(
          [
            { apply: (batch) => batch.update(documents[index].ref, { members, checked }) },
            ...(item.members.length ? changeWrite(spaceId, actor, item, "unassigned") : []),
          ],
          item.members.length
        );
      });
      await commitBulkWrites(writes, report);
    },
  };
}
