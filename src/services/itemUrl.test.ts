import { expect, it } from "vitest";
import { parseItemUrl } from "./itemUrl.ts";

it.each([
  ["  HTTPS://Example.com/gear?size=small#details ", "https://example.com/gear?size=small#details"],
  ["http://example.org", "http://example.org/"],
])("normalizes %s to %s", (input, expected) => {
  expect(parseItemUrl(input)).toBe(expected);
});

it.each([
  undefined,
  null,
  42,
  "",
  "example.org",
  "//example.org",
  "ftp://example.org",
  "javascript:void(0)",
  "data:text/plain,gear",
  "https:///example.org",
  "https://",
  new URL("https://example.org").href.replace("//", "//example-user@"),
])("rejects %s", (input) => {
  expect(parseItemUrl(input)).toBeNull();
});
