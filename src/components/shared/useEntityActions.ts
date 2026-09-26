import { useCallback } from "react";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { animateLayout } from "../home/layoutAnimation.ts";
import { showActionSheet } from "../home/showActionSheet.ts";
import { EntityActions } from "./EntityCard.tsx";
import { EntityCopy } from "./entityStyles.ts";

type DbOperations = {
  add: (name: string, rank: number) => Promise<NamedEntity | string>;
  update: (entity: NamedEntity) => Promise<void>;
  delete: (id: string, lists: NamedEntity[], force: boolean) => Promise<void>;
};

export const useEntityActions = (
  entities: NamedEntity[],
  itemCounts: Record<string, number>,
  copy: EntityCopy,
  db: DbOperations,
  onMoveItems?: (entity: NamedEntity) => void
): EntityActions => ({
  onAdd: useAddEntity(entities, db),
  onDelete: useDeleteEntity(itemCounts, copy, db, onMoveItems),
  onRename: useRenameEntity(db),
});

const useRenameEntity = (db: DbOperations) =>
  useCallback(
    async (entity: NamedEntity, name: string) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed === entity.name) return;
      await db.update({ ...entity, name: trimmed });
    },
    [db]
  );

const useAddEntity = (entities: NamedEntity[], db: DbOperations) =>
  useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      await db.add(trimmed, getNextRank(entities));
    },
    [entities, db]
  );

const useDeleteEntity = (
  itemCounts: Record<string, number>,
  copy: EntityCopy,
  db: DbOperations,
  onMoveItems?: (entity: NamedEntity) => void
) =>
  useCallback(
    async (entity: NamedEntity) => {
      const count = itemCounts[entity.id] ?? 0;
      if (count > 0 && onMoveItems) {
        showActionSheet(
          `${copy.deleteBlockedTitle}\n${copy.deleteBlockedMessage.replace("{name}", entity.name).replace("{count}", String(count))}`,
          [{ text: copy.moveItems, onPress: () => onMoveItems(entity) }]
        );
        return;
      }
      const label = entity.name?.trim() ? entity.name : copy.delete;
      showActionSheet(`${copy.deleteConfirmTitle}\n${copy.deleteConfirmMessage.replace("{name}", label)}`, [
        {
          text: copy.deleteAction,
          style: "destructive",
          onPress: async () => {
            animateLayout();
            await db.delete(entity.id, [], true);
          },
        },
      ]);
    },
    [itemCounts, copy, db, onMoveItems]
  );

const getNextRank = (entities: NamedEntity[]) => {
  const ranks = entities.map((e) => e.rank ?? 0);
  return ranks.length ? Math.min(...ranks) - 1 : 0;
};
