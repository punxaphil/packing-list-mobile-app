import { type PropsWithChildren } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useKeyboardOffset } from "~/hooks/useKeyboardOffset.ts";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

type DialogShellProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
  actions?: React.ReactNode;
}>;

export const DialogShell = ({
  visible,
  title,
  onClose,
  children,
  actions,
}: DialogShellProps) => {
  const keyboardOffset = useKeyboardOffset();
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[styles.card, { transform: [{ translateY: keyboardOffset }] }]}
        >
          <Pressable style={styles.content} onPress={() => Keyboard.dismiss()}>
            <Text style={styles.title}>{title}</Text>
            {children}
          </Pressable>
          {actions}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

type DialogActionsProps = {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};

export const DialogActions = ({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  disabled,
}: DialogActionsProps) => (
  <View style={styles.actions}>
    <Pressable
      style={styles.actionButton}
      onPress={onCancel}
      disabled={disabled}
    >
      <Text style={[styles.actionLabel, disabled && styles.disabled]}>
        {cancelLabel}
      </Text>
    </Pressable>
    <Pressable
      style={styles.actionButton}
      onPress={onConfirm}
      disabled={disabled}
    >
      <Text
        style={[
          styles.actionLabel,
          styles.actionPrimary,
          disabled && styles.disabled,
        ]}
      >
        {confirmLabel}
      </Text>
    </Pressable>
  </View>
);

type SingleActionProps = {
  label: string;
  onPress: () => void;
};

export const DialogSingleAction = ({ label, onPress }: SingleActionProps) => (
  <View style={styles.actions}>
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Text style={[styles.actionLabel, styles.actionPrimary]}>{label}</Text>
    </Pressable>
  </View>
);

const MAX_WIDTH = 400;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: homeSpacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    maxHeight: "80%",
    backgroundColor: homeColors.surface,
    borderRadius: homeRadius,
    overflow: "hidden",
  },
  content: { gap: homeSpacing.md, padding: homeSpacing.lg },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: homeColors.text,
    textAlign: "center",
  },
  actions: { flexDirection: "row" },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: homeSpacing.md,
  },
  actionLabel: { fontSize: 16, color: homeColors.primary },
  actionPrimary: { fontWeight: "600" },
  disabled: { opacity: 0.5 },
});
