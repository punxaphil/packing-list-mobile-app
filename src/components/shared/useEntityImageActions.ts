import { useCallback } from "react";
import { pickAndResizeImage } from "~/services/imageUtils.ts";
import { Image } from "~/types/Image.ts";
import { showImageActionSheet } from "./EntityCard.tsx";
import { EntityCopy } from "./entityStyles.ts";

type ImageDbOperations = {
  add: (type: string, typeId: string, url: string) => Promise<void>;
  update: (imageId: string, url: string) => Promise<void>;
  delete: (imageId: string) => Promise<void>;
};

export const useEntityImageActions = (imageType: string, copy: EntityCopy, db: ImageDbOperations) => {
  const handleImagePress = useCallback(
    (entityId: string, image?: Image) => {
      const pick = async (existing?: Image) => {
        const url = await pickAndResizeImage();
        if (!url) return;
        if (existing) await db.update(existing.id, url);
        else await db.add(imageType, entityId, url);
      };
      const remove = async (img: Image) => db.delete(img.id);
      if (image)
        showImageActionSheet(
          copy,
          () => void pick(image),
          () => void remove(image)
        );
      else void pick();
    },
    [imageType, copy, db]
  );

  return { handleImagePress };
};
