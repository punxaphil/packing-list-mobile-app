import Checkbox from "expo-checkbox";
import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { PACKING_KITS, PackingKit } from "~/data/packingKits.ts";
import { homeColors, homeSpacing } from "./theme.ts";

type KitPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (kits: PackingKit[]) => void;
};

const COPY = {
  title: "Packing Kits",
  subtitle: "Add pre-made items to your list",
  add: "Add to List",
  cancel: "Cancel",
  items: "items",
};

export const KitPickerModal = ({ visible, onClose, onAdd }: KitPickerModalProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    const kits = PACKING_KITS.filter((k) => selected.has(k.id));
    if (kits.length > 0) onAdd(kits);
    setSelected(new Set());
    onClose();
  }, [selected, onAdd, onClose]);

  const handleClose = useCallback(() => {
    setSelected(new Set());
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{COPY.title}</Text>
          <Text style={styles.subtitle}>{COPY.subtitle}</Text>
          <ScrollView style={styles.list}>
            {PACKING_KITS.map((kit) => (
              <KitRow key={kit.id} kit={kit} checked={selected.has(kit.id)} onToggle={() => toggle(kit.id)} />
            ))}
          </ScrollView>
          <Actions onCancel={handleClose} onAdd={handleAdd} disabled={selected.size === 0} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

type KitRowProps = { kit: PackingKit; checked: boolean; onToggle: () => void };

const KitRow = ({ kit, checked, onToggle }: KitRowProps) => (
  <Pressable style={styles.row} onPress={onToggle}>
    <Checkbox value={checked} onValueChange={onToggle} color={checked ? homeColors.primary : undefined} />
    <MaterialCommunityIcons name={kit.icon} size={22} color={checked ? homeColors.primary : homeColors.muted} />
    <View style={styles.kitInfo}>
      <Text style={styles.kitName}>{kit.name}</Text>
      <Text style={styles.kitCount}>
        {kit.items.length} {COPY.items}
      </Text>
    </View>
  </Pressable>
);

type ActionsProps = { onCancel: () => void; onAdd: () => void; disabled: boolean };

const Actions = ({ onCancel, onAdd, disabled }: ActionsProps) => (
  <View style={styles.actions}>
    <Pressable style={styles.cancelButton} onPress={onCancel}>
      <Text style={styles.cancelLabel}>{COPY.cancel}</Text>
    </Pressable>
    <Pressable
      style={[styles.addButton, disabled ? styles.addButtonDisabled : null]}
      onPress={onAdd}
      disabled={disabled}
    >
      <Text style={styles.addLabel}>{COPY.add}</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: homeSpacing.lg,
  },
  modal: {
    backgroundColor: homeColors.surface,
    borderRadius: 16,
    padding: homeSpacing.lg,
    width: "100%",
    maxHeight: "70%",
  },
  title: { fontSize: 18, fontWeight: "700", color: homeColors.text, marginBottom: homeSpacing.xs },
  subtitle: { fontSize: 14, color: homeColors.muted, marginBottom: homeSpacing.md },
  list: { marginBottom: homeSpacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: homeSpacing.sm,
    paddingVertical: homeSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  kitInfo: { flex: 1 },
  kitName: { fontSize: 16, fontWeight: "600", color: homeColors.text },
  kitCount: { fontSize: 12, color: homeColors.muted },
  actions: { flexDirection: "row", gap: homeSpacing.sm },
  cancelButton: {
    flex: 1,
    padding: homeSpacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: homeColors.border,
    alignItems: "center",
  },
  cancelLabel: { fontSize: 14, color: homeColors.text },
  addButton: {
    flex: 2,
    padding: homeSpacing.sm,
    borderRadius: 8,
    backgroundColor: homeColors.primary,
    alignItems: "center",
  },
  addButtonDisabled: { opacity: 0.5 },
  addLabel: { fontSize: 14, color: homeColors.buttonText, fontWeight: "600" },
});
