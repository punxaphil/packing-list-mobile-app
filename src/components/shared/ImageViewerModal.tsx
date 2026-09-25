import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
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
import { homeColors, homeSpacing } from "../home/theme.ts";
import { Button } from "./Button.tsx";

type ImageViewerModalProps = {
  visible: boolean;
  imageUrl?: string;
  placeholderLabel?: string;
  title?: string;
  connectedLabel?: string;
  showRemove?: boolean;
  loading?: boolean;
  textValue?: string;
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
  showRemove = true,
  loading = false,
  textValue,
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

  const displaySize = imageSize ? calculateDisplaySize(imageSize) : null;

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
                accessibilityLabel={commonCopy.emojiOrText}
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

const calculateDisplaySize = (size: { width: number; height: number }) => {
  const screen = Dimensions.get("window");
  const maxW = screen.width - 40;
  const maxH = screen.height - 200;
  if (size.width <= maxW && size.height <= maxH) return size;
  const scale = Math.min(maxW / size.width, maxH / size.height);
  return { width: size.width * scale, height: size.height * scale };
};

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
  emojiPreviewDark: {
    fontSize: 140,
    lineHeight: 150,
  },
  placeholderTextDark: { color: homeColors.surface },
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
});
