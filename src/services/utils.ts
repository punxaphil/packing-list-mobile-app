import i18next from "i18next";
import { NamedEntity } from "~/types/NamedEntity.ts";

export const UNCATEGORIZED: NamedEntity = {
  id: "",
  get name() {
    return i18next.t("category.uncategorized");
  },
  rank: Number.MAX_VALUE,
  color: "gray.50",
};

export const getCategoryKey = (c: NamedEntity) => c.id || "__uncategorized__";

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
