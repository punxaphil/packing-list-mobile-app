import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { switchToMembersTab } from "~/navigation/navigation.ts";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { sheetButtonStyles } from "../shared/sheetButtonStyles.ts";
import { homeColors, homeSpacing } from "./theme.ts";

type AssignMembersModalProps = {
  visible: boolean;
  item: PackItem | null;
  members: NamedEntity[];
  memberImages: Image[];
  onClose: () => void;
  onSave: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
};

const COPY = {
  title: "Assign Members",
  save: "Save",
  cancel: "Cancel",
  noMembers: "No members yet",
  manageMembers: "Manage Members",
};

const IOS_SHEET_LIST_RATIO = 0.52;
const DIALOG_LIST_RATIO = 0.42;
const IOS_ROW_HEIGHT = 48;
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

  if (Platform.OS === "ios") {
    return (
      <PageSheet visible={visible} title={COPY.title} onClose={onClose} confirmLabel={COPY.save} onConfirm={handleSave}>
        <Text style={styles.subtitle}>{item.name}</Text>
        <MemberList members={members} memberImages={memberImages} selected={selected} onToggle={toggle} iosSheet />
        <Pressable
          onPress={handleManageMembers}
          style={[sheetButtonStyles.button, sheetButtonStyles.centered, sheetButtonStyles.filledSoft]}
        >
          <Text style={sheetButtonStyles.text}>{COPY.manageMembers}</Text>
        </Pressable>
      </PageSheet>
    );
  }

  return (
    <DialogShell
      visible={visible}
      title={COPY.title}
      onClose={onClose}
      actions={
        <DialogActions cancelLabel={COPY.cancel} confirmLabel={COPY.save} onCancel={onClose} onConfirm={handleSave} />
      }
    >
      <Text style={styles.subtitle}>{item.name}</Text>
      <MemberList members={members} memberImages={memberImages} selected={selected} onToggle={toggle} />
      <Pressable onPress={handleManageMembers}>
        <Text style={styles.manageLink}>{COPY.manageMembers}</Text>
      </Pressable>
    </DialogShell>
  );
};

type MemberListProps = {
  members: NamedEntity[];
  memberImages: Image[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  iosSheet?: boolean;
};

const MemberList = ({ members, memberImages, selected, onToggle, iosSheet = false }: MemberListProps) => {
  const listMaxHeight = useListMaxHeight(members.length, iosSheet);

  return (
    <ScrollView style={[styles.list, { maxHeight: listMaxHeight }]}>
      {members.length === 0 && <Text style={styles.empty}>{COPY.noMembers}</Text>}
      {members.map((member, index) => (
        <MemberRow
          key={member.id}
          member={member}
          imageUrl={memberImages.find((image) => image.typeId === member.id)?.url}
          checked={selected.has(member.id)}
          onToggle={() => onToggle(member.id)}
          iosSheet={iosSheet}
          isLast={index === members.length - 1}
        />
      ))}
    </ScrollView>
  );
};

const useListMaxHeight = (memberCount: number, iosSheet: boolean) => {
  const { height } = useWindowDimensions();
  if (memberCount === 0) return EMPTY_LIST_HEIGHT;
  const rowHeight = iosSheet ? IOS_ROW_HEIGHT : DEFAULT_ROW_HEIGHT;
  const screenCap = Math.floor(height * (iosSheet ? IOS_SHEET_LIST_RATIO : DIALOG_LIST_RATIO));
  return Math.min(memberCount * rowHeight, screenCap);
};

type MemberRowProps = {
  member: NamedEntity;
  imageUrl?: string;
  checked: boolean;
  onToggle: () => void;
  iosSheet?: boolean;
  isLast?: boolean;
};

const MemberRow = ({ member, imageUrl, checked, onToggle, iosSheet = false, isLast = false }: MemberRowProps) => (
  <Pressable style={[styles.row, iosSheet ? styles.sheetRow : null, isLast ? styles.lastRow : null]} onPress={onToggle}>
    <Checkbox value={checked} onValueChange={onToggle} color={checked ? homeColors.primary : undefined} />
    <Text style={styles.memberName}>{member.name}</Text>
    <View style={styles.rowSpacer} />
    {imageUrl ? <RNImage source={{ uri: imageUrl }} style={styles.avatarImage} /> : null}
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
  sheetRow: {
    paddingHorizontal: 0,
  },
  memberName: { fontSize: 16, color: homeColors.text },
  rowSpacer: { flex: 1 },
  avatarImage: { width: 28, height: 28, borderRadius: 6 },
  empty: {
    fontSize: 14,
    color: homeColors.muted,
    textAlign: "center",
    padding: homeSpacing.md,
  },
  manageLink: {
    fontSize: 14,
    color: homeColors.primary,
    textAlign: "center",
    marginBottom: homeSpacing.md,
  },
});
