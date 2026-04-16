import { collection, onSnapshot, type QuerySnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "~/services/firebase.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { PackItem } from "~/types/PackItem.ts";

const SPACES = "spaces";
const PACK_ITEMS = "packItems";

const computeCounts = (snapshot: QuerySnapshot): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const doc of snapshot.docs) {
    for (const member of (doc.data() as PackItem).members ?? []) {
      result[member.id] = (result[member.id] ?? 0) + 1;
    }
  }
  return result;
};

export const useMemberItemCounts = () => {
  const { spaceId } = useSpace();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const ref = collection(firestore, SPACES, spaceId, PACK_ITEMS);
    return onSnapshot(ref, (snap) => setCounts(computeCounts(snap)));
  }, [spaceId]);

  return { counts };
};
