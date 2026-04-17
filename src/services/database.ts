import {
  addDoc,
  collection,
  DocumentData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  QueryDocumentSnapshot,
  QuerySnapshot,
  query,
  updateDoc,
  WithFieldValue,
  WriteBatch,
  where,
  writeBatch,
} from "firebase/firestore";
import { ArrayError } from "~/types/ArrayError.ts";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { firestore } from "./firebase.ts";
import { getPackItemChecked, withPackItemMembers } from "./packItemState.ts";
import { sortEntities } from "./utils.ts";

const SPACES_KEY = "spaces";
const CATEGORIES_KEY = "categories";
const MEMBERS_KEY = "members";
const PACK_ITEMS_KEY = "packItems";
const IMAGES_KEY = "images";
const PACKING_LISTS_KEY = "packingLists";

function fromQueryResult<K>(res: QuerySnapshot) {
  return res.docs.map((d: QueryDocumentSnapshot) => ({
    ...d.data(),
    id: d.id,
  })) as K[];
}

function spaceColl(spaceId: string, sub: string) {
  return collection(firestore, SPACES_KEY, spaceId, sub);
}

function spaceDoc(spaceId: string, sub: string, docId: string) {
  return doc(firestore, SPACES_KEY, spaceId, sub, docId);
}

async function add<K extends DocumentData>(spaceId: string, sub: string, data: WithFieldValue<K>) {
  const docRef = await addDoc(spaceColl(spaceId, sub), data);
  if (docRef) return docRef;
  throw new Error("Unable to add to database");
}

async function update<K extends DocumentData>(spaceId: string, sub: string, id: string, data: WithFieldValue<K>) {
  const { id: _, ...rest } = data as DocumentData;
  await updateDoc(doc(spaceColl(spaceId, sub), id), rest);
}

async function del(spaceId: string, sub: string, id: string) {
  await deleteDoc(spaceDoc(spaceId, sub, id));
}

async function updateInBatch<K extends DocumentData>(spaceId: string, sub: string, data: WithFieldValue<K>[]) {
  const batch = writeBatch(firestore);
  const coll = spaceColl(spaceId, sub);
  for (const d of data) {
    const { id: docId, ...rest } = d as DocumentData;
    batch.update(doc(coll, docId), rest);
  }
  await batch.commit();
}

function addBatch<K extends DocumentData>(spaceId: string, sub: string, batch: WriteBatch, data: WithFieldValue<K>) {
  const docRef = doc(spaceColl(spaceId, sub));
  batch.set(docRef, data);
  return docRef.id;
}

async function updateNamedEntities(spaceId: string, sub: string, entities: NamedEntity[] | NamedEntity) {
  if (Array.isArray(entities)) {
    await updateInBatch(spaceId, sub, entities);
  } else {
    await update(spaceId, sub, entities.id, entities);
  }
}

function throwNamedEntityArrayError(type: string, packItems: PackItem[], packingLists: NamedEntity[]) {
  throw new ArrayError([
    `${type} was not deleted. It's in use by the following pack items:`,
    ...packItems.slice(0, 5).map((t) => {
      const name = packingLists.find((pl) => pl.id === t.packingList)?.name;
      return t.name + (name ? ` (in ${name})` : "");
    }),
    packItems.length > 5 ? " and more..." : "",
  ]);
}

async function deletePackItemsForList(spaceId: string, listId: string, batch: WriteBatch) {
  const q = query(spaceColl(spaceId, PACK_ITEMS_KEY), where("packingList", "==", listId));
  const items = fromQueryResult<PackItem>(await getDocs(q));
  for (const item of items) {
    batch.delete(spaceDoc(spaceId, PACK_ITEMS_KEY, item.id));
  }
}

async function assertUniqueEntityName(spaceId: string, collKey: string, name: string, excludeId?: string) {
  const existing = fromQueryResult<NamedEntity>(await getDocs(spaceColl(spaceId, collKey)));
  const lower = name.trim().toLowerCase();
  const dup = existing.find((e) => e.name.toLowerCase() === lower && e.id !== excludeId);
  if (dup) throw new DuplicateNameError(name);
}

async function assertUniqueItemName(
  spaceId: string,
  name: string,
  category: string,
  packingList: string,
  excludeId?: string
) {
  const q = query(
    spaceColl(spaceId, PACK_ITEMS_KEY),
    where("packingList", "==", packingList),
    where("category", "==", category)
  );
  const items = fromQueryResult<PackItem>(await getDocs(q));
  const lower = name.trim().toLowerCase();
  const dup = items.find((i) => i.name.toLowerCase() === lower && i.id !== excludeId);
  if (dup) throw new DuplicateNameError(name);
}

