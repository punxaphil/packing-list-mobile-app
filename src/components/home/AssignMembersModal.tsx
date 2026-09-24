import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Image as RNImage, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { switchToMembersTab } from "~/navigation/navigation.ts";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { homeColors, homeSpacing } from "./theme.ts";

type AssignMembersModalProps = {
  visible: boolean;
  item: PackItem | null;
  members: NamedEntity[];
  memberImages: Image[];
  onClose: () => void;
  onSave: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
};

const DIALOG_LIST_RATIO = 0.42;
const DEFAULT_ROW_HEIGHT = 40;
const EMPTY_LIST_HEIGHT = 72;

export const AssignMembersModal = ({
  visible,
  item,
  members,
  memberImages,
  onClose,
  onSave,
}: AssignMembersModalProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  useEffect(() => {
    if (visible && item) {
      setSelected(new Set(item.members.map((m) => m.id)));
    }
  }, [visible, item]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!item) return;
    const memberItems: MemberPackItem[] = Array.from(selected).map((id) => {
      const existing = item.members.find((m) => m.id === id);
      return existing ?? { id, checked: false };
    });
    await onSave(item, memberItems);
    onClose();
  };

  const handleManageMembers = () => {
    onClose();
    switchToMembersTab();
  };

  if (!item) return null;

  return (
    <DialogShell
      visible={visible}
      title={t("assignMembers.title")}
      onClose={onClose}
      actions={
        <DialogActions
          cancelLabel={t("assignMembers.cancel")}
          confirmLabel={t("assignMembers.save")}
          onCancel={onClose}
          onConfirm={handleSave}
        />
      }
    >
      <Text style={styles.subtitle}>{item.name}</Text>
      <MemberList members={members} memberImages={memberImages} selected={selected} onToggle={toggle} />
      <Pressable onPress={handleManageMembers}>
        <Text style={styles.manageLink}>{t("assignMembers.manageMembers")}</Text>
      </Pressable>
    </DialogShell>
  );
};

type MemberListProps = {
  members: NamedEntity[];
  memberImages: Image[];
  selected: Set<string>;
  onToggle: (id: string) => void;
};

const MemberList = ({ members, memberImages, selected, onToggle }: MemberListProps) => {
  const { t } = useTranslation();
  const listMaxHeight = useListMaxHeight(members.length);

  return (
    <ScrollView style={[styles.list, { maxHeight: listMaxHeight }]}>
      {members.length === 0 && <Text style={styles.empty}>{t("assignMembers.noMembers")}</Text>}
      {members.map((member, index) => (
        <MemberRow
          key={member.id}
          member={member}
          imageUrl={memberImages.find((image) => image.typeId === member.id)?.url}
          checked={selected.has(member.id)}
          onToggle={() => onToggle(member.id)}
          isLast={index === members.length - 1}
        />
      ))}
    </ScrollView>
  );
};

const useListMaxHeight = (memberCount: number) => {
  const { height } = useWindowDimensions();
  if (memberCount === 0) return EMPTY_LIST_HEIGHT;
  const screenCap = Math.floor(height * DIALOG_LIST_RATIO);
  return Math.min(memberCount * DEFAULT_ROW_HEIGHT, screenCap);
};

type MemberRowProps = {
  member: NamedEntity;
  imageUrl?: string;
  checked: boolean;
  onToggle: () => void;
  isLast?: boolean;
};

const MemberRow = ({ member, imageUrl, checked, onToggle, isLast = false }: MemberRowProps) => (
  <Pressable style={[styles.row, isLast ? styles.lastRow : null]} onPress={onToggle}>
    <AppCheckbox checked={checked} onToggle={onToggle} size={16} />
    <Text style={styles.memberName}>{member.name}</Text>
    <View style={styles.rowSpacer} />
    {getEmojiValue(imageUrl) ? (
      <Text style={styles.avatarEmoji}>{getEmojiValue(imageUrl)}</Text>
    ) : imageUrl ? (
      <RNImage source={{ uri: imageUrl }} style={styles.avatarImage} />
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: homeColors.muted,
    marginBottom: homeSpacing.md,
  },
  list: { maxHeight: 300, marginBottom: homeSpacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: homeSpacing.sm,
    paddingVertical: homeSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  lastRow: { borderBottomWidth: 0 },
  memberName: { fontSize: 16, color: homeColors.text },
  rowSpacer: { flex: 1 },
  avatarImage: { width: 28, height: 28, borderRadius: 6 },
  avatarEmoji: { fontSize: 22, lineHeight: 26 },
  empty: {
    fontSize: 14,
    color: homeColors.muted,
    textAlign: "center",
    padding: homeSpacing.md,
  },
  manageLink: {
    fontSize: 14,
    color: homeColors.muted,
    textAlign: "center",
    marginBottom: homeSpacing.md,
  },
});
