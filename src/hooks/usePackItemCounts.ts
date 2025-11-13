import { useEffect, useState } from "react";
import { collection, getFirestore, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { PackItem } from "~/types/PackItem.ts";

type CountEntry = { total: number; packed: number };
export type PackItemCountRecord = Record<string, CountEntry>;
type CountState = { counts: PackItemCountRecord; loading: boolean };

const USERS_COLLECTION = "users";
const PACK_ITEMS_COLLECTION = "packItems";
const createInitialState = (): CountState => ({ counts: {}, loading: true });
const createEmptyState = (): CountState => ({ counts: {}, loading: false });
const mapSnapshot = (snapshot: QuerySnapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PackItem));
const sumCounts = (items: PackItem[]): PackItemCountRecord => {
  const counts: PackItemCountRecord = {};
  for (const item of items) {
    const current = counts[item.packingList] ?? { total: 0, packed: 0 };
    counts[item.packingList] = { total: current.total + 1, packed: current.packed + (item.checked ? 1 : 0) };
  }
  return counts;
};
const handleSnapshot = (setState: (value: CountState) => void) => (snapshot: QuerySnapshot) => {
  setState({ counts: sumCounts(mapSnapshot(snapshot)), loading: false });
};
const handleError = (setState: (value: CountState) => void) => () => setState(createEmptyState());
const buildQuery = (userId: string) => collection(getFirestore(), USERS_COLLECTION, userId, PACK_ITEMS_COLLECTION);
const subscribeToCounts = (userId: string, setState: (value: CountState) => void) => onSnapshot(buildQuery(userId), handleSnapshot(setState), handleError(setState));
const manageSubscription = (userId: string | null | undefined, setState: (value: CountState) => void) => {
  if (!userId) {
    setState(createEmptyState());
    return undefined;
  }
  setState(createInitialState());
  return subscribeToCounts(userId, setState);
};
export const usePackItemCounts = (userId: string | null | undefined) => {
  const [state, setState] = useState<CountState>(() => createInitialState());
  useEffect(() => manageSubscription(userId, setState), [userId]);
  return state;
};
