import { afterEach, describe, expect, it, vi } from "vitest";
import { busyOperation } from "~/services/busyOperation.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { showActionSheet } from "../home/showActionSheet.ts";
import { useEmptyEntityBulkEdit } from "./useEmptyEntityBulkEdit.ts";

const { readItems, showToast } = vi.hoisted(() => ({ readItems: vi.fn(), showToast: vi.fn() }));
vi.mock("react", () => ({ useState: () => [false, vi.fn()] }));
vi.mock("~/providers/SpaceContext.ts", () => ({
  useSpace: () => ({ writeDb: { getPackItemsForAllPackingLists: readItems } }),
}));
vi.mock("../home/Toast.tsx", () => ({ useToast: () => ({ show: showToast }) }));
vi.mock("../home/showActionSheet.ts", () => ({ showActionSheet: vi.fn() }));

const entities: NamedEntity[] = [
  { id: "first", name: "First", rank: 1 },
  { id: "second", name: "Second", rank: 2 },
];
const remove = (onDelete: (entity: NamedEntity) => Promise<void>) => {
  useEmptyEntityBulkEdit({
    entities,
    isEligible: () => true,
    hasItem: (entity, item) => entity.id === item.category,
    onDelete,
    copy: { bulkEdit: "", bulkRemoveEmpty: "", bulkNone: "", bulkFailed: "failed" },
    menuKey: "category.bulkRemoveEmptyCount",
    confirmKey: "category.bulkConfirm",
    message: "removingEmptyCategories",
  }).open();
  vi.mocked(showActionSheet).mock.lastCall?.[1][0].onPress?.();
  vi.mocked(showActionSheet).mock.lastCall?.[1][0].onPress?.();
};

afterEach(() => {
  expect(busyOperation.getSnapshot()).toEqual({ busy: false, showLoader: false });
  vi.clearAllMocks();
});

describe("empty entity deletion progress", () => {
  it("counts only entities still empty after revalidation", async () => {
    readItems.mockResolvedValue([{ category: "second" }]);
    const onDelete = vi.fn(async () => {
      expect(busyOperation.getSnapshot().details).toEqual({
        message: "removingEmptyCategories",
        total: 1,
        completed: 0,
      });
    });
    remove(onDelete);
    expect(busyOperation.getSnapshot().busy).toBe(true);
    await vi.waitFor(() => expect(busyOperation.getSnapshot().busy).toBe(false));
    expect(onDelete).toHaveBeenCalledExactlyOnceWith(entities[0]);
    expect(showToast).toHaveBeenCalledWith("failed");
  });

  it("retains error feedback and releases input when revalidation fails", async () => {
    readItems.mockRejectedValue(new Error("offline"));
    const onDelete = vi.fn();
    remove(onDelete);
    await vi.waitFor(() => expect(showToast).toHaveBeenCalledWith("failed"));
    expect(onDelete).not.toHaveBeenCalled();
  });
});
