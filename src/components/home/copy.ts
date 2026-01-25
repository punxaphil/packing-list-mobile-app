import { homeEmptyStateCopy } from "./theme.ts";

export type HomeCopy = {
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
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  deleteIcon: string;
  dragHandleLabel: string;
  useTemplateTitle: string;
  useTemplateMessage: string;
  useTemplateYes: string;
  useTemplateNo: string;
};

export const homeCopy: HomeCopy = {
  unknownUser: "Unknown user",
  signOutTitle: "Sign out?",
  signOutMessage: "Sign out as",
  signOutCancel: "Stay signed in",
  signOutConfirm: "Sign out",
  loading: "Loading...",
  itemsLoading: "Loading items...",
  empty: homeEmptyStateCopy,
  emptyItems: "No items in this list.",
  listHeader: "Your Packing Lists",
  detailHeader: "Packing Items",
  back: "< Back",
  avatarFallback: "?",
  addItem: "Add item",
  addItemQuick: "Add item...",
  addItemPrompt: "Add a packing item",
  addItemConfirm: "Add",
  addItemPlaceholder: "Travel adapter",
  deleteItem: "Remove item",
  newItem: "New item",
  listNoItems: "No items",
  itemSingular: "item",
  itemPlural: "items",
  packedSingular: "packed",
  packedPlural: "packed",
  createList: "Create new Packing List",
  deleteList: "Delete packing list",
  deleteListAction: "Delete",
  cancel: "Cancel",
  createListPrompt: "Name your new packing list",
  createListConfirm: "Create",
  createListPlaceholder: "Summer getaway",
  renameListPrompt: "Rename packing list",
  renameListConfirm: "Save",
  deleteConfirmTitle: "Delete this list?",
  deleteConfirmMessage: "Delete \"{name}\"? This removes the list and its items.",
  deleteIcon: "\u{1F5D1}",
  dragHandleLabel: "Drag handle",
  useTemplateTitle: "Use template?",
  useTemplateMessage: "Create this list with items from your template?",
  useTemplateYes: "Yes, use template",
  useTemplateNo: "No, start empty",
} as const;
