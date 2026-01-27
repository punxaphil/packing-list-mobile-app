import { useCallback } from "react";
import { Alert } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { animateLayout, animateListEntry } from "../home/layoutAnimation.ts";
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
      animateListEntry();
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
        const action = await showHasItemsAlert(entity.name, count, copy);
        if (action === "move") onMoveItems(entity);
        return;
      }
      const label = entity.name?.trim() ? entity.name : copy.delete;
      const confirmed = await confirmDelete(label, copy);
      if (!confirmed) return;
      animateLayout();
      await db.delete(entity.id, [], true);
    },
    [itemCounts, copy, db, onMoveItems]
  );

const showHasItemsAlert = (name: string, count: number, copy: EntityCopy): Promise<"move" | "cancel"> =>
  new Promise((resolve) => {
    Alert.alert(
      copy.deleteBlockedTitle,
      copy.deleteBlockedMessage.replace("{name}", name).replace("{count}", String(count)),
      [
        { text: copy.cancel, style: "cancel", onPress: () => resolve("cancel") },
        { text: copy.moveItems, onPress: () => resolve("move") },
      ],
      { cancelable: true, onDismiss: () => resolve("cancel") }
    );
  });

const getNextRank = (entities: NamedEntity[]) => Math.max(...entities.map((e) => e.rank ?? 0), 0) + 1;

const confirmDelete = (name: string, copy: EntityCopy) =>
  new Promise<boolean>((resolve) => {
    Alert.alert(
      copy.deleteConfirmTitle,
      copy.deleteConfirmMessage.replace("{name}", name),
      [
        { text: copy.cancel, style: "cancel", onPress: () => resolve(false) },
        { text: copy.deleteAction, style: "destructive", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
