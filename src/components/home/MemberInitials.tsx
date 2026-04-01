import { useState } from "react";
import { LayoutChangeEvent, Pressable, Image as RNImage, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { PackItem } from "~/types/PackItem.ts";
import { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import { homeStyles } from "./styles.ts";

const BADGE_GAP = 8;
const BADGE_H_PADDING = 8;
const BADGE_INNER_GAP = 4;
const IMAGE_WIDTH = 16;
const CHAR_WIDTH = 5;

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
  const maxChars = computeMaxChars(containerWidth, item.members, memberImages);

  return (
    <View style={homeStyles.memberRow} onLayout={handleLayout}>
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
  if (width === 0) return 2;
  const count = members.length;
  const totalGaps = (count - 1) * BADGE_GAP;
  const imageIds = new Set(images.map((img) => img.typeId));
  const imageCount = members.filter((m) => imageIds.has(m.id)).length;
  const totalImageSpace = imageCount * (IMAGE_WIDTH + BADGE_INNER_GAP);
  const available = width - totalGaps - count * BADGE_H_PADDING - totalImageSpace;
  const charsPerBadge = Math.floor(available / (count * CHAR_WIDTH));
  return Math.max(2, charsPerBadge);
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
