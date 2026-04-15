import { Platform, Pressable, Image as RNImage, ScrollView, StyleSheet, Text, View } from "react-native";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { MOVE_COPY } from "../categories/styles.ts";
import { commonCopy } from "../home/copy.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";

type MoveMemberItemsDialogProps = {
  visible: boolean;
  source: NamedEntity | null;
  targets: NamedEntity[];
  memberImages: Image[];
  onClose: () => void;
  onSubmit: (target: NamedEntity) => Promise<void>;
};

export const MoveMemberItemsDialog = ({
  visible,
  source,
  targets,
  memberImages,
  onClose,
  onSubmit,
}: MoveMemberItemsDialogProps) => {
  const content = (
    <View style={styles.content}>
      <Text style={styles.description}>Move all assigned items from {source?.name} to:</Text>
      <ScrollView style={styles.list}>
        {targets.map((target, index) => (
          <Pressable
            key={target.id}
            style={[styles.row, index === targets.length - 1 && styles.lastRow]}
            onPress={() => void onSubmit(target)}
          >
            <Text style={styles.optionText}>{target.name}</Text>
            <View style={styles.spacer} />
            <MemberAvatar imageUrl={memberImages.find((image) => image.typeId === target.id)?.url} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <PageSheet visible={visible} title={MOVE_COPY.title} onClose={onClose} scrollable={false}>
        {content}
      </PageSheet>
    );
  }

  return (
    <DialogShell
      visible={visible}
      title={MOVE_COPY.title}
      onClose={onClose}
      actions={<DialogSingleAction label={commonCopy.cancel} onPress={onClose} />}
    >
      {content}
    </DialogShell>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, minHeight: 0 },
  description: { color: homeColors.text, fontSize: 15, marginBottom: homeSpacing.sm },
  list: { flex: 1, minHeight: 0 },
  row: {
    alignItems: "center",
    borderBottomColor: homeColors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: homeSpacing.sm,
    paddingVertical: homeSpacing.sm,
  },
  lastRow: { borderBottomWidth: 0 },
  optionText: { color: homeColors.text, fontSize: 15, fontWeight: "600" },
  spacer: { flex: 1 },
  avatarImage: { width: 28, height: 28, borderRadius: 6 },
  avatarEmoji: { fontSize: 22, lineHeight: 26 },
});

const MemberAvatar = ({ imageUrl }: { imageUrl?: string }) => {
  const emoji = getEmojiValue(imageUrl);
  if (emoji) return <Text style={styles.avatarEmoji}>{emoji}</Text>;
  if (imageUrl) return <RNImage source={{ uri: imageUrl }} style={styles.avatarImage} />;
  return null;
};
