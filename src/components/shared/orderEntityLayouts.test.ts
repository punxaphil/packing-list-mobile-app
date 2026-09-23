import { describe, expect, it } from "vitest";
import { orderEntityLayouts } from "./orderEntityLayouts.ts";

const layouts = {
  first: { x: 0, y: 0, width: 300, height: 56 },
  second: { x: 0, y: 60, width: 300, height: 72 },
  third: { x: 0, y: 136, width: 300, height: 56 },
};

describe("orderEntityLayouts", () => {
  it("uses current order even when measured positions are stale", () => {
    const ordered = orderEntityLayouts(["first", "third", "second"], layouts);

    expect(ordered.third.y).toBe(60);
    expect(ordered.second.y).toBe(120);
    expect(ordered.second.height).toBe(72);
  });

  it("preserves list top padding and section separators after reordering", () => {
    const ordered = orderEntityLayouts(["first", "third", "second"], layouts, 4, new Set([0]));

    expect(ordered.first.y).toBe(4);
    expect(ordered.third.y).toBe(72);
    expect(ordered.second.y).toBe(132);
  });

  it("places second and third items from the body padding despite stale measured positions", () => {
    const stale = { ...layouts, second: { ...layouts.second, y: 136 }, third: { ...layouts.third, y: 60 } };
    const ordered = orderEntityLayouts(["first", "second", "third"], stale, 4);

    expect(ordered.second.y).toBe(64);
    expect(ordered.third.y).toBe(140);
  });

  it("keeps measured layouts until every row is available", () => {
    expect(orderEntityLayouts(["first", "missing"], layouts)).toBe(layouts);
  });
});
