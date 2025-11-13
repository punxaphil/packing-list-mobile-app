import { useCallback } from "react";
import { Alert } from "react-native";
import { writeDb } from "~/services/database.ts";
import { HOME_COPY } from "./styles.ts";
import { animateLayout, animateListEntry } from "./layoutAnimation.ts";
import { PackingListSummary, SelectionState } from "./types.ts";

export type ListActions = {
  onAdd: (name: string) => Promise<void>;
  onDelete: (list: PackingListSummary) => Promise<void>;
};

export const useListActions = (lists: PackingListSummary[], selection: SelectionState): ListActions => ({
  onAdd: useAddList(lists, selection),
  onDelete: useDeleteList(selection),
});

const useAddList = (lists: PackingListSummary[], selection: SelectionState) =>
  useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    animateListEntry();
    const id = await writeDb.addPackingList(trimmed, getNextListRank(lists));
    selection.select(id);
  }, [lists, selection]);

const useDeleteList = (selection: SelectionState) =>
  useCallback(async (list: PackingListSummary) => {
    const label = list.name?.trim() ? list.name : HOME_COPY.deleteList;
    const confirmed = await confirmDelete(label);
    if (!confirmed) return;
    animateLayout();
    await writeDb.deletePackingList(list.id);
    if (selection.selectedId === list.id) selection.clear();
  }, [selection]);

const getNextListRank = (lists: PackingListSummary[]) =>
  Math.max(...lists.map((list) => list.rank ?? 0), 0) + 1;

const confirmDelete = (name: string) =>
  new Promise<boolean>((resolve) => {
    Alert.alert(
      HOME_COPY.deleteConfirmTitle,
      HOME_COPY.deleteConfirmMessage.replace("{name}", name),
      [
        { text: HOME_COPY.cancel, style: "cancel", onPress: () => resolve(false) },
        { text: HOME_COPY.deleteListAction, style: "destructive", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });