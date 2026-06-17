import { translatedCopy } from "~/i18n/translatedCopy.ts";

type ListCopy = {
  createList: string;
  archivedPlural: string;
  archivedSingular: string;
  renameList: string;
  rename: string;
  renameConfirm: string;
  copy: string;
  copyName: string;
  copyNameWithCount: string;
  template: string;
  restore: string;
  unpin: string;
  pinToTop: string;
  unsetTemplate: string;
  setAsTemplate: string;
  archive: string;
  uncheckAll: string;
  uncheckConfirm: string;
  moveToSpace: string;
  delete: string;
  deleteConfirm: string;
  cancel: string;
  listMenu: string;
  title: string;
  dueDate: string;
  dueDatePlaceholder: string;
  clearDueDate: string;
  notesPlaceholder: string;
  showNotes: string;
};

export const listCopy = translatedCopy<ListCopy>("list");

type AddItemCopy = {
  added: string;
  duplicateError: string;
  existingCategory: string;
  newCategory: string;
  newCategoryPlaceholder: string;
  keepOpen: string;
  browseKits: string;
};

export const addItemCopy = translatedCopy<AddItemCopy>("addItem");

type MoveCategoryCopy = {
  title: string;
  cancel: string;
  currentCategory: string;
};

export const moveCategoryCopy = translatedCopy<MoveCategoryCopy>("moveCategory");

type AssignMembersCopy = {
  title: string;
  save: string;
  cancel: string;
  noMembers: string;
  manageMembers: string;
};

export const assignMembersCopy = translatedCopy<AssignMembersCopy>("assignMembers");

type CopyToListCopy = {
  title: string;
  cancel: string;
  confirmTitle: string;
  confirmMessage: string;
  item: string;
  items: string;
};

export const copyToListCopy = translatedCopy<CopyToListCopy>("copyToList");
