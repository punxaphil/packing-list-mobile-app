import { useEffect, useState } from "react";
import { collection, getFirestore, onSnapshot, orderBy, query, QuerySnapshot, Unsubscribe } from "firebase/firestore";
import { NamedEntity } from "~/types/NamedEntity.ts";

type HookState = { items: NamedEntity[]; loading: boolean };

const USERS_COLLECTION = "users";
const ORDER_FIELD = "rank";
const NOOP_UNSUBSCRIBE: Unsubscribe = () => undefined;

const createInitialState = (): HookState => ({ items: [], loading: true });
const createEmptyState = (): HookState => ({ items: [], loading: false });

const mapSnapshot = (snapshot: QuerySnapshot): NamedEntity[] =>
  snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as NamedEntity[];

const buildQuery = (userId: string, collectionName: string) =>
  query(collection(getFirestore(), USERS_COLLECTION, userId, collectionName), orderBy(ORDER_FIELD, "desc"));

const subscribe = (userId: string, collectionName: string, setState: (value: HookState) => void) =>
  onSnapshot(
    buildQuery(userId, collectionName),
    (snapshot) => setState({ items: mapSnapshot(snapshot), loading: false }),
    () => setState(createEmptyState()),
  );

const manage = (userId: string | null | undefined, collectionName: string, setState: (s: HookState) => void) => {
  if (!userId) {
    setState(createEmptyState());
    return NOOP_UNSUBSCRIBE;
  }
  return subscribe(userId, collectionName, setState);
};

export const useNamedEntities = (userId: string | null | undefined, collectionName: string) => {
  const [state, setState] = useState<HookState>(createInitialState);
  useEffect(() => manage(userId, collectionName, setState), [userId, collectionName]);
  return state;
};
