import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { switchToMembersTab } from "~/navigation/navigation.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { homeColors, homeSpacing } from "./theme.ts";

type AssignMembersModalProps = {
  visible: boolean;
  item: PackItem | null;
  members: NamedEntity[];
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

export const AssignMembersModal = ({
  visible,
  item,
  members,
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

  return (
    <DialogShell
      visible={visible}
      title={COPY.title}
      onClose={onClose}
      actions={
        <DialogActions
          cancelLabel={COPY.cancel}
          confirmLabel={COPY.save}
          onCancel={onClose}
          onConfirm={handleSave}
        />
      }
    >
      <Text style={styles.subtitle}>{item.name}</Text>
      <MemberList members={members} selected={selected} onToggle={toggle} />
      <Pressable onPress={handleManageMembers}>
        <Text style={styles.manageLink}>{COPY.manageMembers}</Text>
      </Pressable>
    </DialogShell>
  );
};

type MemberListProps = {
  members: NamedEntity[];
  selected: Set<string>;
  onToggle: (id: string) => void;
};

const MemberList = ({ members, selected, onToggle }: MemberListProps) => (
  <ScrollView style={styles.list}>
    {members.length === 0 && <Text style={styles.empty}>{COPY.noMembers}</Text>}
    {members.map((member) => (
      <MemberRow
        key={member.id}
        member={member}
        checked={selected.has(member.id)}
        onToggle={() => onToggle(member.id)}
      />
    ))}
  </ScrollView>
);

type MemberRowProps = {
  member: NamedEntity;
  checked: boolean;
  onToggle: () => void;
};

const MemberRow = ({ member, checked, onToggle }: MemberRowProps) => (
  <Pressable style={styles.row} onPress={onToggle}>
    <Checkbox
      value={checked}
      onValueChange={onToggle}
      color={checked ? homeColors.primary : undefined}
    />
    <Text style={styles.memberName}>{member.name}</Text>
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
  memberName: { fontSize: 16, color: homeColors.text },
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
