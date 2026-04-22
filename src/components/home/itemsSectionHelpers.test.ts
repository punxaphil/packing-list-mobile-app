import { describe, expect, it } from "vitest";
import { getNextItemRank, getTopItemRank } from "./itemsSectionHelpers.ts";

const items = [{ rank: 8 }, { rank: 5 }, { rank: 2 }];

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
});
