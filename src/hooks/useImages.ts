import { collection, onSnapshot, QuerySnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "~/services/firebase.ts";
import { Image } from "~/types/Image.ts";

type HookState = { images: Image[]; loading: boolean };

const SPACES_COLLECTION = "spaces";
const IMAGES_COLLECTION = "images";

const createInitialState = (): HookState => ({ images: [], loading: true });
const createEmptyState = (): HookState => ({ images: [], loading: false });

const mapSnapshot = (snapshot: QuerySnapshot): Image[] =>
  snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Image[];

const buildQuery = (spaceId: string) => query(collection(firestore, SPACES_COLLECTION, spaceId, IMAGES_COLLECTION));

const createSnapshotHandler = (setState: (value: HookState) => void) => (snapshot: QuerySnapshot) => {
  setState({ images: mapSnapshot(snapshot), loading: false });
};

const createErrorHandler = (setState: (value: HookState) => void) => () => setState(createEmptyState());

const subscribeToImages = (spaceId: string, setState: (value: HookState) => void) =>
  onSnapshot(buildQuery(spaceId), createSnapshotHandler(setState), createErrorHandler(setState));

export const useImages = (spaceId: string): HookState => {
  const [state, setState] = useState<HookState>(createInitialState);

  useEffect(() => {
    if (!spaceId) return setState(createEmptyState());
    const unsubscribe = subscribeToImages(spaceId, setState);
    return () => unsubscribe();
  }, [spaceId]);

  return state;
};
