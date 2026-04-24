import { collection, onSnapshot, type QuerySnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { firestore } from "~/services/firebase.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";

const SPACES = "spaces";
const PACK_ITEMS = "packItems";
const PACKING_LISTS = "packingLists";
const CATEGORIES = "categories";

const getIds = (snapshot: QuerySnapshot) =>
  new Set(snapshot.docs.map((doc) => (doc.data() as NamedEntity).id ?? doc.id));

const computeCounts = (
  snapshot: QuerySnapshot,
  validListIds: Set<string>,
  validCategoryIds: Set<string>
): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const doc of snapshot.docs) {
    const { category, packingList } = doc.data() as PackItem;
    if (!packingList || !validListIds.has(packingList) || !category || !validCategoryIds.has(category)) continue;
    if (category) result[category] = (result[category] ?? 0) + 1;
  }
  return result;
};

export const useCategoryItemCounts = () => {
  const { spaceId } = useSpace();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const packItemsRef = collection(firestore, SPACES, spaceId, PACK_ITEMS);
    const packingListsRef = collection(firestore, SPACES, spaceId, PACKING_LISTS);
    const categoriesRef = collection(firestore, SPACES, spaceId, CATEGORIES);
    let packItemsSnapshot: QuerySnapshot | null = null;
    let validListIds = new Set<string>();
    let validCategoryIds = new Set<string>();
    const syncCounts = () =>
      packItemsSnapshot && setCounts(computeCounts(packItemsSnapshot, validListIds, validCategoryIds));
    const stopPackItems = onSnapshot(packItemsRef, (snap) => {
      packItemsSnapshot = snap;
      syncCounts();
    });
    const stopPackingLists = onSnapshot(packingListsRef, (snap) => {
      validListIds = getIds(snap);
      syncCounts();
    });
    const stopCategories = onSnapshot(categoriesRef, (snap) => {
      validCategoryIds = getIds(snap);
      syncCounts();
    });
    return () => {
      stopPackItems();
      stopPackingLists();
      stopCategories();
    };
  }, [spaceId]);

  return { counts };
};
