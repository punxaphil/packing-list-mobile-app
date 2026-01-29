import { collection, getFirestore, onSnapshot, QuerySnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image } from "~/types/Image.ts";

type HookState = { images: Image[]; loading: boolean };

const USERS_COLLECTION = "users";
const IMAGES_COLLECTION = "images";

const createInitialState = (): HookState => ({ images: [], loading: true });
const createEmptyState = (): HookState => ({ images: [], loading: false });

const mapSnapshot = (snapshot: QuerySnapshot): Image[] =>
  snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Image[];

const buildQuery = (userId: string) => query(collection(getFirestore(), USERS_COLLECTION, userId, IMAGES_COLLECTION));

const createSnapshotHandler = (setState: (value: HookState) => void) => (snapshot: QuerySnapshot) => {
  setState({ images: mapSnapshot(snapshot), loading: false });
};

const createErrorHandler = (setState: (value: HookState) => void) => () => setState(createEmptyState());

const subscribeToImages = (userId: string, setState: (value: HookState) => void) =>
  onSnapshot(buildQuery(userId), createSnapshotHandler(setState), createErrorHandler(setState));

export const useImages = (userId: string): HookState => {
  const [state, setState] = useState<HookState>(createInitialState);

  useEffect(() => {
    if (!userId) return setState(createEmptyState());
    const unsubscribe = subscribeToImages(userId, setState);
    return () => unsubscribe();
  }, [userId]);

  return state;
};
