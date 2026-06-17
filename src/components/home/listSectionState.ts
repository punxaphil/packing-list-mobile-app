import { useCallback } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { WriteDb } from "~/services/database.ts";
import type { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { animateLayout, animateListEntry } from "./layoutAnimation.ts";
import { listCopy } from "./listCopy.ts";
import { PackingListSummary, SelectionState } from "./types.ts";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ListActions = {
  onAdd: (name: string, useTemplate: boolean) => Promise<void>;
  onCopy: (list: PackingListSummary) => Promise<void>;
  onDelete: (list: PackingListSummary) => Promise<void>;
  onRename: (list: PackingListSummary, name: string) => Promise<void>;
  onSetTemplate: (list: PackingListSummary) => Promise<void>;
  onunsetTemplate: (list: PackingListSummary) => Promise<void>;
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
  images: Image[],
  onListSelect?: (id: string) => void
): ListActions => {
  const { writeDb } = useSpace();
  return {
    onAdd: useAddList(lists, selection, templateList, writeDb, onListSelect),
    onCopy: useCopyList(lists, selection, images, writeDb, onListSelect),
    onDelete: useDeleteList(selection, writeDb),
    onRename: useRenameList(writeDb),
    onSetTemplate: useSetTemplate(templateList, writeDb),
    onunsetTemplate: useunsetTemplate(writeDb),
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
    [lists, selection, templateList, writeDb, onListSelect]
  );

const useDeleteList = (selection: SelectionState, writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      const wasSelected = selection.selectedId === list.id;
      animateLayout();
      await writeDb.deletePackingList(list.id);
      if (wasSelected) selection.clear();
    },
    [selection, writeDb]
  );

const useCopyList = (
  lists: PackingListSummary[],
  selection: SelectionState,
  images: Image[],
  writeDb: WriteDb,
  onListSelect?: (id: string) => void
) =>
  useCallback(
    async (list: PackingListSummary) => {
      const name = buildCopiedListName(list.name, lists);
      const rank = getNextListRank(lists);
      animateListEntry();
      const id = await writeDb.addPackingList(name, rank);
      await Promise.all([
        writeDb.updatePackingList(buildCopiedList(list, id, name, rank)),
        writeDb.copyPackItemsToList(list.id, id),
        copyListImage(images, list.id, id, writeDb),
      ]);
      if (onListSelect) {
        onListSelect(id);
      } else {
        selection.select(id);
      }
    },
    [images, lists, onListSelect, selection, writeDb]
  );

const useRenameList = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary, name: string) => {
      await writeDb.updatePackingList({ ...list, name });
    },
    [writeDb]
  );

const useSetTemplate = (currentTemplate: NamedEntity | null, writeDb: WriteDb) =>
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
    [currentTemplate, writeDb]
  );

const useunsetTemplate = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await delay(50);
      animateLayout();
      await writeDb.updatePackingList({ ...list, isTemplate: false });
    },
    [writeDb]
  );

const usePin = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await delay(50);
      animateLayout();
      await writeDb.updatePackingList({ ...list, pinned: true });
    },
    [writeDb]
  );

const useUnpin = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await delay(50);
      animateLayout();
      await writeDb.updatePackingList({ ...list, pinned: false });
    },
    [writeDb]
  );

const useArchive = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await writeDb.updatePackingList({ ...list, archived: true });
    },
    [writeDb]
  );

const useRestore = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await writeDb.updatePackingList({ ...list, archived: false });
    },
    [writeDb]
  );

const useUncheckAll = (writeDb: WriteDb) =>
  useCallback(
    async (list: PackingListSummary) => {
      await writeDb.uncheckAllItems(list.id);
    },
    [writeDb]
  );

const buildCopiedListName = (name: string, lists: PackingListSummary[]) => {
  const existing = new Set(lists.map((list) => list.name.trim().toLowerCase()));
  let count = 1;
  let candidate = formatCopiedListName(name, count);
  while (existing.has(candidate.trim().toLowerCase())) {
    count += 1;
    candidate = formatCopiedListName(name, count);
  }
  return candidate;
};

const formatCopiedListName = (name: string, count: number) =>
  count === 1
    ? listCopy.copyName.replace("{name}", name)
    : listCopy.copyNameWithCount.replace("{name}", name).replace("{count}", String(count));

const buildCopiedList = (list: PackingListSummary, id: string, name: string, rank: number): NamedEntity => ({
  id,
  name,
  rank,
  ...(list.color ? { color: list.color } : {}),
  ...(list.notes ? { notes: list.notes } : {}),
  ...(list.showNotes ? { showNotes: true } : {}),
  ...(list.dueAt !== undefined ? { dueAt: list.dueAt } : {}),
  ...(list.userId ? { userId: list.userId } : {}),
});

const copyListImage = async (images: Image[], sourceId: string, targetId: string, writeDb: WriteDb) => {
  const image = images.find((entry) => entry.typeId === sourceId);
  if (!image) return;
  await writeDb.addImage(image.type, targetId, image.url);
};

const getNextListRank = (lists: PackingListSummary[]) => Math.max(...lists.map((list) => list.rank ?? 0), 0) + 1;
