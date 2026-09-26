import { translatedCopy } from "~/i18n/translatedCopy.ts";

export type EntityCopy = {
  type: string;
  header: string;
  addButton: string;
  renamePrompt: string;
  renameConfirm: string;
  createPrompt: string;
  createConfirm: string;
  delete: string;
  deleteIcon: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  bulkEdit: string;
  bulkRemoveEmpty: string;
  bulkNone: string;
  bulkFailed: string;
  deleteBlockedTitle: string;
  deleteBlockedMessage: string;
  cancel: string;
  deleteAction: string;
  moveItems: string;
  imageTitle: string;
  imageReplace: string;
  imageRemove: string;
  changeCategory: string;
  addImage: string;
  updateImage: string;
  deleteItemsBody: string;
};

export const CATEGORY_COPY: EntityCopy = translatedCopy<EntityCopy>("category");

export const MEMBER_COPY: EntityCopy = translatedCopy<EntityCopy>("member");
