import { useCallback } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { WriteDb } from "~/services/database.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { animateLayout, animateListEntry } from "./layoutAnimation.ts";
import { PackingListSummary, SelectionState } from "./types.ts";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ListActions = {
  onAdd: (name: string, useTemplate: boolean) => Promise<void>;
  onDelete: (list: PackingListSummary) => Promise<void>;
  onRename: (list: PackingListSummary, name: string) => Promise<void>;
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
  onListSelect?: (id: string) => void,
): ListActions => {
  const { writeDb } = useSpace();
  return {
    onAdd: useAddList(lists, selection, templateList, writeDb, onListSelect),
    onDelete: useDeleteList(selection, writeDb),
    onRename: useRenameList(writeDb),
    onSetTemplate: useSetTemplate(templateList, writeDb),
    onRemoveTemplate: useRemoveTemplate(writeDb),
    onPin: usePin(writeDb),
    onUnpin: useUnpin(writeDb),
    onArchive: useArchive(writeDb),
    onRestore: useRestore(writeDb),
    onUncheckAll: useUncheckAll(writeDb),
  };
};

const useAddList = (
  lists: PackingListSummary[],
  selection: SelectionState,
  templateList: NamedEntity | null,
  writeDb: WriteDb,
  onListSelect?: (id: string) => void,
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
    [lists, selection, templateList, writeDb, onListSelect],
  );

const useDeleteList = (selection: SelectionState, writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      animateLayout();
      await writeDb.deletePackingList(list.id);
      if (selection.selectedId === list.id) selection.clear();
    },
    [selection, writeDb],
  );

const useRenameList = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary, name: string) => {
      await writeDb.updatePackingList({ ...list, name });
    },
    [writeDb],
  );

const useSetTemplate = (
  currentTemplate: NamedEntity | null,
  writeDb: WriteDb,
) =>
  useCallback(
    async (list: PackingListSummary) => {
      await delay(50);
      animateLayout();
      if (currentTemplate)
        await writeDb.updatePackingList({
          ...currentTemplate,
          isTemplate: false,
        });
      await writeDb.updatePackingList({ ...list, isTemplate: true });
    },
    [currentTemplate, writeDb],
  );

const useRemoveTemplate = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await delay(50);
      animateLayout();
      await writeDb.updatePackingList({ ...list, isTemplate: false });
    },
    [writeDb],
  );

const usePin = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await delay(50);
      animateLayout();
      await writeDb.updatePackingList({ ...list, pinned: true });
    },
    [writeDb],
  );

const useUnpin = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await delay(50);
      animateLayout();
      await writeDb.updatePackingList({ ...list, pinned: false });
    },
    [writeDb],
  );

const useArchive = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await writeDb.updatePackingList({ ...list, archived: true });
    },
    [writeDb],
  );

const useRestore = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await writeDb.updatePackingList({ ...list, archived: false });
    },
    [writeDb],
  );

const useUncheckAll = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await writeDb.uncheckAllItems(list.id);
    },
    [writeDb],
  );

const getNextListRank = (lists: PackingListSummary[]) =>
  Math.max(...lists.map((list) => list.rank ?? 0), 0) + 1;
