import { getAuth } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  QuerySnapshot,
  query,
  Unsubscribe,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "~/services/firebase.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";

type HookState = { lists: NamedEntity[]; loading: boolean };

const SPACES_COLLECTION = "spaces";
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
    ...item.data(),
    id: item.id,
  })) as NamedEntity[];
}

function createSnapshotHandler(
  spaceId: string,
  setState: (value: HookState) => void,
) {
  return (snapshot: QuerySnapshot) => {
    const lists = mapSnapshot(snapshot);
    logInfo("Loaded packing lists", { spaceId, count: lists.length });
    setState({ lists, loading: false });
  };
}

function createErrorHandler(
  spaceId: string,
  setState: (value: HookState) => void,
) {
  return (error: unknown) => {
    const isSignedOut = !getAuth().currentUser;
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? error.code
        : undefined;
    const isPermissionDenied = code === "permission-denied";
    if (isSignedOut && isPermissionDenied) {
      setState(createEmptyState());
      return;
    }
    logError("Failed to load packing lists", { spaceId, error });
    setState(createEmptyState());
  };
}

function buildQuery(spaceId: string) {
  return query(
    collection(firestore, SPACES_COLLECTION, spaceId, PACKING_LISTS_COLLECTION),
    orderBy(ORDER_FIELD, "desc"),
  );
}

function subscribeToLists(
  spaceId: string,
  setState: (value: HookState) => void,
) {
  return onSnapshot(
    buildQuery(spaceId),
    createSnapshotHandler(spaceId, setState),
    createErrorHandler(spaceId, setState),
  );
}

function unsubscribeMissingUser(setState: (value: HookState) => void) {
  logInfo("Skipping packing lists subscription: missing user");
  setState(createEmptyState());
  return NOOP_UNSUBSCRIBE;
}

function createSubscription(
  spaceId: string,
  setState: (value: HookState) => void,
) {
  logInfo("Subscribing to packing lists", { spaceId });
  setState(createInitialState());
  return subscribeToLists(spaceId, setState) ?? NOOP_UNSUBSCRIBE;
}

function manageSubscription(
  spaceId: string | null | undefined,
  setState: (value: HookState) => void,
) {
  return spaceId
    ? createSubscription(spaceId, setState)
    : unsubscribeMissingUser(setState);
}

function buildResult(state: HookState) {
  return {
    packingLists: state.lists,
    loading: state.loading,
    hasLists: !state.loading && state.lists.length > 0,
  };
}

export function usePackingLists(spaceId: string | null | undefined) {
  const [state, setState] = useState<HookState>(() => createInitialState());
  useEffect(() => manageSubscription(spaceId, setState), [spaceId]);
  return buildResult(state);
}
