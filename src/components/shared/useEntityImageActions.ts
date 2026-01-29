import { useCallback, useState } from "react";
import { pickAndResizeImage } from "~/services/imageUtils.ts";
import { Image } from "~/types/Image.ts";

type ImageDbOperations = {
  add: (type: string, typeId: string, url: string) => Promise<void>;
  update: (imageId: string, url: string) => Promise<void>;
  delete: (imageId: string) => Promise<void>;
};

type ViewerState = { entityId: string; image: Image } | null;

export const useEntityImageActions = (imageType: string, db: ImageDbOperations) => {
  const [viewerState, setViewerState] = useState<ViewerState>(null);

  const pickAndUpload = useCallback(
    async (entityId: string, existing?: Image) => {
      const url = await pickAndResizeImage();
      if (!url) return;
      if (existing) await db.update(existing.id, url);
      else await db.add(imageType, entityId, url);
      setViewerState(null);
    },
    [db, imageType]
  );

  const handleImagePress = useCallback(
    (entityId: string, image?: Image) => {
      if (image) setViewerState({ entityId, image });
      else void pickAndUpload(entityId);
    },
    [pickAndUpload]
  );

  const handleReplace = () => {
    if (viewerState) void pickAndUpload(viewerState.entityId, viewerState.image);
  };

  const handleRemove = async () => {
    if (viewerState) {
      await db.delete(viewerState.image.id);
      setViewerState(null);
    }
  };

  const closeViewer = () => setViewerState(null);

  return {
    handleImagePress,
    viewerState,
    handleReplace,
    handleRemove,
    closeViewer,
  };
};
