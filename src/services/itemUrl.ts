export const parseItemUrl = (value: unknown): string | null => {
  if (typeof value !== "string" || !/^https?:\/\/[^/\\\s]/i.test(value.trim())) return null;
  try {
    const url = new URL(value.trim());
    return url.username || url.password ? null : url.href;
  } catch {
    return null;
  }
};
