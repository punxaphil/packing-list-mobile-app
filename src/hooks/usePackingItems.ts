import { collection, getFirestore, onSnapshot, QuerySnapshot, query, Unsubscribe, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { PackItem } from "~/types/PackItem.ts";

type HookState = { items: PackItem[]; loading: boolean; sourceKey: string | null };

const SPACES_COLLECTION = "spaces";
const PACK_ITEMS_COLLECTION = "packItems";
const ORDER_FIELD = "rank" as const;
const NOOP_UNSUBSCRIBE: Unsubscribe = () => undefined;

const createSourceKey = (spaceId: string | null | undefined, packingListId: string | null) => {
  if (!spaceId || !packingListId) return null;
  return `${spaceId}:${packingListId}`;
};

const createState = (sourceKey: string | null, loading: boolean, items: PackItem[] = []) => ({
  sourceKey,
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

const handleSnapshot = (sourceKey: string, setState: (value: HookState) => void) => (snapshot: QuerySnapshot) => {
  const items = mapSnapshot(snapshot);
  setState(createState(sourceKey, false, items));
};

const handleError = (sourceKey: string, setState: (value: HookState) => void) => (_error: unknown) => {
  setState(createState(sourceKey, false));
};

const subscribeToItems = (
  spaceId: string,
  packingListId: string,
  sourceKey: string,
  setState: (value: HookState) => void
) =>
  onSnapshot(buildQuery(spaceId, packingListId), handleSnapshot(sourceKey, setState), handleError(sourceKey, setState));

const handleMissingInputs = (setState: (value: HookState) => void) => {
  setState(createState(null, false));
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
  const sourceKey = `${spaceId}:${packingListId}`;
  return subscribeToItems(spaceId, packingListId, sourceKey, setState) ?? NOOP_UNSUBSCRIBE;
};

const buildResult = (state: HookState) => ({
  items: state.items,
  loading: state.loading,
  hasItems: state.items.length > 0,
});

export function usePackingItems(spaceId: string | null | undefined, packingListId: string | null | undefined) {
  const normalizedListId = packingListId ?? null;
  const sourceKey = createSourceKey(spaceId, normalizedListId);
  const [state, setState] = useState<HookState>(() => createState(sourceKey, Boolean(sourceKey)));

  useEffect(() => {
    setState(createState(sourceKey, Boolean(sourceKey)));
  }, [sourceKey]);

  useEffect(() => manageSubscription(spaceId, packingListId, setState), [spaceId, packingListId]);
  if (state.sourceKey !== sourceKey) {
    return buildResult(createState(sourceKey, Boolean(sourceKey)));
  }
  return buildResult(state);
}
