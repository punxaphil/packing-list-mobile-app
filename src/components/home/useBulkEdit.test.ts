import { afterEach, describe, expect, it, vi } from "vitest";
import { busyOperation } from "~/services/busyOperation.ts";
import type { WriteDb } from "~/services/database.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { showActionSheet } from "./showActionSheet.ts";
import { useBulkEdit } from "./useBulkEdit.ts";

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("react", () => ({ useState: () => [false, vi.fn()] }));
vi.mock("./Toast.tsx", () => ({ useToast: () => ({ show: showToast }) }));
vi.mock("./showActionSheet.ts", () => ({ showActionSheet: vi.fn() }));

const item: PackItem = {
  id: "item",
  name: "Socks",
  checked: false,
  members: [{ id: "member", checked: true }],
  category: "category",
  packingList: "list",
  rank: 1,
};
const confirmAction = (index: number) => {
  vi.mocked(showActionSheet).mock.lastCall?.[1][index].onPress?.();
  vi.mocked(showActionSheet).mock.lastCall?.[1][0].onPress?.();
};

afterEach(() => vi.clearAllMocks());

describe("bulk edit input blocking", () => {
  it("blocks the whole member-removal workflow until the last write finishes", async () => {
    let finish = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const updatePackItem = vi.fn().mockResolvedValueOnce(undefined).mockReturnValueOnce(pending);
    const db = { updatePackItem } as unknown as WriteDb;
    useBulkEdit([item, { ...item, id: "second" }], db).open();
    expect(busyOperation.getSnapshot().busy).toBe(false);
    confirmAction(1);
    expect(busyOperation.getSnapshot().busy).toBe(true);
    await vi.waitFor(() => expect(updatePackItem).toHaveBeenCalledTimes(2));
    expect(updatePackItem.mock.calls[0][0]).toMatchObject({ members: [], checked: true });
    expect(busyOperation.getSnapshot().busy).toBe(true);
    finish();
    await vi.waitFor(() => expect(busyOperation.getSnapshot().busy).toBe(false));
  });

  it("releases input and retains error feedback when a bulk write fails", async () => {
    const updatePackItem = vi.fn().mockRejectedValue(new Error("offline"));
    useBulkEdit([item], { updatePackItem } as unknown as WriteDb).open();
    confirmAction(1);
    await vi.waitFor(() => expect(showToast).toHaveBeenCalledOnce());
    expect(busyOperation.getSnapshot()).toEqual({ busy: false, showLoader: false });
  });

  it("also blocks removal of ticked items", async () => {
    let finish = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const deletePackItem = vi.fn().mockReturnValue(pending);
    useBulkEdit([item], { deletePackItem } as unknown as WriteDb).open();
    confirmAction(0);
    expect(busyOperation.getSnapshot().busy).toBe(true);
    expect(deletePackItem).toHaveBeenCalledWith(item.id);
    finish();
    await vi.waitFor(() => expect(busyOperation.getSnapshot().busy).toBe(false));
  });
});
