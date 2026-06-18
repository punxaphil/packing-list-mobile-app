import { Image as RNImage, StyleSheet, Text, View } from "react-native";
import type { ChangeLogEntry } from "~/services/changeLog.ts";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { changeActionVerb, changeCopy } from "./changeCopy.ts";
import { homeColors, homeSpacing } from "./theme.ts";

const AVATAR_SIZE = 36;

type Props = { entry: ChangeLogEntry; categoryName: string; fromCategoryName?: string; imageUrl?: string };

const Avatar = ({ name, imageUrl }: { name: string; imageUrl?: string }) => {
  const emoji = getEmojiValue(imageUrl);
  if (emoji)
    return (
      <View style={styles.avatar}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
    );
  if (imageUrl) return <RNImage source={{ uri: imageUrl }} style={styles.avatar} />;
  return (
    <View style={styles.avatar}>
      <Text style={styles.initial}>{name.trim()[0]?.toUpperCase() ?? "?"}</Text>
    </View>
  );
};

export const ChangeRow = ({ entry, categoryName, fromCategoryName, imageUrl }: Props) => (
  <View style={styles.row}>
    <Avatar name={entry.userName} imageUrl={imageUrl} />
    <Text style={styles.text}>
      <Text style={styles.name}>{entry.userName}</Text>
      {` ${changeActionVerb(entry.action)} `}
      <Text style={styles.item}>{entry.itemName}</Text>
      {entry.action === "moved" && fromCategoryName
        ? ` ${changeCopy.from} ${fromCategoryName} ${changeCopy.to} ${categoryName}`
        : ` (${categoryName})`}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: homeSpacing.sm,
    paddingVertical: homeSpacing.sm,
    paddingHorizontal: homeSpacing.lg,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: homeColors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  emoji: { fontSize: 20, lineHeight: 24 },
  initial: { color: homeColors.primaryForeground, fontSize: 15, fontWeight: "700" },
  text: { flex: 1, fontSize: 15, color: homeColors.text },
  name: { fontWeight: "700" },
  item: { fontWeight: "600" },
});
