import { afterEach, describe, expect, it, vi } from "vitest";
import { busyOperation, runBusyOperation } from "./busyOperation.ts";
import { runBusyTasks } from "./busyTasks.ts";

afterEach(() => expect(busyOperation.getSnapshot()).toEqual({ busy: false, showLoader: false }));

describe("bulk operation progress", () => {
  it("counts successful writes rather than queued writes", async () => {
    const snapshots: unknown[] = [];
    await runBusyTasks([1, 2, 3], async () => snapshots.push(busyOperation.getSnapshot().details), "removingItems");
    expect(snapshots).toEqual([0, 1, 2].map((completed) => ({ message: "removingItems", total: 3, completed })));
  });

  it("counts member assignments rather than affected items", async () => {
    const completed: number[] = [];
    const unsubscribe = busyOperation.subscribe(() => {
      const details = busyOperation.getSnapshot().details;
      if (details) completed.push(details.completed ?? 0);
    });
    await runBusyTasks(
      [4, 2],
      async () => undefined,
      "removingMembers",
      (members) => members
    );
    unsubscribe();
    expect(completed).toEqual([0, 4, 6]);
  });

  it("does not report failed writes as completed and stops remaining writes", async () => {
    const snapshots: unknown[] = [];
    const action = vi.fn(async (item: number) => {
      snapshots.push(busyOperation.getSnapshot().details?.completed);
      if (item === 2) throw new Error("offline");
    });
    await expect(runBusyTasks([1, 2, 3], action, "removingItems")).rejects.toThrow("offline");
    expect(snapshots).toEqual([0, 1]);
    expect(action).toHaveBeenCalledTimes(2);
  });

  it("exposes nested task progress while retaining the outer workflow label afterwards", async () => {
    await runBusyOperation(
      async () => {
        await runBusyTasks(
          [1],
          async () => {
            expect(busyOperation.getSnapshot().details).toEqual({ message: "removingItems", total: 1, completed: 0 });
          },
          "removingItems"
        );
        expect(busyOperation.getSnapshot().details).toEqual({ message: "deletingList" });
        expect(busyOperation.getSnapshot().busy).toBe(true);
      },
      { message: "deletingList" }
    );
  });

  it("handles empty task lists without invoking the action", async () => {
    const action = vi.fn();
    await runBusyTasks([], action, "removingItems");
    expect(action).not.toHaveBeenCalled();
  });
});
