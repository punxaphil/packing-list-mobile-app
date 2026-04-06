import { type PropsWithChildren, useRef } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { homeColors, homeSpacing } from "../home/theme.ts";

type PageSheetProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmVariant?: "icon" | "text";
  scrollable?: boolean;
}>;

export const PageSheet = ({
  visible,
  title,
  onClose,
  confirmLabel,
  onConfirm,
  confirmDisabled = false,
  confirmVariant = "icon",
  scrollable = true,
  children,
}: PageSheetProps) => (
  <Modal
    visible={visible}
    animationType="slide"
    presentationStyle="pageSheet"
    allowSwipeDismissal
    onRequestClose={onClose}
  >
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView behavior="padding" style={styles.safeArea}>
        <View style={styles.headerWrap}>
          <View style={styles.header}>
            <SheetIconButton icon="close" onPress={onClose} accessibilityLabel="Cancel" />
            <Text style={styles.title}>{title}</Text>
            {confirmLabel && onConfirm ? (
              confirmVariant === "text" ? (
                <SheetTextButton
                  label={confirmLabel}
                  onPress={onConfirm}
                  disabled={confirmDisabled}
                  accessibilityLabel={confirmLabel}
                />
              ) : (
                <SheetIconButton
                  icon="check"
                  onPress={onConfirm}
                  primary
                  disabled={confirmDisabled}
                  accessibilityLabel={confirmLabel}
                />
              )
            ) : (
              <View style={styles.iconSpacer} />
            )}
          </View>
        </View>
        {scrollable ? (
          <Pressable style={styles.content} onPress={Keyboard.dismiss}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
              <View style={styles.panel}>{children}</View>
            </ScrollView>
          </Pressable>
        ) : (
          <Pressable style={styles.content} onPress={Keyboard.dismiss}>
            <View style={styles.contentInner}>
              <View style={[styles.panel, styles.panelFill]}>{children}</View>
            </View>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>
);

const SheetTextButton = ({
  label,
  onPress,
  accessibilityLabel,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
}) => (
  <Pressable
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    disabled={disabled}
    hitSlop={8}
    onPress={onPress}
    style={styles.textButton}
  >
    <Text style={[styles.textButtonLabel, disabled ? styles.textButtonLabelDisabled : null]}>{label}</Text>
  </Pressable>
);

const SheetIconButton = ({
  icon,
  onPress,
  accessibilityLabel,
  primary = false,
  disabled = false,
}: {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
  primary?: boolean;
  disabled?: boolean;
}) => {
  const press = useRef(new Animated.Value(0)).current;

  const animate = (toValue: number) => {
    Animated.timing(press, {
      toValue,
      duration: toValue === 1 ? 140 : 220,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = press.interpolate({
    inputRange: [0, 1],
    outputRange: primary ? [homeColors.primary, "#BFDBFE"] : ["rgba(255,255,255,0.82)", "rgba(255,255,255,0.98)"],
  });
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });
  const iconOpacity = press.interpolate({
    inputRange: [0, 1],
    outputRange: primary ? [1, 0.58] : [1, 0.26],
  });
  const shadowOpacity = press.interpolate({ inputRange: [0, 1], outputRange: [0.12, 0.04] });

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      onPressIn={() => animate(1)}
      onPressOut={() => animate(0)}
    >
      <Animated.View
        style={[
          styles.iconButton,
          primary ? styles.iconButtonPrimary : null,
          disabled ? styles.iconButtonDisabled : null,
          { backgroundColor, opacity: disabled ? 0.45 : 1, transform: [{ scale }], shadowOpacity },
        ]}
      >
        <Animated.View style={{ opacity: disabled ? 0.45 : iconOpacity }}>
          <MaterialCommunityIcons name={icon} size={28} style={[styles.icon, primary ? styles.iconPrimary : null]} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eef1f8" },
  headerWrap: { paddingHorizontal: 16, paddingTop: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 44,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: homeColors.text,
    textAlign: "center",
  },
  iconSpacer: { width: 44, height: 44 },
  textButton: {
    minWidth: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: homeSpacing.xs,
  },
  textButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: homeColors.text,
  },
  textButtonLabelDisabled: { color: homeColors.muted },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    shadowColor: "#94a3b8",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconButtonPrimary: { backgroundColor: homeColors.primary },
  iconButtonDisabled: { opacity: 0.45 },
  icon: { color: homeColors.text },
  iconPrimary: { color: homeColors.primaryForeground },
  content: { flex: 1 },
  contentInner: {
    flex: 1,
    paddingHorizontal: homeSpacing.lg,
    paddingVertical: homeSpacing.md,
    paddingBottom: homeSpacing.lg + (Platform.OS === "ios" ? homeSpacing.lg : 0),
  },
  scrollContent: {
    paddingHorizontal: homeSpacing.lg,
    paddingVertical: homeSpacing.md,
    paddingBottom: homeSpacing.lg + (Platform.OS === "ios" ? homeSpacing.lg : 0),
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.52)",
    borderRadius: 28,
    padding: homeSpacing.md,
    gap: homeSpacing.md,
  },
  panelFill: { flex: 1, minHeight: 0 },
});
