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
const LOG_SCOPE = "PackingLists";

function logInfo(message: string, payload?: Record<string, unknown>) {
  console.log(LOG_SCOPE, message, ...(payload ? [payload] : []));
}

function logError(message: string, payload?: Record<string, unknown>) {
  console.error(LOG_SCOPE, message, ...(payload ? [payload] : []));
}

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

function createSnapshotHandler(
  userId: string,
  setState: (value: HookState) => void,
) {
  return (snapshot: QuerySnapshot) => {
    const lists = mapSnapshot(snapshot);
    logInfo("Loaded packing lists", { userId, count: lists.length });
    setState({ lists, loading: false });
  };
}

function createErrorHandler(
  userId: string,
  setState: (value: HookState) => void,
) {
  return (error: unknown) => {
    logError("Failed to load packing lists", { userId, error });
    setState(createEmptyState());
  };
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
    createSnapshotHandler(userId, setState),
    createErrorHandler(userId, setState),
  );
}

function unsubscribeMissingUser(setState: (value: HookState) => void) {
  logInfo("Skipping packing lists subscription: missing user");
  setState(createEmptyState());
  return NOOP_UNSUBSCRIBE;
}

function createSubscription(
  userId: string,
  setState: (value: HookState) => void,
) {
  logInfo("Subscribing to packing lists", { userId });
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
    hasLists: !state.loading && state.lists.length > 0,
  };
}

export function usePackingLists(userId: string | null | undefined) {
  const [state, setState] = useState<HookState>(() => createInitialState());
  useEffect(() => manageSubscription(userId, setState), [userId]);
  return buildResult(state);
}
