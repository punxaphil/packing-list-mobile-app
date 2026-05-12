import i18next from "i18next";
import { Alert, Platform } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import { toEmojiValue } from "~/services/mediaValue.ts";

const MAX_SIZE = 400;
const JPEG_QUALITY = 0.8;
const isIPad = Platform.OS === "ios" && Platform.isPad;

export const pickAndResizeImage = async (): Promise<string | null> => {
  try {
    const image = await ImageCropPicker.openPicker({
      cropping: !isIPad,
      width: MAX_SIZE,
      height: MAX_SIZE,
      compressImageMaxWidth: MAX_SIZE,
      compressImageMaxHeight: MAX_SIZE,
      compressImageQuality: JPEG_QUALITY,
      mediaType: "photo",
      includeBase64: true,
      cropperCircleOverlay: false,
      freeStyleCropEnabled: false,
    });
    if (!image.data) return null;
    return `data:image/jpeg;base64,${image.data}`;
  } catch {
    return null;
  }
};

export const promptForEmojiValue = () =>
  new Promise<string | null>((resolve) => {
    if (Platform.OS !== "ios") {
      resolve(null);
      return;
    }
    Alert.prompt(
      i18next.t("common.emoji"),
      i18next.t("common.enterEmojiOrText"),
      [
        { text: i18next.t("common.cancel"), style: "cancel", onPress: () => resolve(null) },
        {
          text: i18next.t("common.use"),
          onPress: (value?: string) => {
            const trimmed = value?.trim() ?? "";
            resolve(trimmed ? toEmojiValue(trimmed) : null);
          },
        },
      ],
      "plain-text"
    );
  });
