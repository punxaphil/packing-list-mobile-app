import { afterEach, describe, expect, it, vi } from "vitest";
import type { PackItem } from "~/types/PackItem.ts";
import { getUndoStep, readTickHistory, restoreTickChanges, saveTickHistory } from "./tickUndoHistory.ts";

const item: PackItem = {
  id: "item",
  name: "Updated name",
  category: "new-category",
  packingList: "list",
  rank: 0,
  checked: true,
  members: [
    { id: "first", checked: true },
    { id: "second", checked: true },
  ],
};

describe("restoreTickChanges", () => {
  it("restores only the changed member's tick on the latest item", () => {
    expect(restoreTickChanges([item], [{ id: item.id, members: [{ id: "first", checked: false }] }])).toEqual([
      { ...item, checked: false, members: [{ id: "first", checked: false }, item.members[1]] },
    ]);
  });

  it("restores the item tick without replacing other fields", () => {
    expect(restoreTickChanges([item], [{ id: item.id, checked: false }])).toEqual([{ ...item, checked: false }]);
  });

  it("skips items deleted since the action", () => {
    expect(restoreTickChanges([], [{ id: item.id, checked: false }])).toEqual([]);
  });

  it("skips stale actions to undo the latest surviving tick", () => {
    expect(getUndoStep([item], [[{ id: item.id, checked: false }], [{ id: "deleted", checked: true }]])).toEqual({
      restored: [{ ...item, checked: false }],
      remaining: [],
    });
  });
});

describe("local tick history", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the newest actions in browser storage", () => {
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    const actions = Array.from({ length: 25 }, (_, index) => [{ id: String(index), checked: false }]);
    saveTickHistory("list", actions);
    expect(readTickHistory("list")).toEqual(actions.slice(-20));
  });

  it("ignores malformed browser history", () => {
    vi.stubGlobal("localStorage", { getItem: () => "not json" });
    expect(readTickHistory("list")).toEqual([]);
  });
});
