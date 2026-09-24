import { type ReactNode, useMemo } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import type { Space } from "~/types/Space.ts";
import { actionMenuStyles as styles } from "./actionMenuStyles.ts";
import { commonCopy } from "./copy.ts";
import type { MemberInfo } from "./memberInfo.ts";
import { SpaceRow } from "./SpaceSheetParts.tsx";
import { homeColors } from "./theme.ts";
import { useSpaceMemberInfo } from "./useSpaceMemberInfo.ts";

type ActionMenuItem = {
  text: string;
  style?: "default" | "destructive" | "cancel";
  onPress?: () => void;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightPress?: () => void;
  space?: Space;
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
  const spaces = useMemo(() => items.flatMap((item) => (item.space ? [item.space] : [])), [items]);
  const { memberInfoBySpaceId } = useSpaceMemberInfo(spaces);
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
          <ScrollView style={styles.itemsScroll}>
            {items
              .filter((i) => i.style !== "cancel")
              .map((item) => (
                <MenuItem
                  key={item.text}
                  item={item}
                  onClose={onClose}
                  members={item.space ? (memberInfoBySpaceId[item.space.id] ?? []) : undefined}
                />
              ))}
          </ScrollView>
          <CancelButton label={items.find((i) => i.style === "cancel")?.text} onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const MenuItem = ({
  item,
  onClose,
  members,
}: {
  item: ActionMenuItem;
  onClose: () => void;
  members?: MemberInfo[];
}) => {
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
  if (members) return <SpaceRow label={item.text} members={members} onPress={handlePress} />;
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

const CancelButton = ({ label, onPress }: { label?: string; onPress: () => void }) => (
  <Pressable style={styles.cancelItem} onPress={onPress}>
    <Text style={styles.cancelText}>{label ?? commonCopy.cancel}</Text>
  </Pressable>
);
