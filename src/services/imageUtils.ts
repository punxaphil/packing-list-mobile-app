import { Alert, Platform } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import { toEmojiValue } from "~/services/mediaValue.ts";

const MAX_SIZE = 400;
const JPEG_QUALITY = 0.8;
const isIPad = Platform.OS === "ios" && Platform.isPad;
const EMOJI_PROMPT_TITLE = "Emoji";
const EMOJI_PROMPT_MESSAGE = "Enter emoji or text";
const CANCEL_OPTION = "Cancel";
const EMOJI_CONFIRM = "Use";

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
      EMOJI_PROMPT_TITLE,
      EMOJI_PROMPT_MESSAGE,
      [
        { text: CANCEL_OPTION, style: "cancel", onPress: () => resolve(null) },
        {
          text: EMOJI_CONFIRM,
          onPress: (value?: string) => {
            const trimmed = value?.trim() ?? "";
            resolve(trimmed ? toEmojiValue(trimmed) : null);
          },
        },
      ],
      "plain-text"
    );
  });
