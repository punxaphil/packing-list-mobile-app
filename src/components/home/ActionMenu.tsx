import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { actionMenuStyles as styles } from "./actionMenuStyles.ts";
import { homeColors } from "./theme.ts";

type ActionMenuItem = {
  text: string;
  style?: "default" | "destructive" | "cancel";
  onPress?: () => void;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightPress?: () => void;
};

type ActionMenuProps = {
  visible: boolean;
  title: string;
  items: ActionMenuItem[];
  onClose: () => void;
  headerColor?: string;
  headerTextColor?: string;
  headerRight?: ReactNode;
};

export const ActionMenu = ({
  visible,
  title,
  items,
  onClose,
  headerColor,
  headerTextColor,
  headerRight,
}: ActionMenuProps) => {
  const titleTextStyle = headerColor
    ? [styles.titleText, { color: headerTextColor ?? homeColors.text }]
    : styles.titleText;
  const headerBgStyle = headerColor ? { backgroundColor: headerColor } : undefined;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.titleRow, headerBgStyle]}>
            <View style={styles.titleSpacer} />
            <Text style={titleTextStyle}>{title}</Text>
            <View style={styles.titleSpacer}>{headerRight}</View>
          </View>
          {items
            .filter((i) => i.style !== "cancel")
            .map((item) => (
              <MenuItem key={item.text} item={item} onClose={onClose} />
            ))}
          <CancelButton onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const MenuItem = ({ item, onClose }: { item: ActionMenuItem; onClose: () => void }) => {
  const handlePress = () => {
    if (item.disabled) return;
    onClose();
    item.onPress?.();
  };
  const textStyle = [
    styles.itemText,
    item.style === "destructive" && styles.destructive,
    item.disabled && styles.disabled,
  ];
  return (
    <Pressable style={styles.item} onPress={handlePress}>
      <View style={styles.itemRow}>
        <View style={styles.itemSpacer}>{item.leftIcon}</View>
        <Text style={textStyle}>{item.text}</Text>
        <View style={styles.itemSpacer}>
          {item.rightIcon && (
            <Pressable onPress={item.onRightPress} hitSlop={8}>
              {item.rightIcon}
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const CancelButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.cancelItem} onPress={onPress}>
    <Text style={styles.cancelText}>Cancel</Text>
  </Pressable>
);
