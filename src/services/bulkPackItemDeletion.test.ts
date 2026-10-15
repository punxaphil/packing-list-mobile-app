import { describe, expect, it, vi } from "vitest";
import { createBulkPackItemOperations } from "./bulkPackItems.ts";
import { actor, item, mocks, readItems } from "./bulkPackItemsTestSetup.ts";

vi.mock("./firebase.ts", () => ({ firestore: {} }));
vi.mock("firebase/firestore", async () => (await import("./bulkPackItemsTestSetup.ts")).firestoreMock);

describe("batched item deletion", () => {
  it("deletes 250 items and records changes with one commit", async () => {
    const items = Array.from({ length: 250 }, (_, index) => ({ ...item, id: String(index) }));
    readItems(items);
    const report = vi.fn();
    await createBulkPackItemOperations("space", actor).deletePackItems(items, report);
    expect(mocks.getDocs).toHaveBeenCalledTimes(18);
    expect(mocks.writeBatch).toHaveBeenCalledTimes(1);
    expect(mocks.batches[0].delete).toHaveBeenCalledTimes(250);
    expect(mocks.batches[0].set).toHaveBeenCalledTimes(250);
    expect(report).toHaveBeenCalledExactlyOnceWith(250);
  });

  it("deletes both item-image types but preserves unrelated images", async () => {
    readItems(
      [item],
      [
        { id: "legacy", typeId: item.id, type: "packItem" },
        { id: "current", typeId: item.id, type: "packItems" },
        { id: "category", typeId: item.id, type: "categories" },
        { id: "other", typeId: "other", type: "packItems" },
      ]
    );
    await createBulkPackItemOperations("space", actor).deletePackItems([item], vi.fn());
    expect(mocks.batches[0].delete.mock.calls.flat()).toEqual([
      "spaces/space/images/legacy",
      "spaces/space/images/current",
      "spaces/space/packItems/item",
    ]);
    expect(mocks.batches[0].set.mock.calls[0][1]).toMatchObject({ action: "deleted", itemName: "Socks" });
  });

  it("does not report success if the batch commit fails", async () => {
    readItems([item]);
    mocks.writeBatch.mockImplementationOnce(() => {
      const batch = { delete: vi.fn(), set: vi.fn(), commit: vi.fn().mockRejectedValue(new Error("offline")) };
      return batch;
    });
    const report = vi.fn();
    await expect(createBulkPackItemOperations("space", actor).deletePackItems([item], report)).rejects.toThrow(
      "offline"
    );
    expect(report).not.toHaveBeenCalled();
  });

  it("deduplicates selected ids so deletes and logs are not repeated", async () => {
    readItems([item]);
    await createBulkPackItemOperations("space", actor).deletePackItems([item, item], vi.fn());
    expect(mocks.batches[0].delete).toHaveBeenCalledTimes(1);
    expect(mocks.batches[0].set).toHaveBeenCalledTimes(1);
  });
});
