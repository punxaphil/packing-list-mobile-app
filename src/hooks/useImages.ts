import { collection, getFirestore, onSnapshot, QuerySnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image } from "~/types/Image.ts";

type HookState = { images: Image[]; loading: boolean };

const SPACES_COLLECTION = "spaces";
const IMAGES_COLLECTION = "images";

const createInitialState = (): HookState => ({ images: [], loading: true });
const createEmptyState = (): HookState => ({ images: [], loading: false });

const mapSnapshot = (snapshot: QuerySnapshot): Image[] =>
  snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Image[];

const buildQuery = (spaceId: string) =>
  query(collection(getFirestore(), SPACES_COLLECTION, spaceId, IMAGES_COLLECTION));

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
