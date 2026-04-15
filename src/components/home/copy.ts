import { translatedCopy } from "~/i18n/translatedCopy.ts";

type HomeCopy = {
  rename: string;
  unknownUser: string;
  signOutTitle: string;
  signOutMessage: string;
  signOutCancel: string;
  signOutConfirm: string;
  loading: string;
  itemsLoading: string;
  empty: string;
  emptyItems: string;
  listHeader: string;
  detailHeader: string;
  back: string;
  avatarFallback: string;
  addItem: string;
  addItemQuick: string;
  addItemPrompt: string;
  addItemConfirm: string;
  addItemPlaceholder: string;
  deleteItem: string;
  newItem: string;
  listNoItems: string;
  itemSingular: string;
  itemPlural: string;
  packedSingular: string;
  packedPlural: string;
  createList: string;
  deleteList: string;
  deleteListAction: string;
  cancel: string;
  createListPrompt: string;
  createListConfirm: string;
  createListPlaceholder: string;
  renameListPrompt: string;
  renameListConfirm: string;
  renameItemPrompt: string;
  renameCategoryPrompt: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  deleteIcon: string;
  dragHandleLabel: string;
  useTemplateTitle: string;
  useTemplateMessage: string;
  useTemplateYes: string;
  useTemplateNo: string;
  categoryMenuAddItem: string;
  categoryMenuSortAlpha: string;
  categoryMenuDeleteItems: string;
  duplicateItemName: string;
  duplicateCategoryName: string;
  duplicateListName: string;
  duplicateCopyToList: string;
  duplicateCopyToListTitle: string;
  deleteCategoryQuestionTitle: string;
  deleteCategoryQuestionMessage: string;
  keepCategory: string;
  deleteCategoryAction: string;
  withoutMembers: string;
  reminderErrorTitle: string;
  reminderErrorMessage: string;
  kitPickerTitle: string;
  kitPickerSubtitle: string;
  kitPickerAdd: string;
  kitPickerItemCount: string;
  quickStart: string;
};

export const homeCopy = translatedCopy<HomeCopy>("home");

type CommonCopy = {
  cancel: string;
  pickImage: string;
  removeImage: string;
  useText: string;
};

export const commonCopy = translatedCopy<CommonCopy>("common");

type FilterCopy = {
  title: string;
  done: string;
  itemsShowing: string;
  clear: string;
  noMatch: string;
};

export const filterCopy = translatedCopy<FilterCopy>("filter");
