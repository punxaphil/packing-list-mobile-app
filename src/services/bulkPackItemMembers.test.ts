import { describe, expect, it, vi } from "vitest";
import { createBulkPackItemOperations } from "./bulkPackItems.ts";
import { actor, item, mocks, readItems } from "./bulkPackItemsTestSetup.ts";

vi.mock("./firebase.ts", () => ({ firestore: {} }));
vi.mock("firebase/firestore", async () => (await import("./bulkPackItemsTestSetup.ts")).firestoreMock);

describe("batched member removal", () => {
  it("clears 250 items and records changes in a single commit", async () => {
    const items = Array.from({ length: 250 }, (_, index) => ({ ...item, id: String(index) }));
    readItems(items);
    const report = vi.fn();
    await createBulkPackItemOperations("space", actor).removePackItemMembers(items, report);
    expect(mocks.getDocs).toHaveBeenCalledTimes(9);
    expect(mocks.getDocs.mock.calls.every(([query]) => query.filter.values.length <= 30)).toBe(true);
    expect(mocks.getDoc).toHaveBeenCalledTimes(1);
    expect(mocks.writeBatch).toHaveBeenCalledTimes(1);
    expect(mocks.batches[0].update).toHaveBeenCalledTimes(250);
    expect(mocks.batches[0].set).toHaveBeenCalledTimes(250);
    expect(report).toHaveBeenCalledExactlyOnceWith(250);
  });

  it("preserves packed state using fresh documents and updates no unrelated fields", async () => {
    readItems([item, { ...item, id: "partial", members: [...item.members, { id: "second", checked: false }] }]);
    const report = vi.fn();
    await createBulkPackItemOperations("space", actor).removePackItemMembers(
      [item, { ...item, id: "partial" }],
      report
    );
    expect(mocks.batches[0].update.mock.calls).toEqual([
      ["spaces/space/packItems/item", { members: [], checked: true }],
      ["spaces/space/packItems/partial", { members: [], checked: false }],
    ]);
    expect(mocks.batches[0].set.mock.calls[0][1]).toMatchObject({
      action: "unassigned",
      itemName: "Socks",
      userId: "user",
    });
    expect(report).toHaveBeenCalledWith(3);
  });

  it("does not write when the list has been deleted", async () => {
    readItems([item]);
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    await expect(createBulkPackItemOperations("space", actor).removePackItemMembers([item], vi.fn())).rejects.toThrow(
      "missing packing list"
    );
    expect(mocks.writeBatch).not.toHaveBeenCalled();
  });

  it("supports an absent change actor without emitting log writes", async () => {
    readItems([item]);
    await createBulkPackItemOperations("space").removePackItemMembers([item], vi.fn());
    expect(mocks.batches[0].set).not.toHaveBeenCalled();
  });

  it("skips nonexistent documents and handles an empty selection", async () => {
    readItems([]);
    await createBulkPackItemOperations("space", actor).removePackItemMembers([item], vi.fn());
    await createBulkPackItemOperations("space", actor).removePackItemMembers([], vi.fn());
    expect(mocks.writeBatch).not.toHaveBeenCalled();
  });

  it("splits 251 items into two commits with assignment-weighted progress", async () => {
    const items = Array.from({ length: 251 }, (_, index) => ({
      ...item,
      id: String(index),
      members: Array.from({ length: 4 }, (_, member) => ({ id: String(member), checked: true })),
    }));
    readItems(items);
    const report = vi.fn();
    await createBulkPackItemOperations("space", actor).removePackItemMembers(items, report);
    expect(mocks.batches.map((batch) => batch.update.mock.calls.length + batch.set.mock.calls.length)).toEqual([
      500, 2,
    ]);
    expect(report.mock.calls.flat()).toEqual([1000, 1004]);
  });
});
