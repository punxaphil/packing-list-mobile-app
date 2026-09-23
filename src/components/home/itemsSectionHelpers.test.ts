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
const visibleIds = (items: PackItem[], checkedItemsLast: boolean) =>
  buildSections(items, [category], checkedItemsLast)
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

  it("keeps rank order by default, including on revisit", () => {
    const checked = entries.map((item) => (item.id === "first" ? { ...item, checked: true } : item));
    expect(visibleIds(checked, false)).toEqual(["first", "second", "third"]);
    expect(visibleIds([checked[1], checked[0], checked[2]], false)).toEqual(["second", "first", "third"]);
  });

  it("moves checked items to the bottom immediately when enabled", () => {
    const checked = entries.map((item) => (item.id === "first" ? { ...item, checked: true } : item));
    expect(visibleIds(checked, true)).toEqual(["second", "third", "first"]);
    expect(visibleIds(entries, true)).toEqual(["first", "second", "third"]);
  });

  it("uses member checkoffs for the checked-last preference", () => {
    const assigned = entries.map((item) =>
      item.id === "first" ? { ...item, members: [{ id: "member", checked: true }] } : item
    );
    expect(visibleIds(assigned, false)).toEqual(["first", "second", "third"]);
    expect(visibleIds(assigned, true)).toEqual(["second", "third", "first"]);
  });
});
