import { doc } from "firebase/firestore";
import { describe, expect, it, vi } from "vitest";
import { mocks } from "./bulkPackItemsTestSetup.ts";
import { type BulkWrite, commitBulkWrites } from "./commitBulkWrites.ts";
import { firestore } from "./firebase.ts";

vi.mock("./firebase.ts", () => ({ firestore: {} }));
vi.mock("firebase/firestore", async () => (await import("./bulkPackItemsTestSetup.ts")).firestoreMock);

const group = (count: number, completed = 1) => ({
  writes: Array.from(
    { length: count },
    () => ({ apply: (batch) => batch.delete(doc(firestore, "items", "item")) }) as BulkWrite
  ),
  completed,
});
const writeCount = () => mocks.batches.map((batch) => batch.delete.mock.calls.length);

describe("bounded bulk write commits", () => {
  it("keeps each item's updates, images, and change record together", async () => {
    const report = vi.fn();
    await commitBulkWrites([group(499), group(2)], report);
    expect(writeCount()).toEqual([499, 2]);
    expect(report.mock.calls.flat()).toEqual([1, 2]);
  });

  it("handles 250 items with images without exceeding 500 writes", async () => {
    const report = vi.fn();
    await commitBulkWrites(
      Array.from({ length: 250 }, () => group(3)),
      report
    );
    expect(writeCount()).toEqual([498, 252]);
    expect(report.mock.calls.flat()).toEqual([166, 250]);
  });

  it("chunks an unusually large image collection before deleting the item and logging it", async () => {
    const report = vi.fn();
    await commitBulkWrites([group(501)], report);
    expect(writeCount()).toEqual([499, 2]);
    expect(report.mock.calls.flat()).toEqual([0, 1]);
  });

  it("only reports confirmed commits and stops after a rejection", async () => {
    const report = vi.fn();
    mocks.writeBatch.mockImplementationOnce(() => {
      const batch = { delete: vi.fn(), commit: vi.fn().mockRejectedValue(new Error("offline")) };
      return batch;
    });
    await expect(commitBulkWrites([group(500), group(2)], report)).rejects.toThrow("offline");
    expect(mocks.writeBatch).toHaveBeenCalledTimes(1);
    expect(report).not.toHaveBeenCalled();
  });

  it("does not commit or report an empty set of writes", async () => {
    const report = vi.fn();
    await commitBulkWrites([], report);
    expect(mocks.writeBatch).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
  });

  it("retains progress from a successful first batch when the next batch fails", async () => {
    const report = vi.fn();
    mocks.writeBatch
      .mockImplementationOnce(() => ({
        delete: vi.fn(),
        commit: vi.fn().mockResolvedValue(undefined),
      }))
      .mockImplementationOnce(() => ({
        delete: vi.fn(),
        commit: vi.fn().mockRejectedValue(new Error("offline")),
      }));
    await expect(commitBulkWrites([group(500), group(2), group(500)], report)).rejects.toThrow("offline");
    expect(report.mock.calls.flat()).toEqual([1]);
    expect(mocks.writeBatch).toHaveBeenCalledTimes(2);
  });

  it("does not advance progress while a commit is still pending", async () => {
    let finish = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    mocks.writeBatch.mockImplementationOnce(() => ({ delete: vi.fn(), commit: () => pending }));
    const report = vi.fn();
    const operation = commitBulkWrites([group(2, 4)], report);
    expect(report).not.toHaveBeenCalled();
    finish();
    await operation;
    expect(report).toHaveBeenCalledExactlyOnceWith(4);
  });
});
