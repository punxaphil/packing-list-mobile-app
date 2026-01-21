import { useCallback } from "react";
import { writeDb } from "~/services/database.ts";
import { pickAndResizeImage } from "~/services/imageUtils.ts";
import { Image } from "~/types/Image.ts";
import { showImageActionSheet } from "./CategoryCard.tsx";

export const useCategoryImageActions = () => {
  const pickImage = async (categoryId: string, existingImage?: Image) => {
    const url = await pickAndResizeImage();
    if (!url) return;
    if (existingImage) {
      await writeDb.updateImage(existingImage.id, url);
    } else {
      await writeDb.addImage("categories", categoryId, url);
    }
  };

  const removeImage = async (image: Image) => {
    await writeDb.deleteImage(image.id);
  };

  const handleImagePress = useCallback((categoryId: string, image?: Image) => {
    if (image) {
      showImageActionSheet(
        () => void pickImage(categoryId, image),
        () => void removeImage(image),
      );
    } else {
      void pickImage(categoryId);
    }
  }, []);

  return { handleImagePress };
};
