import { collection, onSnapshot, type QuerySnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { firestore } from "~/services/firebase.ts";
import { normalizePackItem } from "~/services/packItemState.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";

const SPACES = "spaces";
const PACK_ITEMS = "packItems";
const PACKING_LISTS = "packingLists";

const getValidListIds = (snapshot: QuerySnapshot) =>
  new Set(snapshot.docs.map((doc) => (doc.data() as NamedEntity).id ?? doc.id));

const computeCounts = (snapshot: QuerySnapshot, validListIds: Set<string>): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const doc of snapshot.docs) {
    const item = normalizePackItem(doc.data() as PackItem);
    if (!item.packingList || !validListIds.has(item.packingList)) continue;
    for (const member of item.members ?? []) {
      result[member.id] = (result[member.id] ?? 0) + 1;
    }
  }
  return result;
};

export const useMemberItemCounts = () => {
  const { spaceId } = useSpace();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const packItemsRef = collection(firestore, SPACES, spaceId, PACK_ITEMS);
    const packingListsRef = collection(firestore, SPACES, spaceId, PACKING_LISTS);
    let packItemsSnapshot: QuerySnapshot | null = null;
    let validListIds = new Set<string>();
    const syncCounts = () => packItemsSnapshot && setCounts(computeCounts(packItemsSnapshot, validListIds));
    const stopPackItems = onSnapshot(packItemsRef, (snap) => {
      packItemsSnapshot = snap;
      syncCounts();
    });
    const stopPackingLists = onSnapshot(packingListsRef, (snap) => {
      validListIds = getValidListIds(snap);
      syncCounts();
    });
    return () => {
      stopPackItems();
      stopPackingLists();
    };
  }, [spaceId]);

  return { counts };
};
