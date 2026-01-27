import { useCallback } from "react";
import { writeDb } from "~/services/database.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { animateLayout, animateListEntry } from "./layoutAnimation.ts";
import { PackingListSummary, SelectionState } from "./types.ts";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ListActions = {
  onAdd: (name: string, useTemplate: boolean) => Promise<void>;
  onDelete: (list: PackingListSummary) => Promise<void>;
  onSetTemplate: (list: PackingListSummary) => Promise<void>;
  onRemoveTemplate: (list: PackingListSummary) => Promise<void>;
  onPin: (list: PackingListSummary) => Promise<void>;
  onUnpin: (list: PackingListSummary) => Promise<void>;
  onArchive: (list: PackingListSummary) => Promise<void>;
  onRestore: (list: PackingListSummary) => Promise<void>;
  onUncheckAll: (list: PackingListSummary) => Promise<void>;
};

export const useListActions = (
  lists: PackingListSummary[],
  selection: SelectionState,
  templateList: NamedEntity | null,
  onListSelect?: (id: string) => void
): ListActions => ({
  onAdd: useAddList(lists, selection, templateList, onListSelect),
  onDelete: useDeleteList(selection),
  onSetTemplate: useSetTemplate(templateList),
  onRemoveTemplate: useRemoveTemplate(),
  onPin: usePin(),
  onUnpin: useUnpin(),
  onArchive: useArchive(),
  onRestore: useRestore(),
  onUncheckAll: useUncheckAll(),
});

const useAddList = (
  lists: PackingListSummary[],
  selection: SelectionState,
  templateList: NamedEntity | null,
  onListSelect?: (id: string) => void
) =>
  useCallback(
    async (name: string, useTemplate: boolean) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      animateListEntry();
      const id = await writeDb.addPackingList(trimmed, getNextListRank(lists));
      if (useTemplate && templateList) {
        await writeDb.copyPackItemsToList(templateList.id, id);
      }
      if (onListSelect) {
        onListSelect(id);
      } else {
        selection.select(id);
      }
    },
    [lists, selection, templateList, onListSelect]
  );

const useDeleteList = (selection: SelectionState) =>
  useCallback(
    async (list: PackingListSummary) => {
      animateLayout();
      await writeDb.deletePackingList(list.id);
      if (selection.selectedId === list.id) selection.clear();
    },
    [selection]
  );

const useSetTemplate = (currentTemplate: NamedEntity | null) =>
  useCallback(
    async (list: PackingListSummary) => {
      await delay(50);
      animateLayout();
      if (currentTemplate) await writeDb.updatePackingList({ ...currentTemplate, isTemplate: false });
      await writeDb.updatePackingList({ ...list, isTemplate: true });
    },
    [currentTemplate]
  );

const useRemoveTemplate = () =>
  useCallback(async (list: PackingListSummary) => {
    await delay(50);
    animateLayout();
    await writeDb.updatePackingList({ ...list, isTemplate: false });
  }, []);

const usePin = () =>
  useCallback(async (list: PackingListSummary) => {
    await delay(50);
    animateLayout();
    await writeDb.updatePackingList({ ...list, pinned: true });
  }, []);

const useUnpin = () =>
  useCallback(async (list: PackingListSummary) => {
    await delay(50);
    animateLayout();
    await writeDb.updatePackingList({ ...list, pinned: false });
  }, []);

const useArchive = () =>
  useCallback(async (list: PackingListSummary) => {
    await writeDb.updatePackingList({ ...list, archived: true });
  }, []);

const useRestore = () =>
  useCallback(async (list: PackingListSummary) => {
    await writeDb.updatePackingList({ ...list, archived: false });
  }, []);

const useUncheckAll = () =>
  useCallback(async (list: PackingListSummary) => {
    await writeDb.uncheckAllItems(list.id);
  }, []);

const getNextListRank = (lists: PackingListSummary[]) => Math.max(...lists.map((list) => list.rank ?? 0), 0) + 1;
