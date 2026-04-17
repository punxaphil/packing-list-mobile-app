import { collection, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "~/services/firebase.ts";
import { getPackItemChecked } from "~/services/packItemState.ts";
import { PackItem } from "~/types/PackItem.ts";

type CountEntry = { total: number; packed: number };
export type PackItemCountRecord = Record<string, CountEntry>;
type CountState = { counts: PackItemCountRecord; loading: boolean };

const SPACES = "spaces";
const PACK_ITEMS = "packItems";
const createInitialState = (): CountState => ({ counts: {}, loading: true });
const createEmptyState = (): CountState => ({ counts: {}, loading: false });
const mapSnapshot = (snapshot: QuerySnapshot) =>
  snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as PackItem);
const sumCounts = (items: PackItem[]): PackItemCountRecord => {
  const counts: PackItemCountRecord = {};
  for (const item of items) {
    const current = counts[item.packingList] ?? { total: 0, packed: 0 };
    counts[item.packingList] = {
      total: current.total + 1,
      packed: current.packed + (getPackItemChecked(item) ? 1 : 0),
    };
  }
  return counts;
};
const handleSnapshot = (setState: (value: CountState) => void) => (snapshot: QuerySnapshot) => {
  setState({ counts: sumCounts(mapSnapshot(snapshot)), loading: false });
};
const handleError = (setState: (value: CountState) => void) => () => setState(createEmptyState());
const buildQuery = (spaceId: string) => collection(firestore, SPACES, spaceId, PACK_ITEMS);
const subscribeToCounts = (spaceId: string, setState: (value: CountState) => void) =>
  onSnapshot(buildQuery(spaceId), handleSnapshot(setState), handleError(setState));
const manageSubscription = (spaceId: string | null | undefined, setState: (value: CountState) => void) => {
  if (!spaceId) {
    setState(createEmptyState());
    return undefined;
  }
  setState(createInitialState());
  return subscribeToCounts(spaceId, setState);
};
export const usePackItemCounts = (spaceId: string | null | undefined) => {
  const [state, setState] = useState<CountState>(() => createInitialState());
  useEffect(() => manageSubscription(spaceId, setState), [spaceId]);
  return state;
};
