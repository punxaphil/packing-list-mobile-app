import { describe, expect, it } from "vitest";
import type { PackItem } from "~/types/PackItem.ts";
import { getEntitiesWithoutItems } from "./entityValidation.ts";

const entities = [
  { id: "empty", name: "Empty", rank: 0 },
  { id: "used", name: "Used", rank: 1 },
];

const item: PackItem = {
  id: "item",
  name: "Socks",
  packingList: "used",
  category: "used",
  members: ["used"] as unknown as PackItem["members"],
  checked: false,
  rank: 0,
};

describe("getEntitiesWithoutItems", () => {
  it("excludes lists and categories referenced by items", () => {
    expect(getEntitiesWithoutItems(entities, [item], (entity, entry) => entry.packingList === entity.id)).toEqual([
      entities[0],
    ]);
    expect(getEntitiesWithoutItems(entities, [item], (entity, entry) => entry.category === entity.id)).toEqual([
      entities[0],
    ]);
  });

  it("excludes members referenced by legacy string assignments", () => {
    expect(
      getEntitiesWithoutItems(entities, [item], (entity, entry) =>
        entry.members.some((member) => member.id === entity.id)
      )
    ).toEqual([entities[0]]);
  });
});
