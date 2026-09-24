import i18next from "i18next";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getTranslatedKits, PackingKit } from "~/data/packingKits.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { commonCopy, homeCopy } from "./copy.ts";
import { homeColors, homeSpacing } from "./theme.ts";

type KitPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (kits: PackingKit[]) => void;
};

const kitItemCount = (count: number) => i18next.t("home.kitPickerItemCount", { count });

export const KitPickerModal = ({ visible, onClose, onAdd }: KitPickerModalProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const kits = getTranslatedKits();

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    const selected_kits = kits.filter((k) => selected.has(k.id));
    if (selected_kits.length > 0) onAdd(selected_kits);
    setSelected(new Set());
    onClose();
  }, [kits, selected, onAdd, onClose]);

  const handleClose = useCallback(() => {
    setSelected(new Set());
    onClose();
  }, [onClose]);

  return (
    <DialogShell
      visible={visible}
      title={homeCopy.kitPickerTitle}
      onClose={handleClose}
      actions={
        <DialogActions
          cancelLabel={commonCopy.cancel}
          confirmLabel={homeCopy.kitPickerAdd}
          onCancel={handleClose}
          onConfirm={handleAdd}
          disabled={selected.size === 0}
        />
      }
    >
      <Text style={styles.subtitle}>{homeCopy.kitPickerSubtitle}</Text>
      <ScrollView style={styles.list}>
        {kits.map((kit) => (
          <KitRow key={kit.id} kit={kit} checked={selected.has(kit.id)} onToggle={() => toggle(kit.id)} />
        ))}
      </ScrollView>
    </DialogShell>
  );
};

type KitRowProps = {
  kit: PackingKit;
  checked: boolean;
  onToggle: () => void;
};

const KitRow = ({ kit, checked, onToggle }: KitRowProps) => (
  <Pressable style={styles.row} onPress={onToggle}>
    <AppCheckbox checked={checked} onToggle={onToggle} size={16} />
    <MaterialCommunityIcons name={kit.icon} size={22} color={checked ? homeColors.primaryStrong : homeColors.muted} />
    <View style={styles.kitInfo}>
      <Text style={styles.kitName}>{kit.name}</Text>
      <Text style={styles.kitCount}>{kitItemCount(kit.items.length)}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: homeColors.muted,
    marginBottom: homeSpacing.md,
  },
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
