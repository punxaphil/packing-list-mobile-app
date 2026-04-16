import ImageCropPicker from "react-native-image-crop-picker";

const MAX_SIZE = 400;
const JPEG_QUALITY = 0.8;

export const pickAndResizeImage = async (): Promise<string | null> => {
  try {
    const image = await ImageCropPicker.openPicker({
      cropping: true,
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
