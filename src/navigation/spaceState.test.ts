import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addSpaceListener, clearSpaceState, getActiveSpaceId, initSpaceState, setActiveSpaceId } from "./spaceState.ts";

describe("spaceState", () => {
  beforeEach(async () => {
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
    await clearSpaceState();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns empty string initially", () => {
    expect(getActiveSpaceId()).toBe("");
  });

  it("sets and gets space ID", () => {
    setActiveSpaceId("space-1");
    expect(getActiveSpaceId()).toBe("space-1");
  });

  it("notifies listeners on set", () => {
    const listener = vi.fn();
    addSpaceListener(listener);
    setActiveSpaceId("space-1");
    expect(listener).toHaveBeenCalledWith("space-1");
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsub = addSpaceListener(listener);
    unsub();
    setActiveSpaceId("space-1");
    expect(listener).not.toHaveBeenCalled();
  });

  it("clears state", async () => {
    setActiveSpaceId("space-1");
    await clearSpaceState();
    expect(getActiveSpaceId()).toBe("");
  });

  it("notifies listeners on clear", async () => {
    setActiveSpaceId("space-1");
    const listener = vi.fn();
    addSpaceListener(listener);
    await clearSpaceState();
    expect(listener).toHaveBeenCalledWith("");
  });

  it("restores from storage on init", async () => {
    vi.mocked(localStorage.getItem).mockReturnValueOnce("stored-space");
    const result = await initSpaceState();
    expect(result).toBe("stored-space");
    expect(getActiveSpaceId()).toBe("stored-space");
  });

  it("returns empty when storage has no value", async () => {
    const result = await initSpaceState();
    expect(result).toBe("");
    expect(getActiveSpaceId()).toBe("");
  });

  it("supports multiple listeners", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    addSpaceListener(listener1);
    addSpaceListener(listener2);
    setActiveSpaceId("space-1");
    expect(listener1).toHaveBeenCalledWith("space-1");
    expect(listener2).toHaveBeenCalledWith("space-1");
  });
});
