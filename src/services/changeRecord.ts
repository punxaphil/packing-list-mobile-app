import type { PackItem } from "~/types/PackItem.ts";
import type { ChangeAction, ChangeActor } from "./changeLog.ts";

export const createChangeRecord = (
  actor: ChangeActor,
  item: Pick<PackItem, "name" | "category" | "packingList">,
  action: ChangeAction,
  fromCategoryId?: string
) => ({
  packingList: item.packingList,
  categoryId: item.category,
  itemName: item.name,
  userId: actor.id,
  userName: actor.name,
  action,
  createdAt: Date.now(),
  ...(fromCategoryId === undefined ? {} : { fromCategoryId }),
});
