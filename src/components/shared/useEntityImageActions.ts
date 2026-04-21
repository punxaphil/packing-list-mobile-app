import { useCallback, useState } from "react";
import { ActionSheetIOS, Platform } from "react-native";
import { pickAndResizeImage, promptForEmojiValue } from "~/services/imageUtils.ts";
import { getEmojiValue, toEmojiValue } from "~/services/mediaValue.ts";
import { Image } from "~/types/Image.ts";

type ImageDbOperations = {
  add: (type: string, typeId: string, url: string) => Promise<void>;
  update: (imageId: string, url: string) => Promise<void>;
  delete: (imageId: string) => Promise<void>;
};

type ViewerState = { entityId: string; image: Image } | null;

const PHOTO_OPTION = "Choose Photo";
const EMOJI_OPTION = "Choose Emoji";
const CANCEL_OPTION = "Cancel";
const MODAL_TRANSITION_DELAY_MS = 280;

export const useEntityImageActions = (imageType: string, db: ImageDbOperations) => {
  const [viewerState, setViewerState] = useState<ViewerState>(null);
  const [textValue, setTextValue] = useState("");
  const [loadingEntityId, setLoadingEntityId] = useState<string | null>(null);

  const saveValue = useCallback(
    async (entityId: string, value: string, existing?: Image) => {
      setLoadingEntityId(entityId);
      try {
        const url = value.trim();
        if (!url) return;
        if (existing) await db.update(existing.id, url);
        else await db.add(imageType, entityId, url);
        setViewerState(null);
        setTextValue("");
      } finally {
        setLoadingEntityId(null);
      }
    },
    [db, imageType]
  );

  const pickPhoto = useCallback(
    async (entityId: string, existing?: Image) => {
      const value = await pickAndResizeImage();
      if (!value) return;
      await saveValue(entityId, value, existing);
    },
    [saveValue]
  );

  const openPicker = useCallback(
    (entityId: string, existing?: Image) => {
      if (Platform.OS !== "ios") {
        void pickPhoto(entityId, existing);
        return;
      }
      const options = [PHOTO_OPTION, EMOJI_OPTION, CANCEL_OPTION];
      ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: options.length - 1 }, (index) => {
        if (index === 0) {
          void pickPhoto(entityId, existing);
          return;
        }
        if (index === 1) {
          setTimeout(() => {
            void promptForEmojiValue().then((value) => {
              if (!value) return;
              void saveValue(entityId, value, existing);
            });
          }, MODAL_TRANSITION_DELAY_MS);
        }
      });
    },
    [pickPhoto, saveValue]
  );

  const handleImagePress = useCallback(
    (entityId: string, image?: Image) => {
      if (image) {
        setViewerState({ entityId, image });
        setTextValue(getEmojiValue(image.url) ?? "");
      } else openPicker(entityId);
    },
    [openPicker]
  );

  const handleReplace = () => {
    if (viewerState) void pickPhoto(viewerState.entityId, viewerState.image);
  };

  const handleRemove = async () => {
    if (viewerState) {
      await db.delete(viewerState.image.id);
      setViewerState(null);
    }
  };

  const closeViewer = () => {
    setViewerState(null);
    setTextValue("");
  };
  const submitText = async () => {
    if (!viewerState) return;
    const trimmed = textValue.trim();
    if (!trimmed) return;
    await saveValue(viewerState.entityId, toEmojiValue(trimmed), viewerState.image);
  };
  const modalLoading = viewerState?.entityId === loadingEntityId;

  return {
    handleImagePress,
    viewerState,
    handleReplace,
    handleRemove,
    closeViewer,
    textValue,
    setTextValue,
    submitText,
    loadingEntityId,
    modalLoading,
  };
};
