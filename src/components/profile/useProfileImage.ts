import { useState } from "react";
import { pickAndResizeImage } from "~/services/imageUtils";
import { getEmojiValue, toEmojiValue } from "~/services/mediaValue.ts";
import { updateProfileImageUrl } from "~/services/spaceDatabase.ts";

const PICKER_OPEN_DELAY_MS = 250;

export const useProfileImage = (userId: string | undefined, imageUrl: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerText, setViewerText] = useState("");

  const runWithLoading = async (work: () => Promise<boolean>) => {
    setLoading(true);
    try {
      return await work();
    } finally {
      setLoading(false);
    }
  };
  const saveImage = async (value: string | null) => {
    if (!userId) return false;
    await updateProfileImageUrl(userId, value);
    return true;
  };
  const pickPhoto = () =>
    runWithLoading(async () => {
      const url = await pickAndResizeImage();
      if (!url) return false;
      return saveImage(url);
    });
  const remove = async () => {
    if (!userId) return false;
    return runWithLoading(() => saveImage(null));
  };
  const saveText = (value: string) =>
    runWithLoading(async () => {
      const trimmed = value.trim();
      if (!trimmed) return false;
      return saveImage(toEmojiValue(trimmed));
    });
  const closeViewer = () => {
    setViewerVisible(false);
    setViewerText("");
  };
  const openAvatar = () => {
    if (!imageUrl) return void pickPhoto();
    setViewerText(getEmojiValue(imageUrl) ?? "");
    setViewerVisible(true);
  };
  const replaceImage = async () => {
    closeViewer();
    await new Promise((resolve) => setTimeout(resolve, PICKER_OPEN_DELAY_MS));
    await pickPhoto();
  };
  const removeImage = async () => {
    if (await remove()) closeViewer();
  };
  const applyViewerText = async () => {
    if (await saveText(viewerText)) closeViewer();
  };

  return {
    loading,
    viewerVisible,
    viewerText,
    setViewerText,
    openAvatar,
    closeViewer,
    replaceImage,
    removeImage,
    applyViewerText,
  };
};
