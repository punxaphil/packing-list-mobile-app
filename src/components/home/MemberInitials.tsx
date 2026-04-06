import { useState } from "react";
import { LayoutChangeEvent, Pressable, Image as RNImage, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { PackItem } from "~/types/PackItem.ts";
import { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import { homeStyles } from "./styles.ts";
import { homeSpacing } from "./theme.ts";

const BADGE_GAP = 8;
const BADGE_H_PADDING = 8;
const BADGE_INNER_GAP = 4;
const IMAGE_WIDTH = 16;
const CHAR_WIDTH = 5;
const MIN_CHARS = 2;
const WRAP_THRESHOLD = 6;
const RESERVED_END_SPACE = homeSpacing.md;

type MemberInitialsProps = {
  item: PackItem;
  initialsMap: MemberInitialsMap;
  memberNames: MemberNamesMap;
  memberImages: Image[];
  onToggle: (memberId: string) => void;
};

export const MemberInitials = ({ item, initialsMap, memberNames, memberImages, onToggle }: MemberInitialsProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  if (item.members.length === 0) return null;

  const getImageUrl = (id: string) => memberImages.find((img) => img.typeId === id)?.url;
  const handleLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);
  const availableWidth = Math.max(0, containerWidth - RESERVED_END_SPACE);
  const maxChars = computeMaxChars(availableWidth, item.members, memberImages);
  const shouldWrap = shouldWrapBadges(availableWidth, item.members, memberImages, maxChars);

  return (
    <View style={[homeStyles.memberRow, shouldWrap && homeStyles.memberRowWrap]} onLayout={handleLayout}>
      {item.members.map((mp) => {
        const fullName = memberNames.get(mp.id) ?? initialsMap.get(mp.id) ?? "?";
        const label = truncateName(fullName, maxChars);
        return (
          <MemberBadge
            key={mp.id}
            imageUrl={getImageUrl(mp.id)}
            label={label}
            checked={mp.checked}
            onPress={() => onToggle(mp.id)}
          />
        );
      })}
    </View>
  );
};

const computeMaxChars = (width: number, members: PackItem["members"], images: Image[]) => {
  if (width === 0) return MIN_CHARS;
  const count = members.length;
  const totalGaps = (count - 1) * BADGE_GAP;
  const imageIds = new Set(images.map((img) => img.typeId));
  const imageCount = members.filter((m) => imageIds.has(m.id)).length;
  const totalImageSpace = imageCount * (IMAGE_WIDTH + BADGE_INNER_GAP);
  const available = width - totalGaps - count * BADGE_H_PADDING - totalImageSpace;
  const charsPerBadge = Math.floor(available / (count * CHAR_WIDTH));
  return Math.max(MIN_CHARS, charsPerBadge);
};

const shouldWrapBadges = (width: number, members: PackItem["members"], images: Image[], maxChars: number) => {
  if (width === 0 || members.length < WRAP_THRESHOLD || maxChars > MIN_CHARS) return false;
  return estimateRowWidth(members, images, maxChars) > width;
};

const estimateRowWidth = (members: PackItem["members"], images: Image[], maxChars: number) => {
  const count = members.length;
  const totalGaps = (count - 1) * BADGE_GAP;
  const imageIds = new Set(images.map((img) => img.typeId));
  const imageCount = members.filter((member) => imageIds.has(member.id)).length;
  const totalImageSpace = imageCount * (IMAGE_WIDTH + BADGE_INNER_GAP);
  const totalPadding = count * BADGE_H_PADDING;
  const totalTextSpace = count * maxChars * CHAR_WIDTH;
  return totalGaps + totalImageSpace + totalPadding + totalTextSpace;
};

const truncateName = (name: string, maxChars: number) => (name.length <= maxChars ? name : name.slice(0, maxChars));

type MemberBadgeProps = {
  imageUrl: string | undefined;
  label: string;
  checked: boolean;
  onPress: () => void;
};

const MemberBadge = ({ imageUrl, label, checked, onPress }: MemberBadgeProps) => (
  <Pressable onPress={onPress} style={[homeStyles.memberBadge, checked && homeStyles.memberBadgeChecked]}>
    {imageUrl && <RNImage source={{ uri: imageUrl }} style={homeStyles.memberBadgeImage} />}
    <Text style={[homeStyles.memberBadgeText, checked && homeStyles.memberBadgeTextChecked]} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);
