import i18next from "i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { initReactI18next } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "~/i18n/locales/en.json";
import sv from "~/i18n/locales/sv.json";
import { BUSY_INDICATOR_DELAY_MS, runBusyOperation } from "~/services/busyOperation.ts";
import { BusyOverlay } from "./BusyOverlay.tsx";

vi.mock("react", async (load) => ({
  ...(await load<typeof import("react")>()),
  useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
}));

beforeEach(async () => {
  vi.useFakeTimers();
  await i18next.use(initReactI18next).init({
    resources: { en: { translation: en }, sv: { translation: sv } },
    lng: "en",
    interpolation: { escapeValue: false, prefix: "{", suffix: "}" },
  });
});
afterEach(() => vi.useRealTimers());

describe("busy overlay feedback", () => {
  it("does not render loading content before the existing delay", async () => {
    await runBusyOperation(
      async () => {
        expect(renderToStaticMarkup(<BusyOverlay />)).not.toContain("app-loading-state");
      },
      { message: "copyingList" }
    );
  });

  it("shows the operation and completed progress after the delay", async () => {
    await runBusyOperation(
      async (report) => {
        report(34);
        vi.advanceTimersByTime(BUSY_INDICATOR_DELAY_MS);
        const markup = renderToStaticMarkup(<BusyOverlay />);
        expect(markup).toContain("Removing 145 ticked items...");
        expect(markup).toContain("34 of 145 completed");
        expect(markup).toContain('value="34" max="145"');
        expect(markup).toContain('role="status"');
      },
      { message: "removingTickedItems", total: 145, completed: 0 }
    );
  });

  it("translates member assignment progress into Swedish", async () => {
    await i18next.changeLanguage("sv");
    await runBusyOperation(
      async (report) => {
        report(12);
        vi.advanceTimersByTime(BUSY_INDICATOR_DELAY_MS);
        const markup = renderToStaticMarkup(<BusyOverlay />);
        expect(markup).toContain("Tar bort 58 medlemstilldelningar från saker...");
        expect(markup).toContain("12 av 58 slutförda");
      },
      { message: "removingMembers", total: 58, completed: 0 }
    );
  });

  it("shows a named operation without fabricating unknown progress", async () => {
    await runBusyOperation(
      async () => {
        vi.advanceTimersByTime(BUSY_INDICATOR_DELAY_MS);
        const markup = renderToStaticMarkup(<BusyOverlay />);
        expect(markup).toContain("Copying packing list...");
        expect(markup).not.toContain("<progress");
      },
      { message: "copyingList" }
    );
  });
});
