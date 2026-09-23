import { describe, expect, it } from "vitest";
import type { PackItem } from "~/types/PackItem.ts";
import { buildSections, getNextItemRank, getTopItemRank } from "./itemsSectionHelpers.ts";

const items = [{ rank: 8 }, { rank: 5 }, { rank: 2 }];
const category = { id: "category", name: "Category", rank: 1 };
const entries: PackItem[] = ["first", "second", "third"].map((id, index) => ({
  id,
  name: id,
  category: category.id,
  packingList: "list",
  rank: 3 - index,
  checked: false,
  members: [],
}));
const visibleIds = (items: PackItem[], visit: ReadonlyMap<string, boolean>) =>
  buildSections(items, [category], visit)
    .find((section) => section.category.id === category.id)
    ?.items.map((item) => item.id);

describe("itemsSectionHelpers", () => {
  it("returns the next bottom rank below the current minimum", () => {
    expect(getNextItemRank(items)).toBe(1);
  });

  it("returns the next top rank above the current maximum", () => {
    expect(getTopItemRank(items)).toBe(9);
  });

  it("reserves enough top ranks for a batch insert", () => {
    expect(getTopItemRank(items, 3)).toBe(11);
  });

  it("keeps checked items in place until revisit, while honoring drag order", () => {
    const visit = new Map(entries.map((item) => [item.id, item.checked]));
    const checked = entries.map((item) => (item.id === "first" ? { ...item, checked: true } : item));
    expect(visibleIds(checked, visit)).toEqual(["first", "second", "third"]);
    expect(visibleIds(checked, new Map(checked.map((item) => [item.id, item.checked])))).toEqual([
      "second",
      "third",
      "first",
    ]);
    expect(visibleIds([checked[1], checked[0], checked[2]], visit)).toEqual(["second", "first", "third"]);
  });
});
