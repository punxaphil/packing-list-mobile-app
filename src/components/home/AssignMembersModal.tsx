import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Checkbox from "expo-checkbox";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
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
};

export const AssignMembersModal = ({ visible, item, members, onClose, onSave }: AssignMembersModalProps) => {
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

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{COPY.title}</Text>
          <Text style={styles.subtitle}>{item.name}</Text>
          <MemberList members={members} selected={selected} onToggle={toggle} />
          <Actions onCancel={onClose} onSave={handleSave} />
        </View>
      </View>
    </Modal>
  );
};

type MemberListProps = { members: NamedEntity[]; selected: Set<string>; onToggle: (id: string) => void };

const MemberList = ({ members, selected, onToggle }: MemberListProps) => (
  <ScrollView style={styles.list}>
    {members.length === 0 && <Text style={styles.empty}>{COPY.noMembers}</Text>}
    {members.map((member) => (
      <MemberRow key={member.id} member={member} checked={selected.has(member.id)} onToggle={() => onToggle(member.id)} />
    ))}
  </ScrollView>
);

type MemberRowProps = { member: NamedEntity; checked: boolean; onToggle: () => void };

const MemberRow = ({ member, checked, onToggle }: MemberRowProps) => (
  <Pressable style={styles.row} onPress={onToggle}>
    <Checkbox value={checked} onValueChange={onToggle} color={checked ? homeColors.primary : undefined} />
    <Text style={styles.memberName}>{member.name}</Text>
  </Pressable>
);

type ActionsProps = { onCancel: () => void; onSave: () => void };

const Actions = ({ onCancel, onSave }: ActionsProps) => (
  <View style={styles.actions}>
    <Pressable style={styles.cancelButton} onPress={onCancel}>
      <Text style={styles.cancelLabel}>{COPY.cancel}</Text>
    </Pressable>
    <Pressable style={styles.saveButton} onPress={onSave}>
      <Text style={styles.saveLabel}>{COPY.save}</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: homeSpacing.lg },
  modal: { backgroundColor: homeColors.surface, borderRadius: 16, padding: homeSpacing.lg, width: "100%", maxHeight: "70%" },
  title: { fontSize: 18, fontWeight: "700", color: homeColors.text, marginBottom: homeSpacing.xs },
  subtitle: { fontSize: 14, color: homeColors.muted, marginBottom: homeSpacing.md },
  list: { maxHeight: 300, marginBottom: homeSpacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: homeSpacing.sm, paddingVertical: homeSpacing.sm, borderBottomWidth: 1, borderBottomColor: homeColors.border },
  memberName: { fontSize: 16, color: homeColors.text },
  empty: { fontSize: 14, color: homeColors.muted, textAlign: "center", padding: homeSpacing.md },
  actions: { flexDirection: "row", gap: homeSpacing.sm },
  cancelButton: { flex: 1, padding: homeSpacing.sm, borderRadius: 8, borderWidth: 1, borderColor: homeColors.border, alignItems: "center" },
  cancelLabel: { fontSize: 14, color: homeColors.text },
  saveButton: { flex: 2, padding: homeSpacing.sm, borderRadius: 8, backgroundColor: homeColors.primary, alignItems: "center" },
  saveLabel: { fontSize: 14, color: homeColors.buttonText, fontWeight: "600" },
});
