import { collection, onSnapshot, QuerySnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "~/services/firebase.ts";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";

type HookState = { images: Image[]; loading: boolean };

const SPACES_COLLECTION = "spaces";
const IMAGES_COLLECTION = "images";
const PACKING_LISTS_COLLECTION = "packingLists";
const CATEGORIES_COLLECTION = "categories";
const MEMBERS_COLLECTION = "members";
const PACK_ITEMS_COLLECTION = "packItems";

const createInitialState = (): HookState => ({ images: [], loading: true });
const createEmptyState = (): HookState => ({ images: [], loading: false });

const mapSnapshot = (snapshot: QuerySnapshot): Image[] =>
  snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Image[];

const getNamedIds = (snapshot: QuerySnapshot) =>
  new Set(snapshot.docs.map((doc) => (doc.data() as NamedEntity).id ?? doc.id));

const filterImages = (
  images: Image[],
  packingListIds: Set<string>,
  categoryIds: Set<string>,
  memberIds: Set<string>,
  packItemIds: Set<string>
) =>
  images.filter((image) => {
    const type = image.type.toLowerCase();
    if (type === "profile") return true;
    if (["packinglist", "packinglists"].includes(type)) return packingListIds.has(image.typeId);
    if (["category", "categories"].includes(type)) return categoryIds.has(image.typeId);
    if (["member", "members"].includes(type)) return memberIds.has(image.typeId);
    if (["packitem", "packitems"].includes(type)) return packItemIds.has(image.typeId);
    return false;
  });

const buildQuery = (spaceId: string) => query(collection(firestore, SPACES_COLLECTION, spaceId, IMAGES_COLLECTION));

const createErrorHandler = (setState: (value: HookState) => void) => () => setState(createEmptyState());

export const useImages = (spaceId: string): HookState => {
  const [state, setState] = useState<HookState>(createInitialState);

  useEffect(() => {
    if (!spaceId) return setState(createEmptyState());
    let images: Image[] = [];
    let packingListIds = new Set<string>();
    let categoryIds = new Set<string>();
    let memberIds = new Set<string>();
    let packItemIds = new Set<string>();
    const syncImages = () =>
      setState({ images: filterImages(images, packingListIds, categoryIds, memberIds, packItemIds), loading: false });
    const stopImages = onSnapshot(
      buildQuery(spaceId),
      (snapshot) => {
        images = mapSnapshot(snapshot);
        syncImages();
      },
      createErrorHandler(setState)
    );
    const stopPackingLists = onSnapshot(
      collection(firestore, SPACES_COLLECTION, spaceId, PACKING_LISTS_COLLECTION),
      (snapshot) => {
        packingListIds = getNamedIds(snapshot);
        syncImages();
      },
      createErrorHandler(setState)
    );
    const stopCategories = onSnapshot(
      collection(firestore, SPACES_COLLECTION, spaceId, CATEGORIES_COLLECTION),
      (snapshot) => {
        categoryIds = getNamedIds(snapshot);
        syncImages();
      },
      createErrorHandler(setState)
    );
    const stopMembers = onSnapshot(
      collection(firestore, SPACES_COLLECTION, spaceId, MEMBERS_COLLECTION),
      (snapshot) => {
        memberIds = getNamedIds(snapshot);
        syncImages();
      },
      createErrorHandler(setState)
    );
    const stopPackItems = onSnapshot(
      collection(firestore, SPACES_COLLECTION, spaceId, PACK_ITEMS_COLLECTION),
      (snapshot) => {
        packItemIds = new Set(snapshot.docs.map((doc) => (doc.data() as PackItem).id ?? doc.id));
        syncImages();
      },
      createErrorHandler(setState)
    );
    return () => {
      stopImages();
      stopPackingLists();
      stopCategories();
      stopMembers();
      stopPackItems();
    };
  }, [spaceId]);

  return state;
};
