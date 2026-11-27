import { parseItemUrl } from "~/services/itemUrl.ts";

type NameSelection = Pick<HTMLInputElement, "value" | "selectionStart" | "selectionEnd">;

export const getItemUrlPaste = (clipboardText: string, input: NameSelection) => {
  const trimmed = clipboardText.trim();
  const url = /\s/.test(trimmed) ? null : parseItemUrl(trimmed);
  if (!url) return null;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  const pasted = clipboardText.replace(/[\r\n]/g, "");
  return { url, text: input.value.slice(0, start) + pasted + input.value.slice(end) };
};
