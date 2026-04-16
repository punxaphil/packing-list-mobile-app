import { Image as RNImage, StyleSheet, Text, View } from "react-native";
import type { MemberInfo } from "./memberInfo.ts";
import { homeColors } from "./theme.ts";

const MAX_VISIBLE = 4;
const AVATAR_SIZE = 24;
const OVERLAP = -6;

export const MemberAvatars = ({ members }: { members: MemberInfo[] }) => {
  if (!members.length) return null;
  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - MAX_VISIBLE;
  return (
    <View style={avatarStyles.container}>
      {visible.map((m) => (
        <Avatar key={m.email} email={m.email} imageUrl={m.imageUrl} />
      ))}
      {overflow > 0 && (
        <View style={[avatarStyles.badge, avatarStyles.overflowBadge]}>
          <Text style={avatarStyles.overflowText}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
};

const Avatar = ({ email, imageUrl }: { email: string; imageUrl?: string }) => (
  <View style={avatarStyles.badge}>
    {imageUrl ? (
      <RNImage source={{ uri: imageUrl }} style={avatarStyles.image} />
    ) : (
      <Text style={avatarStyles.initial}>{email[0]?.toUpperCase() ?? "?"}</Text>
    )}
  </View>
);

const avatarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -OVERLAP,
  },
  badge: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: homeColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: OVERLAP,
  },
  image: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  initial: {
    color: homeColors.primaryForeground,
    fontSize: 11,
    fontWeight: "700",
  },
  overflowBadge: { backgroundColor: homeColors.muted },
  overflowText: {
    color: homeColors.buttonText,
    fontSize: 10,
    fontWeight: "700",
  },
});
