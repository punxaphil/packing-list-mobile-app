import i18next from "i18next";
import { toEmojiValue } from "~/services/mediaValue.ts";

/**
 * Web implementation of image utilities.
 */

export const pickAndResizeImage = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
      } catch {
        resolve(null);
      }
    };

    input.click();
  });
};

export const promptForEmojiValue = () =>
  new Promise<string | null>((resolve) => {
    const value = prompt(i18next.t("common.enterEmojiOrText"));
    if (value === null) {
      resolve(null);
      return;
    }
    const trimmed = value.trim();
    resolve(trimmed ? toEmojiValue(trimmed) : null);
  });
