import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useSpaceSwitchLoader } from "./useSpaceSwitchLoader.ts";

vi.mock("react", () => ({ useEffect: vi.fn(), useRef: vi.fn(), useState: vi.fn() }));

function LoaderProbe({ spaceId, loading }: { spaceId: string; loading: boolean }) {
  return useSpaceSwitchLoader(spaceId, loading) ? "visible" : null;
}

function mountLoader() {
  const previousSpace = { current: "first" };
  let visibleFor: unknown;
  let cleanup: (() => void) | undefined;
  let dependencies: readonly unknown[] | undefined;
  vi.mocked(useRef).mockReturnValue(previousSpace);
  const setVisibleFor = (value: unknown) => {
    visibleFor = value;
  };
  vi.mocked(useEffect).mockImplementation((effect, nextDependencies) => {
    if (!nextDependencies?.some((value, index) => value !== dependencies?.[index])) return;
    cleanup?.();
    dependencies = nextDependencies;
    cleanup = effect() ?? undefined;
  });
  return {
    render(spaceId: string, loading: boolean) {
      vi.mocked(useState).mockReturnValue([visibleFor, setVisibleFor]);
      return renderToStaticMarkup(<LoaderProbe spaceId={spaceId} loading={loading} />) === "visible";
    },
    unmount: () => cleanup?.(),
  };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("shows the loader only after a space switch has been loading for 500 ms", () => {
  const { render } = mountLoader();
  expect(render("first", true)).toBe(false);
  vi.advanceTimersByTime(500);
  expect(render("first", true)).toBe(false);
  expect(render("second", true)).toBe(false);
  vi.advanceTimersByTime(499);
  expect(render("second", true)).toBe(false);
  vi.advanceTimersByTime(1);
  expect(render("second", true)).toBe(true);
  expect(render("second", false)).toBe(false);
  expect(render("second", true)).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
});

it("cancels the timeout if the switch finishes quickly", () => {
  const { render } = mountLoader();
  render("first", false);
  render("second", true);
  vi.advanceTimersByTime(200);
  expect(render("second", false)).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
});

it("restarts the delay for another space and cancels it on unmount", () => {
  const { render, unmount } = mountLoader();
  render("first", false);
  render("second", true);
  vi.advanceTimersByTime(400);
  expect(render("first", true)).toBe(false);
  vi.advanceTimersByTime(100);
  expect(render("first", true)).toBe(false);
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
