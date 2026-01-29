import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dimensions, Modal, Pressable, Image as RNImage, StyleSheet, Text, View } from "react-native";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

type ImageViewerModalProps = {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
  onReplace: () => void;
  onRemove: () => void;
};

export const ImageViewerModal = ({ visible, imageUrl, onClose, onReplace, onRemove }: ImageViewerModalProps) => {
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (visible && imageUrl) {
      RNImage.getSize(imageUrl, (w, h) => setImageSize({ width: w, height: h }));
    }
  }, [visible, imageUrl]);

  const displaySize = imageSize ? calculateDisplaySize(imageSize) : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <CloseButton onPress={onClose} />
        <View style={styles.imageContainer}>
          {displaySize && (
            <RNImage
              source={{ uri: imageUrl }}
              style={{ width: displaySize.width, height: displaySize.height }}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.actions}>
          <ActionButton label="Replace" onPress={onReplace} />
          <ActionButton label="Remove" onPress={onRemove} destructive />
        </View>
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

const CloseButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.closeButton} onPress={onPress}>
    <MaterialCommunityIcons name="close" size={28} color={homeColors.buttonText} />
  </Pressable>
);

type ActionButtonProps = { label: string; onPress: () => void; destructive?: boolean };

const ActionButton = ({ label, onPress, destructive }: ActionButtonProps) => (
  <Pressable
    style={[styles.button, destructive && styles.buttonDestructive]}
    onPress={(e) => {
      e.stopPropagation();
      onPress();
    }}
  >
    <Text style={[styles.buttonText, destructive && styles.buttonTextDestructive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: { position: "absolute", top: 50, right: homeSpacing.lg, zIndex: 1, padding: homeSpacing.sm },
  imageContainer: { flex: 1, width: "100%", justifyContent: "center", alignItems: "center", padding: homeSpacing.lg },
  actions: { flexDirection: "row", gap: homeSpacing.md, paddingBottom: 50, paddingHorizontal: homeSpacing.lg },
  button: {
    flex: 1,
    backgroundColor: homeColors.surface,
    borderRadius: homeRadius,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDestructive: { backgroundColor: homeColors.danger },
  buttonText: { fontSize: 16, fontWeight: "600", color: homeColors.text },
  buttonTextDestructive: { color: homeColors.buttonText },
});
