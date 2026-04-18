const EMOJI_PREFIX = "emoji:";

export const getEmojiValue = (value?: string) => {
  if (!value?.startsWith(EMOJI_PREFIX)) return null;
  const raw = value.slice(EMOJI_PREFIX.length);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export const toEmojiValue = (emoji: string) => `${EMOJI_PREFIX}${encodeURIComponent(emoji)}`;
