import i18next from "i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, expect, it, vi } from "vitest";
import en from "~/i18n/locales/en.json";
import { toEmojiValue } from "~/services/mediaValue.ts";
import { ItemRowDetails } from "./ItemRowDetails.tsx";

const renderRow = (imageUrl?: string, url?: string) =>
  renderToStaticMarkup(
    <ItemRowDetails
      item={{
        id: "socks",
        name: "Socks",
        checked: false,
        members: [],
        category: "",
        packingList: "list",
        rank: 0,
        url,
      }}
      itemImage={imageUrl ? { id: "image", type: "packItems", typeId: "socks", url: imageUrl } : undefined}
      initialsMap={new Map()}
      memberNames={new Map()}
      memberImages={[]}
      checkboxColor="black"
      onToggleMemberPacked={vi.fn()}
      onOpenRename={vi.fn()}
      onOpenImagePicker={vi.fn()}
      checked={false}
      wrapItemText={false}
    />
  );

beforeAll(async () => {
  await i18next.init({
    resources: { en: { translation: en } },
    lng: "en",
    interpolation: { escapeValue: false, prefix: "{", suffix: "}" },
  });
});

it.each([
  ["/socks.png", '<img src="/socks.png" alt=""/>'],
  [toEmojiValue("🧦"), "🧦"],
])("renders %s as a labeled image button", (url, thumbnail) => {
  expect(renderRow(url)).toContain(
    `<button type="button" class="item-row-image" aria-label="View image for Socks">${thumbnail}</button>`
  );
});

it("does not render a thumbnail button for an item without an image", () => {
  expect(renderRow()).not.toContain('class="item-row-image"');
});

it("renders an accessible, isolated external link alongside the item image", () => {
  const row = renderRow("/socks.png", "https://example.org/socks");
  expect(row).toContain('class="item-row-image"');
  expect(row).toContain(
    '<a class="item-row-link" href="https://example.org/socks" target="_blank" rel="noopener noreferrer"'
  );
  expect(row).toContain('<span class="item-row-link-label">Open link for Socks (opens in a new tab)</span>');
});

it.each([undefined, "javascript:void(0)"])("does not render an icon for %s", (url) => {
  expect(renderRow(undefined, url)).not.toContain('class="item-row-link"');
});
