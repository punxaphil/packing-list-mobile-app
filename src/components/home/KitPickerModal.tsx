import Checkbox from "expo-checkbox";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { PACKING_KITS, PackingKit } from "~/data/packingKits.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
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
    <DialogShell
      visible={visible}
      title={COPY.title}
      onClose={handleClose}
      actions={
        <DialogActions
          cancelLabel={COPY.cancel}
          confirmLabel={COPY.add}
          onCancel={handleClose}
          onConfirm={handleAdd}
          disabled={selected.size === 0}
        />
      }
    >
      <Text style={styles.subtitle}>{COPY.subtitle}</Text>
      <ScrollView style={styles.list}>
        {PACKING_KITS.map((kit) => (
          <KitRow key={kit.id} kit={kit} checked={selected.has(kit.id)} onToggle={() => toggle(kit.id)} />
        ))}
      </ScrollView>
    </DialogShell>
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

const styles = StyleSheet.create({
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
});
