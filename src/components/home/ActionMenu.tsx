import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { homeColors, homeSpacing } from "./theme.ts";

type ActionMenuItem = {
  text: string;
  style?: "default" | "destructive" | "cancel";
  onPress?: () => void;
};

type ActionMenuProps = {
  visible: boolean;
  title: string;
  items: ActionMenuItem[];
  onClose: () => void;
};

export const ActionMenu = ({ visible, title, items, onClose }: ActionMenuProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
        <Text style={styles.title}>{title}</Text>
        {items.filter((i) => i.style !== "cancel").map((item, index) => (
          <MenuItem key={index} item={item} onClose={onClose} />
        ))}
        <CancelButton onPress={onClose} />
      </Pressable>
    </Pressable>
  </Modal>
);

const MenuItem = ({ item, onClose }: { item: ActionMenuItem; onClose: () => void }) => {
  const handlePress = () => {
    onClose();
    item.onPress?.();
  };
  return (
    <Pressable style={styles.item} onPress={handlePress}>
      <Text style={[styles.itemText, item.style === "destructive" && styles.destructive]}>{item.text}</Text>
    </Pressable>
  );
};

const CancelButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.cancelItem} onPress={onPress}>
    <Text style={styles.cancelText}>Cancel</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: homeSpacing.lg },
  menu: { backgroundColor: homeColors.surface, borderRadius: 12, overflow: "hidden" },
  title: { fontSize: 16, fontWeight: "600", color: homeColors.muted, textAlign: "center", padding: homeSpacing.md, borderBottomWidth: 1, borderBottomColor: homeColors.border },
  item: { padding: homeSpacing.md, borderBottomWidth: 1, borderBottomColor: homeColors.border },
  itemText: { fontSize: 16, color: homeColors.text, textAlign: "center" },
  destructive: { color: "#dc2626" },
  cancelItem: { padding: homeSpacing.md, backgroundColor: homeColors.background },
  cancelText: { fontSize: 16, fontWeight: "600", color: homeColors.primary, textAlign: "center" },
});
