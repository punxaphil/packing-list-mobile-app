import { expect, it } from "vitest";
import { getItemUrlPaste } from "./itemUrlPaste.ts";

const selection = { value: "Buy socks today", selectionStart: 4, selectionEnd: 9 };

it("offers the normalized link while preserving a plain-text paste at the selection", () => {
  expect(getItemUrlPaste("HTTPS://Example.org/socks", selection)).toEqual({
    url: "https://example.org/socks",
    text: "Buy HTTPS://Example.org/socks today",
  });
});

it("recognizes a URL with surrounding whitespace", () => {
  expect(getItemUrlPaste("\n https://example.org \n", selection)?.url).toBe("https://example.org/");
});

it.each([
  "Warm socks",
  "Buy https://example.org/socks",
  "https://example.org/socks and gloves",
  "https://example.org/\nhttps://example.com/",
  "javascript:void(0)",
  "https://",
])("leaves %s to the normal paste behavior", (text) => {
  expect(getItemUrlPaste(text, selection)).toBeNull();
});