export function createWriteDb(spaceId: string) {
  const db = {
    addPackItem: async (
      name: string,
      members: MemberPackItem[],
      category: string,
      packingList: string,
      rank: number
    ): Promise<PackItem> => {
      await assertUniqueItemName(spaceId, name, category, packingList);
      const ref = await add(spaceId, PACK_ITEMS_KEY, {
        name,
        members,
        checked: false,
        category,
        packingList,
        rank,
      });
      return {
        id: ref.id,
        checked: false,
        members,
        name,
        category,
        packingList,
        rank,
      };
    },
    updatePackItem: async (packItem: PackItem) => {
      await update(spaceId, PACK_ITEMS_KEY, packItem.id, packItem);
    },
    deletePackItem: async (id: string) => {
      await del(spaceId, PACK_ITEMS_KEY, id);
    },
    deletePackingList: async (id: string) => {
      const batch = writeBatch(firestore);
      await deletePackItemsForList(spaceId, id, batch);
      db.deletePackingListBatch(id, batch);
      await batch.commit();
    },
    addMember: async (name: string, rank = 0): Promise<NamedEntity> => {
      await assertUniqueEntityName(spaceId, MEMBERS_KEY, name);
      const ref = await add(spaceId, MEMBERS_KEY, { name, rank });
      return { id: ref.id, name, rank };
    },
    updateMembers: async (toUpdate: NamedEntity[] | NamedEntity) => {
      if (!Array.isArray(toUpdate)) {
        await assertUniqueEntityName(spaceId, MEMBERS_KEY, toUpdate.name, toUpdate.id);
      }
      await updateNamedEntities(spaceId, MEMBERS_KEY, toUpdate);
    },
    addCategory: async (name: string, rank = 0): Promise<NamedEntity> => {
      await assertUniqueEntityName(spaceId, CATEGORIES_KEY, name);
      const ref = await add(spaceId, CATEGORIES_KEY, { name, rank });
      return { id: ref.id, name, rank };
    },
    updateCategories: async (categories: NamedEntity[] | NamedEntity) => {
      if (!Array.isArray(categories)) {
        await assertUniqueEntityName(spaceId, CATEGORIES_KEY, categories.name, categories.id);
      }
      await updateNamedEntities(spaceId, CATEGORIES_KEY, categories);
    },
    updatePackingLists: async (packingLists: NamedEntity[] | NamedEntity) => {
      if (!Array.isArray(packingLists)) {
        await assertUniqueEntityName(spaceId, PACKING_LISTS_KEY, packingLists.name, packingLists.id);
      }
      await updateNamedEntities(spaceId, PACKING_LISTS_KEY, packingLists);
    },
    addImage: async (type: string, typeId: string, url: string): Promise<void> => {
      await add(spaceId, IMAGES_KEY, { type, typeId, url });
    },
    async updateImage(imageId: string, fileUrl: string) {
      await update(spaceId, IMAGES_KEY, imageId, { url: fileUrl });
    },
    async deleteImage(imageId: string) {
      await del(spaceId, IMAGES_KEY, imageId);
    },
    initBatch: () => writeBatch(firestore),
    deletePackItemBatch(id: string, batch: WriteBatch) {
      batch.delete(spaceDoc(spaceId, PACK_ITEMS_KEY, id));
    },
    addCategoryBatch(category: string, batch: WriteBatch) {
      return addBatch(spaceId, CATEGORIES_KEY, batch, { name: category });
    },
    addMemberBatch(member: string, batch: WriteBatch) {
      return addBatch(spaceId, MEMBERS_KEY, batch, { name: member });
    },
    updatePackItemBatch<K extends DocumentData>(data: WithFieldValue<K>, batch: WriteBatch) {
      const { id, ...rest } = data as DocumentData;
      batch.update(spaceDoc(spaceId, PACK_ITEMS_KEY, id), rest);
    },
    async updatePackItemsBatched(items: PackItem[]) {
      const batch = writeBatch(firestore);
      for (const item of items) {
        const { id, ...rest } = item as DocumentData;
        batch.update(spaceDoc(spaceId, PACK_ITEMS_KEY, id), rest);
      }
      await batch.commit();
    },
    addPackItemBatch(
      batch: WriteBatch,
      name: string,
      members: MemberPackItem[],
      category: string,
      rank: number,
      packingList: string,
      checked = false
    ) {
      return addBatch(spaceId, PACK_ITEMS_KEY, batch, {
        name,
        members,
        checked,
        category,
        packingList,
        rank,
      });
    },
    async deleteCategory(id: string, packingLists: NamedEntity[], deleteEvenIfUsed = false) {
      const q = query(spaceColl(spaceId, PACK_ITEMS_KEY), where("category", "==", id));
      const packItems: PackItem[] = fromQueryResult(await getDocs(q));
      if (packItems.length) {
        if (!deleteEvenIfUsed) throwNamedEntityArrayError("Category", packItems, packingLists);
        const batch = writeBatch(firestore);
        for (const packItem of packItems) {
          packItem.category = "";
          db.updatePackItemBatch(packItem, batch);
        }
        await batch.commit();
      }
      await del(spaceId, CATEGORIES_KEY, id);
    },
    async deleteMember(id: string, packingLists: NamedEntity[], deleteEvenIfUsed = false) {
      const q = query(spaceColl(spaceId, PACK_ITEMS_KEY), where("members", "!=", []));
      let packItems: PackItem[] = fromQueryResult(await getDocs(q));
      packItems = packItems.filter((t) => t.members.find((m) => m.id === id));
      if (packItems.length) {
        if (!deleteEvenIfUsed) throwNamedEntityArrayError("Member", packItems, packingLists);
        const batch = writeBatch(firestore);
        for (const packItem of packItems) {
          db.updatePackItemBatch(
            withPackItemMembers(
              packItem,
              packItem.members.filter((m) => m.id !== id)
            ),
            batch
          );
        }
        await batch.commit();
      }
      await del(spaceId, MEMBERS_KEY, id);
    },
    async getFirstPackingList(): Promise<NamedEntity | undefined> {
      const lists = fromQueryResult(await getDocs(spaceColl(spaceId, PACKING_LISTS_KEY))) as NamedEntity[];
      return lists.length ? lists[0] : undefined;
    },
    async addPackingList(name: string, rank: number) {
      await assertUniqueEntityName(spaceId, PACKING_LISTS_KEY, name);
      const ref = await add(spaceId, PACKING_LISTS_KEY, { name, rank });
      return ref.id;
    },
    async getPackingList(id: string) {
      const res = await getDoc(spaceDoc(spaceId, PACKING_LISTS_KEY, id));
      return res.exists() ? ({ ...res.data(), id: res.id } as NamedEntity) : undefined;
    },
    async updatePackingList(packingList: NamedEntity) {
      await assertUniqueEntityName(spaceId, PACKING_LISTS_KEY, packingList.name, packingList.id);
      return update(spaceId, PACKING_LISTS_KEY, packingList.id, packingList);
    },
    deletePackingListBatch(id: string, batch: WriteBatch) {
      batch.delete(spaceDoc(spaceId, PACKING_LISTS_KEY, id));
    },
    addPackingListBatch(name: string, batch: WriteBatch, rank: number) {
      return addBatch(spaceId, PACKING_LISTS_KEY, batch, { name, rank });
    },
    async getPackItemsForList(packingListId: string): Promise<PackItem[]> {
      const q = query(spaceColl(spaceId, PACK_ITEMS_KEY), where("packingList", "==", packingListId));
      return fromQueryResult(await getDocs(q)) as PackItem[];
    },
    async copyPackItemsToList(sourceListId: string, targetListId: string): Promise<void> {
      const items = await db.getPackItemsForList(sourceListId);
      if (items.length === 0) return;
      const existing = await db.getPackItemsForList(targetListId);
      const existingKeys = new Set(existing.map((i) => `${i.category}::${i.name.toLowerCase()}`));
      const unique = items.filter((i) => !existingKeys.has(`${i.category}::${i.name.toLowerCase()}`));
      if (unique.length === 0) return;
      const batch = writeBatch(firestore);
      for (const item of unique) {
        db.addPackItemBatch(batch, item.name, item.members, item.category, item.rank, targetListId, false);
      }
      await batch.commit();
    },
    async uncheckAllItems(packingListId: string): Promise<void> {
      const items = await db.getPackItemsForList(packingListId);
      const checkedItems = items.filter(getPackItemChecked);
      if (checkedItems.length === 0) return;
      const batch = writeBatch(firestore);
      for (const item of checkedItems) {
        batch.update(spaceDoc(spaceId, PACK_ITEMS_KEY, item.id), {
          checked: false,
          members: item.members.map((member) => ({
            ...member,
            checked: false,
          })),
        });
      }
      await batch.commit();
    },
    updateCategoryBatch<K extends DocumentData>(data: WithFieldValue<K>, batch: WriteBatch) {
      const { id, ...rest } = data as DocumentData;
      batch.update(spaceDoc(spaceId, CATEGORIES_KEY, id), rest);
    },
    getPackItemsForAllPackingLists: async () => {
      const q = query(spaceColl(spaceId, PACK_ITEMS_KEY));
      const allPackItems = fromQueryResult<PackItem>(await getDocs(q));
      sortEntities(allPackItems);
      return allPackItems;
    },
  };
  return db;
}

export type WriteDb = ReturnType<typeof createWriteDb>;
