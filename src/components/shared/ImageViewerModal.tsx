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
  TextInput,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { commonCopy } from "../home/copy.ts";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import { Button } from "./Button.tsx";
import { PageSheet } from "./PageSheet.tsx";

type ImageViewerModalProps = {
  visible: boolean;
  imageUrl?: string;
  placeholderLabel?: string;
  title?: string;
  connectedLabel?: string;
  showRemove?: boolean;
  loading?: boolean;
  textValue?: string;
  textPlaceholder?: string;
  textSubmitDisabled?: boolean;
  onTextChange?: (value: string) => void;
  onTextSubmit?: () => void;
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
  showRemove = true,
  loading = false,
  textValue,
  textPlaceholder = commonCopy.emojiOrText,
  textSubmitDisabled = false,
  onTextChange,
  onTextSubmit,
  onClose,
  onReplace,
  onRemove,
}: ImageViewerModalProps) => {
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const emoji = getEmojiValue(imageUrl);

  useEffect(() => {
    if (visible && imageUrl && !emoji) {
      RNImage.getSize(imageUrl, (w, h) => setImageSize({ width: w, height: h }));
      return;
    }
    setImageSize(null);
  }, [visible, imageUrl, emoji]);

  const displaySize = imageSize ? calculateDisplaySize(imageSize, Platform.OS === "ios") : null;

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
          <View style={[styles.sheetImageContainer, displaySize && buildImageFrameStyle(displaySize)]}>
            {emoji ? (
              <Text style={styles.emojiPreview}>{emoji}</Text>
            ) : displaySize && imageUrl ? (
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
          {onTextChange && onTextSubmit ? (
            <View style={styles.textRow}>
              <TextInput
                value={textValue}
                onChangeText={onTextChange}
                placeholder={textPlaceholder}
                style={styles.textInput}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={onTextSubmit}
              />
              <Button label={commonCopy.useText} onPress={onTextSubmit} disabled={loading || textSubmitDisabled} />
            </View>
          ) : null}
          <View style={styles.sheetActions}>
            <Button flex label={commonCopy.pickImage} onPress={onReplace} disabled={loading} />
            {showRemove && (
              <Button variant="danger" flex label={commonCopy.removeImage} onPress={onRemove} disabled={loading} />
            )}
          </View>
        </View>
      </PageSheet>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <CloseButton onPress={onClose} />
        <View style={styles.imageContainer}>
          {emoji ? (
            <Text style={styles.emojiPreviewDark}>{emoji}</Text>
          ) : displaySize && imageUrl ? (
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
        <Pressable style={styles.actions} onPress={(e) => e.stopPropagation()}>
          {onTextChange && onTextSubmit ? (
            <View style={styles.textRowDark}>
              <TextInput
                value={textValue}
                onChangeText={onTextChange}
                placeholder={textPlaceholder}
                placeholderTextColor="rgba(255,255,255,0.72)"
                style={styles.textInputDark}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={onTextSubmit}
              />
              <Button label={commonCopy.useText} onPress={onTextSubmit} disabled={loading || textSubmitDisabled} />
            </View>
          ) : null}
          <Button flex label={commonCopy.pickImage} onPress={onReplace} disabled={loading} />
          {showRemove && (
            <Button variant="danger" flex label={commonCopy.removeImage} onPress={onRemove} disabled={loading} />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const calculateDisplaySize = (size: { width: number; height: number }, isSheet: boolean) => {
  const screen = Dimensions.get("window");
  const maxW = screen.width - (isSheet ? 88 : 40);
  const maxH = isSheet ? Math.min(screen.height * 0.3, screen.height - 470) : screen.height - 200;
  if (size.width <= maxW && size.height <= maxH) return size;
  const scale = Math.min(maxW / size.width, maxH / size.height);
  return { width: size.width * scale, height: size.height * scale };
};

const buildImageFrameStyle = ({ width, height }: { width: number; height: number }) => ({
  width: width + homeSpacing.md * 2,
  height: height + homeSpacing.md * 2,
});

const ImagePlaceholder = ({ label, dark = false }: { label: string; dark?: boolean }) => (
  <View style={[styles.placeholder, dark && styles.placeholderDark]}>
    <Text style={[styles.placeholderText, dark && styles.placeholderTextDark]}>{label}</Text>
  </View>
);

const CloseButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.closeButton} onPress={onPress}>
    <MaterialCommunityIcons name="close" size={28} color={homeColors.buttonText} />
  </Pressable>
);

const ImageLoadingOverlay = () => (
  <View style={styles.loadingOverlay} pointerEvents="none">
    <ActivityIndicator size="small" color={homeColors.surface} />
  </View>
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
  emojiPreview: {
    fontSize: 110,
    lineHeight: 120,
  },
  emojiPreviewDark: {
    fontSize: 140,
    lineHeight: 150,
  },
  placeholderTextDark: { color: homeColors.surface },
  textRow: {
    flexDirection: "row",
    width: "100%",
    gap: homeSpacing.sm,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 16,
    paddingHorizontal: homeSpacing.md,
    paddingVertical: homeSpacing.sm,
    color: homeColors.text,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  textRowDark: {
    flexDirection: "row",
    width: "100%",
    gap: homeSpacing.sm,
    alignItems: "center",
    marginBottom: homeSpacing.sm,
  },
  textInputDark: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 16,
    paddingHorizontal: homeSpacing.md,
    paddingVertical: homeSpacing.sm,
    color: homeColors.surface,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: homeSpacing.md,
    paddingBottom: 50,
    paddingHorizontal: homeSpacing.lg,
  },
  sheetActions: { flexDirection: "row", gap: homeSpacing.md, width: "100%" },
});
