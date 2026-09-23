import { describe, expect, it } from "vitest";
import { computeEntityDropIndex } from "./useEntityOrdering.ts";

const ids = ["a", "b", "c", "d"];
const layouts = Object.fromEntries(ids.map((id, index) => [id, { x: 0, y: index * 60, width: 300, height: 56 }]));

describe("computeEntityDropIndex", () => {
  it("moves up only after the dragged center crosses each row center", () => {
    expect(computeEntityDropIndex(ids, { id: "c", categoryId: "", offsetY: -110 }, layouts)).toBe(1);
    expect(computeEntityDropIndex(ids, { id: "c", categoryId: "", offsetY: -125 }, layouts)).toBe(0);
  });

  it("moves down only after the dragged center crosses each row center", () => {
    expect(computeEntityDropIndex(ids, { id: "b", categoryId: "", offsetY: 110 }, layouts)).toBe(2);
    expect(computeEntityDropIndex(ids, { id: "b", categoryId: "", offsetY: 125 }, layouts)).toBe(3);
  });
});
