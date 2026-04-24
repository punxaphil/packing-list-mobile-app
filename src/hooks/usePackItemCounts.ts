import { collection, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "~/services/firebase.ts";
import { getPackItemChecked, normalizePackItem } from "~/services/packItemState.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";

type CountEntry = { total: number; packed: number };
export type PackItemCountRecord = Record<string, CountEntry>;
type CountState = { counts: PackItemCountRecord; loading: boolean };

const SPACES = "spaces";
const PACK_ITEMS = "packItems";
const PACKING_LISTS = "packingLists";
const createInitialState = (): CountState => ({ counts: {}, loading: true });
const createEmptyState = (): CountState => ({ counts: {}, loading: false });
const mapSnapshot = (snapshot: QuerySnapshot) =>
  snapshot.docs.map((doc) => normalizePackItem({ ...doc.data(), id: doc.id } as PackItem));
const getValidListIds = (snapshot: QuerySnapshot) =>
  new Set(snapshot.docs.map((doc) => (doc.data() as NamedEntity).id ?? doc.id));
const sumCounts = (items: PackItem[], validListIds: Set<string>): PackItemCountRecord => {
  const counts: PackItemCountRecord = {};
  for (const item of items) {
    if (!item.packingList || !validListIds.has(item.packingList)) continue;
    const current = counts[item.packingList] ?? { total: 0, packed: 0 };
    counts[item.packingList] = {
      total: current.total + 1,
      packed: current.packed + (getPackItemChecked(item) ? 1 : 0),
    };
  }
  return counts;
};
const handleError = (setState: (value: CountState) => void) => () => setState(createEmptyState());
const buildPackItemsQuery = (spaceId: string) => collection(firestore, SPACES, spaceId, PACK_ITEMS);
const buildPackingListsQuery = (spaceId: string) => collection(firestore, SPACES, spaceId, PACKING_LISTS);
const manageSubscription = (spaceId: string | null | undefined, setState: (value: CountState) => void) => {
  if (!spaceId) {
    setState(createEmptyState());
    return undefined;
  }
  setState(createInitialState());
  let itemsSnapshot: QuerySnapshot | null = null;
  let validListIds = new Set<string>();
  const syncCounts = () =>
    itemsSnapshot && setState({ counts: sumCounts(mapSnapshot(itemsSnapshot), validListIds), loading: false });
  const stopPackItems = onSnapshot(
    buildPackItemsQuery(spaceId),
    (snapshot) => {
      itemsSnapshot = snapshot;
      syncCounts();
    },
    handleError(setState)
  );
  const stopPackingLists = onSnapshot(
    buildPackingListsQuery(spaceId),
    (snapshot) => {
      validListIds = getValidListIds(snapshot);
      syncCounts();
    },
    handleError(setState)
  );
  return () => {
    stopPackItems();
    stopPackingLists();
  };
};
export const usePackItemCounts = (spaceId: string | null | undefined) => {
  const [state, setState] = useState<CountState>(() => createInitialState());
  useEffect(() => manageSubscription(spaceId, setState), [spaceId]);
  return state;
};
