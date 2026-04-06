import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  Image as RNImage,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { PageSheet } from "./PageSheet.tsx";
import { sheetButtonStyles } from "./sheetButtonStyles.ts";

type ImageViewerModalProps = {
  visible: boolean;
  imageUrl?: string;
  placeholderLabel?: string;
  title?: string;
  connectedLabel?: string;
  replaceLabel?: string;
  removeLabel?: string;
  showRemove?: boolean;
  loading?: boolean;
  onClose: () => void;
  onReplace: () => void;
  onRemove: () => void;
};

export const ImageViewerModal = ({
  visible,
  imageUrl,
  placeholderLabel = "?",
  title = "Image",
  connectedLabel,
  replaceLabel = "Replace",
  removeLabel = "Remove",
  showRemove = true,
  loading = false,
  onClose,
  onReplace,
  onRemove,
}: ImageViewerModalProps) => {
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (visible && imageUrl) {
      RNImage.getSize(imageUrl, (w, h) =>
        setImageSize({ width: w, height: h }),
      );
      return;
    }
    setImageSize(null);
  }, [visible, imageUrl]);

  const displaySize = imageSize
    ? calculateDisplaySize(imageSize, Platform.OS === "ios")
    : null;

  if (Platform.OS === "ios") {
    return (
      <PageSheet visible={visible} title={title} onClose={onClose}>
        <View style={styles.sheetContent}>
          {connectedLabel ? (
            <View style={styles.connectionRow}>
              <Text style={styles.connectionValue} numberOfLines={1}>
                {connectedLabel}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.sheetImageContainer,
              displaySize && buildImageFrameStyle(displaySize),
            ]}
          >
            {displaySize && imageUrl ? (
              <RNImage
                source={{ uri: imageUrl }}
                style={{ width: displaySize.width, height: displaySize.height }}
                resizeMode="contain"
              />
            ) : (
              <ImagePlaceholder label={placeholderLabel} />
            )}
            {loading && <ImageLoadingOverlay />}
          </View>
          <View style={styles.sheetActions}>
            <ActionButton
              label={replaceLabel}
              onPress={onReplace}
              disabled={loading}
            />
            {showRemove && (
              <ActionButton
                label={removeLabel}
                onPress={onRemove}
                destructive
                disabled={loading}
              />
            )}
          </View>
        </View>
      </PageSheet>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <CloseButton onPress={onClose} />
        <View style={styles.imageContainer}>
          {displaySize && imageUrl ? (
            <RNImage
              source={{ uri: imageUrl }}
              style={{ width: displaySize.width, height: displaySize.height }}
              resizeMode="contain"
            />
          ) : (
            <ImagePlaceholder label={placeholderLabel} dark />
          )}
          {loading && <ImageLoadingOverlay />}
        </View>
        <View style={styles.actions}>
          <ActionButton
            label={replaceLabel}
            onPress={onReplace}
            disabled={loading}
          />
          {showRemove && (
            <ActionButton
              label={removeLabel}
              onPress={onRemove}
              destructive
              disabled={loading}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const calculateDisplaySize = (
  size: { width: number; height: number },
  isSheet: boolean,
) => {
  const screen = Dimensions.get("window");
  const maxW = screen.width - (isSheet ? 88 : 40);
  const maxH = isSheet
    ? Math.min(screen.height * 0.3, screen.height - 470)
    : screen.height - 200;
  if (size.width <= maxW && size.height <= maxH) return size;
  const scale = Math.min(maxW / size.width, maxH / size.height);
  return { width: size.width * scale, height: size.height * scale };
};

const buildImageFrameStyle = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => ({
  width: width + homeSpacing.md * 2,
  height: height + homeSpacing.md * 2,
});

const ImagePlaceholder = ({
  label,
  dark = false,
}: {
  label: string;
  dark?: boolean;
}) => (
  <View style={[styles.placeholder, dark && styles.placeholderDark]}>
    <Text style={[styles.placeholderText, dark && styles.placeholderTextDark]}>
      {label}
    </Text>
  </View>
);

const CloseButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.closeButton} onPress={onPress}>
    <MaterialCommunityIcons
      name="close"
      size={28}
      color={homeColors.buttonText}
    />
  </Pressable>
);

const ImageLoadingOverlay = () => (
  <View style={styles.loadingOverlay} pointerEvents="none">
    <ActivityIndicator size="small" color={homeColors.surface} />
  </View>
);

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

const ActionButton = ({
  label,
  onPress,
  destructive,
  disabled = false,
}: ActionButtonProps) => (
  <Pressable
    style={[
      sheetButtonStyles.button,
      styles.button,
      destructive
        ? sheetButtonStyles.filledPrimary
        : sheetButtonStyles.filledSoft,
      destructive && styles.buttonDestructive,
      disabled && styles.buttonDisabled,
    ]}
    disabled={disabled}
    onPress={(e) => {
      e.stopPropagation();
      onPress();
    }}
  >
    <Text
      style={[
        destructive ? sheetButtonStyles.textPrimary : sheetButtonStyles.text,
        !destructive && styles.buttonText,
        destructive && styles.buttonTextDestructive,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: homeSpacing.lg,
    zIndex: 1,
    padding: homeSpacing.sm,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: homeSpacing.lg,
  },
  sheetContent: { gap: homeSpacing.md, alignItems: "center" },
  connectionRow: { gap: 2 },
  connectionValue: {
    fontSize: 15,
    fontWeight: "700",
    color: homeColors.text,
    textAlign: "center",
  },
  sheetImageContainer: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: homeRadius,
    backgroundColor: "rgba(255,255,255,0.65)",
    padding: homeSpacing.md,
    overflow: "hidden",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  placeholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: homeColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderDark: { backgroundColor: "rgba(255,255,255,0.2)" },
  placeholderText: {
    fontSize: 64,
    fontWeight: "700",
    color: homeColors.primaryForeground,
  },
  placeholderTextDark: { color: homeColors.surface },
  actions: {
    flexDirection: "row",
    gap: homeSpacing.md,
    paddingBottom: 50,
    paddingHorizontal: homeSpacing.lg,
  },
  sheetActions: { flexDirection: "row", gap: homeSpacing.md, width: "100%" },
  button: { flex: 1 },
  buttonDestructive: { backgroundColor: homeColors.danger },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: homeColors.muted },
  buttonTextDestructive: { color: homeColors.buttonText },
});
