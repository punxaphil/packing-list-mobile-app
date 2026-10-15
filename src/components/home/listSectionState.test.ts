import i18next from "i18next";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import en from "~/i18n/locales/en.json";
import { busyOperation } from "~/services/busyOperation.ts";
import { useListActions } from "./listSectionState.ts";
import type { PackingListSummary, SelectionState } from "./types.ts";

const { writeDb } = vi.hoisted(() => ({
  writeDb: {
    addPackingList: vi.fn(),
    updatePackingList: vi.fn(),
    copyPackItemsToList: vi.fn(),
  },
}));
vi.mock("react", () => ({ useCallback: (callback: unknown) => callback }));
vi.mock("~/providers/SpaceContext.ts", () => ({ useSpace: () => ({ writeDb }) }));
vi.mock("./layoutAnimation.ts", () => ({ animateLayout: vi.fn() }));

const list: PackingListSummary = { id: "source", name: "Trip", rank: 1, itemCount: 1 };
const selection = { select: vi.fn(), clear: vi.fn() } as unknown as SelectionState;

beforeAll(async () => {
  await i18next.init({ lng: "en", resources: { en: { translation: en } } });
});
afterEach(() => vi.clearAllMocks());

describe("list copy busy state", () => {
  it("keeps input blocked until all writes settle even if one fails", async () => {
    let finish = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    writeDb.addPackingList.mockResolvedValue("copy");
    writeDb.updatePackingList.mockRejectedValue(new Error("offline"));
    writeDb.copyPackItemsToList.mockReturnValue(pending);
    const actions = useListActions([list], selection, null, []);
    const result = actions.onCopy(list);
    const failure = expect(result).rejects.toThrow("offline");
    await vi.waitFor(() => expect(writeDb.copyPackItemsToList).toHaveBeenCalled());
    expect(busyOperation.getSnapshot().busy).toBe(true);
    finish();
    await failure;
    expect(busyOperation.getSnapshot().busy).toBe(false);
    expect(selection.select).not.toHaveBeenCalled();
  });

  it("selects a successfully copied list and releases input", async () => {
    writeDb.addPackingList.mockResolvedValue("copy");
    writeDb.updatePackingList.mockResolvedValue(undefined);
    writeDb.copyPackItemsToList.mockResolvedValue(undefined);
    await useListActions([list], selection, null, []).onCopy(list);
    expect(selection.select).toHaveBeenCalledWith("copy");
    expect(busyOperation.getSnapshot().busy).toBe(false);
  });
});
