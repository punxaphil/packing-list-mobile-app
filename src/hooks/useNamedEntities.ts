import { collection, onSnapshot, orderBy, QuerySnapshot, query, Unsubscribe } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "~/services/firebase.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";

type HookState = { items: NamedEntity[]; loading: boolean };

const SPACES_COLLECTION = "spaces";
const ORDER_FIELD = "rank";
const NOOP_UNSUBSCRIBE: Unsubscribe = () => undefined;

const createInitialState = (): HookState => ({ items: [], loading: true });
const createEmptyState = (): HookState => ({ items: [], loading: false });

const mapSnapshot = (snapshot: QuerySnapshot): NamedEntity[] =>
  snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as NamedEntity[];

const buildQuery = (spaceId: string, collectionName: string) =>
  query(collection(firestore, SPACES_COLLECTION, spaceId, collectionName), orderBy(ORDER_FIELD, "desc"));

const subscribe = (spaceId: string, collectionName: string, setState: (value: HookState) => void) =>
  onSnapshot(
    buildQuery(spaceId, collectionName),
    (snapshot) => setState({ items: mapSnapshot(snapshot), loading: false }),
    () => setState(createEmptyState())
  );

const manage = (spaceId: string | null | undefined, collectionName: string, setState: (s: HookState) => void) => {
  if (!spaceId) {
    setState(createEmptyState());
    return NOOP_UNSUBSCRIBE;
  }
  return subscribe(spaceId, collectionName, setState);
};

export const useNamedEntities = (spaceId: string | null | undefined, collectionName: string) => {
  const [state, setState] = useState<HookState>(createInitialState);
  useEffect(() => manage(spaceId, collectionName, setState), [spaceId, collectionName]);
  return state;
};
