import { describe, expect, it } from "vitest";
import { buildEntityColors, buildItemCategoryColors, buildListColors } from "./listColors.ts";

const entities = [
  { id: "a", name: "A", rank: 0 },
  { id: "b", name: "B", rank: 1 },
  { id: "c", name: "C", rank: 2 },
  { id: "d", name: "D", rank: 3 },
] as const;

const lists = entities.map((entity) => ({ ...entity, itemCount: 0, packedCount: 0 }));

describe("listColors", () => {
  it("assigns different adjacent colors in items view", () => {
    const colors = buildItemCategoryColors([...entities]);

    expect(colors.a).not.toBe(colors.b);
    expect(colors.b).not.toBe(colors.c);
    expect(colors.c).not.toBe(colors.d);
  });

  it("follows display order instead of fixed ids", () => {
    const forward = buildItemCategoryColors([...entities]);
    const reversed = buildItemCategoryColors([...entities].reverse());

    expect(forward.a).not.toBe(reversed.a);
    expect(reversed.d).toBe(forward.a);
  });

  it("keeps adjacent entity colors distinct", () => {
    const entityColors = buildEntityColors([...entities]);

    expect(entityColors.a).not.toBe(entityColors.b);
    expect(entityColors.b).not.toBe(entityColors.c);
  });

  it("uses the same ordered scheme for lists and items", () => {
    const itemColors = buildItemCategoryColors([...entities]);
    const listColors = buildListColors(lists);

    expect(listColors.a).toBe(itemColors.a);
    expect(listColors.b).toBe(itemColors.b);
  });
});
