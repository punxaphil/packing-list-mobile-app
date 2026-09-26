import type { Image } from "~/types/Image.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { homeSpacing } from "./theme.ts";

const BADGE_GAP = homeSpacing.sm;
const BADGE_H_PADDING = homeSpacing.sm;
const BADGE_INNER_GAP = homeSpacing.xs;
const IMAGE_WIDTH = 16;
const CHAR_WIDTH = 5;
const MIN_CHARS = 2;
const WRAP_THRESHOLD = 6;
export const RESERVED_END_SPACE = homeSpacing.md;

export const computeMaxChars = (width: number, members: PackItem["members"], images: Image[]) => {
  if (width === 0) return MIN_CHARS;
  const count = members.length;
  const totalGaps = (count - 1) * BADGE_GAP;
  const imageIds = new Set(images.map((image) => image.typeId));
  const imageCount = members.filter((member) => imageIds.has(member.id)).length;
  const totalImageSpace = imageCount * (IMAGE_WIDTH + BADGE_INNER_GAP);
  const available = width - totalGaps - count * BADGE_H_PADDING - totalImageSpace;
  const charsPerBadge = Math.floor(available / (count * CHAR_WIDTH));
  return Math.max(MIN_CHARS, charsPerBadge);
};

export const shouldWrapBadges = (width: number, members: PackItem["members"], images: Image[], maxChars: number) => {
  if (width === 0 || members.length < WRAP_THRESHOLD || maxChars > MIN_CHARS) return false;
  return estimateRowWidth(members, images, maxChars) > width;
};

const estimateRowWidth = (members: PackItem["members"], images: Image[], maxChars: number) => {
  const count = members.length;
  const totalGaps = (count - 1) * BADGE_GAP;
  const imageIds = new Set(images.map((image) => image.typeId));
  const imageCount = members.filter((member) => imageIds.has(member.id)).length;
  const totalImageSpace = imageCount * (IMAGE_WIDTH + BADGE_INNER_GAP);
  const totalPadding = count * BADGE_H_PADDING;
  const totalTextSpace = count * maxChars * CHAR_WIDTH;
  return totalGaps + totalImageSpace + totalPadding + totalTextSpace;
};

export const truncateName = (name: string, maxChars: number) =>
  name.length <= maxChars ? name : name.slice(0, maxChars);
