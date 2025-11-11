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

type HookState = { lists: NamedEntity[]; loading: boolean };

const USERS_COLLECTION = "users";
const PACKING_LISTS_COLLECTION = "packingLists";
const ORDER_FIELD = "rank";
const NOOP_UNSUBSCRIBE: Unsubscribe = () => undefined;

function createInitialState(): HookState {
  return { lists: [], loading: true };
}

function createEmptyState(): HookState {
  return { lists: [], loading: false };
}

function mapSnapshot(snapshot: QuerySnapshot): NamedEntity[] {
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as NamedEntity[];
}

function buildQuery(userId: string) {
  return query(
    collection(
      getFirestore(),
      USERS_COLLECTION,
      userId,
      PACKING_LISTS_COLLECTION,
    ),
    orderBy(ORDER_FIELD, "desc"),
  );
}

function subscribeToLists(
  userId: string,
  setState: (value: HookState) => void,
) {
  return onSnapshot(
    buildQuery(userId),
    (snapshot) => setState({ lists: mapSnapshot(snapshot), loading: false }),
    (error) => {
      console.error(error);
      setState(createEmptyState());
    },
  );
}

function unsubscribeMissingUser(setState: (value: HookState) => void) {
  setState(createEmptyState());
  return NOOP_UNSUBSCRIBE;
}

function createSubscription(
  userId: string,
  setState: (value: HookState) => void,
) {
  setState(createInitialState());
  return subscribeToLists(userId, setState) ?? NOOP_UNSUBSCRIBE;
}

function manageSubscription(
  userId: string | null | undefined,
  setState: (value: HookState) => void,
) {
  return userId
    ? createSubscription(userId, setState)
    : unsubscribeMissingUser(setState);
}

function buildResult(state: HookState) {
  return {
    packingLists: state.lists,
    loading: state.loading,
    hasLists: state.lists.length > 0,
  };
}

export function usePackingLists(userId: string | null | undefined) {
  const [state, setState] = useState<HookState>(() => createInitialState());
  useEffect(() => manageSubscription(userId, setState), [userId]);
  return buildResult(state);
}
