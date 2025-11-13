import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { writeDb } from "~/services/database.ts";
import { HOME_COPY } from "./styles.ts";
import { animateLayout, animateListEntry } from "./layoutAnimation.ts";
import { PackingListSummary, SelectionState } from "./types.ts";

export type ListActions = {
  onAdd: (name: string) => Promise<void>;
  onRename: (list: PackingListSummary, name: string) => void;
  onDelete: (list: PackingListSummary) => Promise<void>;
};

export type ListEditing = {
  editingId: string | null;
  start: (id: string) => void;
  stop: (id: string) => void;
};

export const useListActions = (lists: PackingListSummary[], selection: SelectionState, editing: ListEditing): ListActions => ({
  onAdd: useAddList(lists, selection, editing),
  onRename: useRenameList(),
  onDelete: useDeleteList(selection, editing),
});

export const useListEditing = (): ListEditing => {
  const [editingId, setEditingId] = useState<string | null>(null);
  return {
    editingId,
    start: setEditingId,
    stop: (id: string) => setEditingId((current) => (current === id ? null : current)),
  };
};

const useAddList = (lists: PackingListSummary[], selection: SelectionState, editing: ListEditing) =>
  useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    animateListEntry();
    const id = await writeDb.addPackingList(trimmed, getNextListRank(lists));
    selection.select(id);
    editing.start(id);
  }, [lists, selection, editing]);

const useRenameList = () =>
  useCallback((list: PackingListSummary, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === list.name) return;
    void writeDb.updatePackingList({ ...list, name: trimmed });
  }, []);

const useDeleteList = (selection: SelectionState, editing: ListEditing) =>
  useCallback(async (list: PackingListSummary) => {
    const label = list.name?.trim() ? list.name : HOME_COPY.deleteList;
    const confirmed = await confirmDelete(label);
    if (!confirmed) return;
    animateLayout();
    await writeDb.deletePackingList(list.id);
    if (selection.selectedId === list.id) selection.clear();
    if (editing.editingId === list.id) editing.stop(list.id);
  }, [selection, editing]);

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