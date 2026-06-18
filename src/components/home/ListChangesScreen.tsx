import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCategories } from "~/hooks/useCategories.ts";
import { useChanges } from "~/hooks/useChanges.ts";
import { useImages } from "~/hooks/useImages.ts";
import { useMembers } from "~/hooks/useMembers.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { ChangeRow } from "./ChangeRow.tsx";
import { changeCopy } from "./changeCopy.ts";
import { homeColors, homeSpacing } from "./theme.ts";

type Props = { spaceId: string; packingListId: string; onBack: () => void };

const useCategoryNames = (spaceId: string) => {
  const { categories } = useCategories(spaceId);
  return useMemo(() => {
    const map = new Map<string, string>([
      ["", changeCopy.uncategorized],
      [UNCATEGORIZED.id, changeCopy.uncategorized],
    ]);
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);
};

const useUserImages = (spaceId: string) => {
  const { images } = useImages(spaceId);
  const { members } = useMembers(spaceId);
  return useMemo(() => {
    const byMemberId = new Map<string, string>();
    for (const image of images) if (image.type === "members") byMemberId.set(image.typeId, image.url);
    const byUserId = new Map<string, string>();
    for (const member of members) {
      const url = byMemberId.get(member.id);
      if (url) byUserId.set(member.userId ?? member.id, url);
    }
    return byUserId;
  }, [images, members]);
};

const Header = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.header}>
    <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
      <Text style={styles.backArrow}>←</Text>
      <Text style={styles.backLabel}>{changeCopy.back}</Text>
    </Pressable>
    <Text style={styles.title}>{changeCopy.title}</Text>
    <View style={styles.placeholder} />
  </View>
);

export const ListChangesScreen = ({ spaceId, packingListId, onBack }: Props) => {
  const { changes } = useChanges(spaceId, packingListId);
  const categoryNames = useCategoryNames(spaceId);
  const memberImages = useUserImages(spaceId);
  return (
    <View style={styles.container}>
      <Header onBack={onBack} />
      {changes.length === 0 ? (
        <Text style={styles.empty}>{changeCopy.empty}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {changes.map((entry) => (
            <ChangeRow
              key={entry.id}
              entry={entry}
              categoryName={categoryNames.get(entry.categoryId) ?? changeCopy.uncategorized}
              fromCategoryName={
                entry.fromCategoryId === undefined
                  ? undefined
                  : (categoryNames.get(entry.fromCategoryId) ?? changeCopy.uncategorized)
              }
              imageUrl={memberImages.get(entry.userId)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: homeColors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: homeSpacing.lg,
    paddingVertical: homeSpacing.md,
  },
  backButton: { minWidth: 60, flexDirection: "row", alignItems: "center", gap: 4 },
  backArrow: { color: homeColors.muted, fontWeight: "600", fontSize: 18, lineHeight: 20 },
  backLabel: { color: homeColors.muted, fontWeight: "600", fontSize: 16 },
  title: { fontSize: 20, fontWeight: "700", color: homeColors.text },
  placeholder: { minWidth: 60 },
  content: { paddingVertical: homeSpacing.sm },
  empty: { textAlign: "center", color: homeColors.muted, marginTop: homeSpacing.lg * 2 },
});
