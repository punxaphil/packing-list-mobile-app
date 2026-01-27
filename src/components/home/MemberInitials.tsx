import { Pressable, Image as RNImage, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { homeStyles } from "./styles.ts";

type MemberInitialsProps = {
  item: PackItem;
  members: NamedEntity[];
  memberImages: Image[];
  onToggle: (memberId: string) => void;
};

export const MemberInitials = ({ item, members, memberImages, onToggle }: MemberInitialsProps) => {
  if (item.members.length === 0) return null;
  const names = item.members.map((mp) => members.find((m) => m.id === mp.id)?.name ?? "?");
  const initials = computeMinimalInitials(names);
  const getImageUrl = (memberId: string) => memberImages.find((img) => img.typeId === memberId)?.url;
  return (
    <View style={homeStyles.memberRow}>
      {item.members.map((mp, i) => (
        <MemberBadge
          key={mp.id}
          imageUrl={getImageUrl(mp.id)}
          initial={initials[i]}
          checked={mp.checked}
          onPress={() => onToggle(mp.id)}
        />
      ))}
    </View>
  );
};

type MemberBadgeProps = {
  imageUrl: string | undefined;
  initial: string;
  checked: boolean;
  onPress: () => void;
};

const MemberBadge = ({ imageUrl, initial, checked, onPress }: MemberBadgeProps) => {
  if (imageUrl) {
    return (
      <Pressable
        onPress={onPress}
        style={[homeStyles.memberImageWrapper, checked && homeStyles.memberImageWrapperChecked]}
      >
        <RNImage source={{ uri: imageUrl }} style={homeStyles.memberImage} />
        {!checked && <View style={homeStyles.memberImageOverlay} />}
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={[homeStyles.memberInitial, checked && homeStyles.memberInitialChecked]}>
      <Text style={[homeStyles.memberInitialText, checked && homeStyles.memberInitialTextChecked]}>{initial}</Text>
    </Pressable>
  );
};

const computeMinimalInitials = (names: string[]): string[] => {
  const upper = names.map((n) => n.toUpperCase());
  return upper.map((name, i) => {
    for (let len = 1; len <= 2; len++) {
      const prefix = name.slice(0, len);
      const isUnique = upper.every((other, j) => j === i || other.slice(0, len) !== prefix);
      if (isUnique) return prefix;
    }
    return findThirdChar(name, i, upper);
  });
};

const findThirdChar = (name: string, i: number, upper: string[]): string => {
  const conflicts = upper.filter((other, j) => j !== i && other.slice(0, 2) === name.slice(0, 2));
  let maxDiffIndex = 2;
  for (const other of conflicts) {
    let idx = 2;
    const minLen = Math.min(name.length, other.length);
    while (idx < minLen && name[idx] === other[idx]) idx++;
    maxDiffIndex = Math.max(maxDiffIndex, idx);
  }
  return name.slice(0, 2) + (name[maxDiffIndex] ?? "");
};
