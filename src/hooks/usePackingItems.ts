import { collection, getFirestore, onSnapshot, QuerySnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PackItem } from "~/types/PackItem.ts";

type HookState = { items: PackItem[]; loading: boolean };

const SPACES_COLLECTION = "spaces";
const PACK_ITEMS_COLLECTION = "packItems";
const ORDER_FIELD = "rank" as const;
const NOOP_UNSUBSCRIBE: Unsubscribe = () => undefined;

const createState = (loading: boolean, items: PackItem[] = []) => ({
  items,
  loading,
});

const sortItems = (items: PackItem[]) => [...items].sort((first, second) => second[ORDER_FIELD] - first[ORDER_FIELD]);

const mapSnapshot = (snapshot: QuerySnapshot): PackItem[] =>
  sortItems(
    snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as PackItem[]
  );

const buildQuery = (spaceId: string, packingListId: string) =>
  query(
    collection(getFirestore(), SPACES_COLLECTION, spaceId, PACK_ITEMS_COLLECTION),
    where("packingList", "==", packingListId)
  );

const handleSnapshot = (setState: (value: HookState) => void) => (snapshot: QuerySnapshot) => {
  const items = mapSnapshot(snapshot);
  setState(createState(false, items));
};

const handleError = (setState: (value: HookState) => void) => (_error: unknown) => {
  setState(createState(false));
};

const subscribeToItems = (spaceId: string, packingListId: string, setState: (value: HookState) => void) =>
  onSnapshot(buildQuery(spaceId, packingListId), handleSnapshot(setState), handleError(setState));

const handleMissingInputs = (setState: (value: HookState) => void) => {
  setState(createState(false));
  return NOOP_UNSUBSCRIBE;
};

const manageSubscription = (
  spaceId: string | null | undefined,
  packingListId: string | null | undefined,
  setState: (value: HookState) => void
) => {
  if (!spaceId || !packingListId) {
    return handleMissingInputs(setState);
  }
  return subscribeToItems(spaceId, packingListId, setState) ?? NOOP_UNSUBSCRIBE;
};

const buildResult = (state: HookState) => ({
  items: state.items,
  loading: state.loading,
  hasItems: state.items.length > 0,
});

export function usePackingItems(spaceId: string | null | undefined, packingListId: string | null | undefined) {
  const [state, setState] = useState<HookState>(() => createState(true));
  const [prevListId, setPrevListId] = useState(packingListId);

  if (packingListId !== prevListId) {
    setPrevListId(packingListId);
    if (packingListId) setState(createState(true));
  }

  useEffect(() => manageSubscription(spaceId, packingListId, setState), [spaceId, packingListId]);
  return buildResult(state);
}
