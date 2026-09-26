import { describe, expect, it } from "vitest";
import { getPreviewLines } from "./ActionMenuPreview.tsx";

const items = [
  { id: "first", name: "Socks" },
  { id: "second", name: "Shirt" },
  { id: "third", name: "Shoes" },
];

describe("getPreviewLines", () => {
  it("shows all names when they fit", () => {
    expect(getPreviewLines(items, 3)).toEqual(items);
  });

  it("reserves the last visible line for an ellipsis", () => {
    expect(getPreviewLines(items, 2)).toEqual([items[0], { id: "overflow", name: "..." }]);
    expect(getPreviewLines(items, 1)).toEqual([{ id: "overflow", name: "..." }]);
  });

  it("does not render a preview when no lines fit", () => {
    expect(getPreviewLines(items, 0)).toEqual([]);
  });
});
