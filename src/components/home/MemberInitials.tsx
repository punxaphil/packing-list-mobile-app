import { Pressable, Image as RNImage, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { PackItem } from "~/types/PackItem.ts";
import { MemberInitialsMap } from "./memberInitialsUtils.ts";
import { homeStyles } from "./styles.ts";

type MemberInitialsProps = {
  item: PackItem;
  initialsMap: MemberInitialsMap;
  memberImages: Image[];
  onToggle: (memberId: string) => void;
};

export const MemberInitials = ({ item, initialsMap, memberImages, onToggle }: MemberInitialsProps) => {
  if (item.members.length === 0) return null;
  const getImageUrl = (memberId: string) => memberImages.find((img) => img.typeId === memberId)?.url;
  return (
    <View style={homeStyles.memberRow}>
      {item.members.map((mp) => (
        <MemberBadge
          key={mp.id}
          imageUrl={getImageUrl(mp.id)}
          initial={initialsMap.get(mp.id) ?? "?"}
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
