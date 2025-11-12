import { useEffect, useState } from "react";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { NamedEntity } from "~/types/NamedEntity.ts";

type HookState = { categories: NamedEntity[]; loading: boolean };

const USERS_COLLECTION = "users";
const CATEGORIES_COLLECTION = "categories";
const ORDER_FIELD = "rank";
const NOOP_UNSUBSCRIBE: Unsubscribe = () => undefined;

const createInitialState = (): HookState => ({ categories: [], loading: true });

const createEmptyState = (): HookState => ({ categories: [], loading: false });

const mapSnapshot = (snapshot: QuerySnapshot): NamedEntity[] =>
  snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as NamedEntity[];

const buildQuery = (userId: string) =>
  query(
    collection(getFirestore(), USERS_COLLECTION, userId, CATEGORIES_COLLECTION),
    orderBy(ORDER_FIELD, "desc"),
  );

const createSnapshotHandler =
  (setState: (value: HookState) => void) => (snapshot: QuerySnapshot) => {
    const categories = mapSnapshot(snapshot);
    setState({ categories, loading: false });
  };

const createErrorHandler =
  (setState: (value: HookState) => void) => (_error: unknown) =>
    setState(createEmptyState());

const subscribeToCategories = (
  userId: string,
  setState: (value: HookState) => void,
) =>
  onSnapshot(
    buildQuery(userId),
    createSnapshotHandler(setState),
    createErrorHandler(setState),
  );

const unsubscribeMissingUser = (setState: (value: HookState) => void) => {
  setState(createEmptyState());
  return NOOP_UNSUBSCRIBE;
};

const manageSubscription = (
  userId: string | null | undefined,
  setState: (value: HookState) => void,
) => {
  if (!userId) return unsubscribeMissingUser(setState);
  setState(createInitialState());
  return subscribeToCategories(userId, setState) ?? NOOP_UNSUBSCRIBE;
};

const buildResult = (state: HookState) => ({
  categories: state.categories,
  loading: state.loading,
});

export function useCategories(userId: string | null | undefined) {
  const [state, setState] = useState<HookState>(() => createInitialState());
  useEffect(() => manageSubscription(userId, setState), [userId]);
  return buildResult(state);
}
