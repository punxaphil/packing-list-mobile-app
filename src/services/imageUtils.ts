import { ActionSheetIOS, Alert, Platform } from "react-native";
import ImageCropPicker from "react-native-image-crop-picker";
import { toEmojiValue } from "~/services/mediaValue.ts";

const MAX_SIZE = 400;
const JPEG_QUALITY = 0.8;
const isIPad = Platform.OS === "ios" && Platform.isPad;
const PICK_IMAGE_OPTION = "Choose Photo";
const PICK_EMOJI_OPTION = "Use Emoji";
const CANCEL_OPTION = "Cancel";
const EMOJI_PROMPT_TITLE = "Emoji";
const EMOJI_PROMPT_MESSAGE = "Enter an emoji";
const EMOJI_CONFIRM = "Use";

const pickAndResizeImage = async (): Promise<string | null> => {
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

const promptForEmoji = () =>
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

export const pickMediaValue = () =>
  new Promise<string | null>((resolve) => {
    if (Platform.OS !== "ios") {
      void pickAndResizeImage().then(resolve);
      return;
    }
    const options = [PICK_IMAGE_OPTION, PICK_EMOJI_OPTION, CANCEL_OPTION];
    ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: options.length - 1 }, (index) => {
      if (index === 0) {
        void pickAndResizeImage().then(resolve);
        return;
      }
      if (index === 1) {
        void promptForEmoji().then(resolve);
        return;
      }
      resolve(null);
    });
  });
