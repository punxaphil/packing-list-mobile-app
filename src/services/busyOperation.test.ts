import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BUSY_INDICATOR_DELAY_MS, busyOperation, runBusyOperation } from "./busyOperation.ts";

const deferred = () => {
  let resolve = () => {};
  let reject = (_error: Error) => {};
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { resolve, reject, run: () => runBusyOperation(() => promise) };
};
const advanceDelay = () => vi.advanceTimersByTime(BUSY_INDICATOR_DELAY_MS);

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  expect(busyOperation.getSnapshot()).toEqual({ busy: false, showLoader: false });
  vi.useRealTimers();
});

describe("busy operations", () => {
  it("blocks immediately but delays the loader", async () => {
    const work = deferred();
    const result = work.run();
    expect(busyOperation.getSnapshot()).toEqual({ busy: true, showLoader: false });
    vi.advanceTimersByTime(BUSY_INDICATOR_DELAY_MS - 1);
    expect(busyOperation.getSnapshot().showLoader).toBe(false);
    vi.advanceTimersByTime(1);
    expect(busyOperation.getSnapshot().showLoader).toBe(true);
    work.resolve();
    await result;
  });

  it("does not flash a loader for fast operations", async () => {
    expect(await runBusyOperation(async () => 42)).toBe(42);
    advanceDelay();
    expect(busyOperation.getSnapshot().showLoader).toBe(false);
  });

  it("releases input and propagates asynchronous failures", async () => {
    const work = deferred();
    const result = expect(work.run()).rejects.toThrow("offline");
    advanceDelay();
    work.reject(new Error("offline"));
    await result;
  });

  it("releases input after a synchronous throw", async () => {
    const fail = () =>
      runBusyOperation(() => {
        throw new Error("failed");
      });
    await expect(fail()).rejects.toThrow("failed");
  });

  it("stays busy until every overlapping operation finishes", async () => {
    const first = deferred();
    const second = deferred();
    const results = [first.run(), second.run()];
    first.resolve();
    await results[0];
    expect(busyOperation.getSnapshot().busy).toBe(true);
    advanceDelay();
    expect(busyOperation.getSnapshot().showLoader).toBe(true);
    second.resolve();
    await results[1];
  });

  it("keeps nested workflows blocked between individual writes", async () => {
    await runBusyOperation(async () => {
      await runBusyOperation(async () => undefined);
      expect(busyOperation.getSnapshot().busy).toBe(true);
    });
  });

  it("resets the delay for the next operation", async () => {
    await runBusyOperation(async () => undefined);
    vi.advanceTimersByTime(BUSY_INDICATOR_DELAY_MS / 2);
    const work = deferred();
    const result = work.run();
    vi.advanceTimersByTime(BUSY_INDICATOR_DELAY_MS / 2);
    expect(busyOperation.getSnapshot().showLoader).toBe(false);
    work.resolve();
    await result;
  });

  it("publishes stable snapshots and supports unsubscribing", async () => {
    const listener = vi.fn();
    const unsubscribe = busyOperation.subscribe(listener);
    expect(busyOperation.getSnapshot()).toBe(busyOperation.getSnapshot());
    await runBusyOperation(async () => undefined);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    await runBusyOperation(async () => undefined);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
