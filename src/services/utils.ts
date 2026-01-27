import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";

export const UNCATEGORIZED: NamedEntity = {
  id: "",
  name: "Uncategorized",
  rank: Number.MAX_VALUE,
  color: "gray.50",
};

function sortByRank(a?: NamedEntity, b?: NamedEntity) {
  if (!a && b) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  return (b?.rank ?? 0) - (a?.rank ?? 0);
}

export function sortEntities(entities: NamedEntity[]) {
  entities.sort(sortByRank);
}

export function getProfileImage(images: Image[]) {
  return images.find((image) => image.type === "profile");
}
