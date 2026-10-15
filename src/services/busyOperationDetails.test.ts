import { afterEach, describe, expect, it } from "vitest";
import { busyOperation, runBusyOperation } from "./busyOperation.ts";

afterEach(() => expect(busyOperation.getSnapshot()).toEqual({ busy: false, showLoader: false }));

describe("busy operation details", () => {
  it("retains the outer progress when nested writes report their own operation", async () => {
    await runBusyOperation(
      async (report) => {
        report(2);
        await runBusyOperation(
          async () => {
            expect(busyOperation.getSnapshot().details).toEqual({ message: "removingItems", total: 3, completed: 2 });
          },
          { message: "saving" }
        );
      },
      { message: "removingItems", total: 3, completed: 0 }
    );
  });

  it("ignores late progress callbacks after completion", async () => {
    let reportLate = (_completed: number) => {};
    await runBusyOperation(
      async (report) => {
        reportLate = report;
      },
      { message: "removingItems", total: 3 }
    );
    const snapshot = busyOperation.getSnapshot();
    reportLate(2);
    expect(busyOperation.getSnapshot()).toBe(snapshot);
  });

  it("switches to a remaining overlapping operation without leaking old progress", async () => {
    let finishFirst = () => {};
    let finishSecond = () => {};
    const first = runBusyOperation(
      () =>
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        }),
      { message: "removingItems", total: 3, completed: 1 }
    );
    const second = runBusyOperation(
      () =>
        new Promise<void>((resolve) => {
          finishSecond = resolve;
        }),
      { message: "copyingList" }
    );
    expect(busyOperation.getSnapshot().details?.message).toBe("removingItems");
    finishFirst();
    await first;
    expect(busyOperation.getSnapshot().details).toEqual({ message: "copyingList" });
    finishSecond();
    await second;
  });
});
