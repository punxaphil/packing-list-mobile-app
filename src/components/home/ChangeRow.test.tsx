import i18next from "i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { initReactI18next } from "react-i18next";
import { beforeEach, expect, it } from "vitest";
import en from "~/i18n/locales/en.json";
import sv from "~/i18n/locales/sv.json";
import type { ChangeLogEntry } from "~/services/changeLog.ts";
import { ChangeRow } from "./ChangeRow.tsx";

const timestamp = new Date("2026-01-15T16:37:00.000Z");
const entry: ChangeLogEntry = {
  id: "change",
  packingList: "list",
  userId: "user",
  userName: "Alex",
  action: "added",
  itemName: "Socks",
  categoryId: "clothing",
  createdAt: timestamp.getTime(),
};

beforeEach(async () => {
  await i18next.use(initReactI18next).init({
    resources: { en: { translation: en }, sv: { translation: sv } },
    lng: "en",
  });
});

it.each(["en", "sv"])("shows the recorded date and time in %s", async (language) => {
  await i18next.changeLanguage(language);
  const markup = renderToStaticMarkup(<ChangeRow entry={entry} categoryName="Clothing" />);
  const visibleTimestamp = new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(
    timestamp
  );
  expect(markup).toContain(`dateTime="${timestamp.toISOString()}">${visibleTimestamp}</time>`);
  expect(markup).toContain("Socks</strong> (Clothing)");
});

it("keeps the change visible when the recorded timestamp is invalid", () => {
  const markup = renderToStaticMarkup(<ChangeRow entry={{ ...entry, createdAt: NaN }} categoryName="Clothing" />);
  expect(markup).not.toContain("<time");
  expect(markup).toContain("Socks</strong> (Clothing)");
});
