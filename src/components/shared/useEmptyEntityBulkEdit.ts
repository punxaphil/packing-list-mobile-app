import i18next from "i18next";
import { useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { commonCopy } from "../home/copy.ts";
import { showActionSheet } from "../home/showActionSheet.ts";
import { useToast } from "../home/Toast.tsx";
import { getEntitiesWithoutItems } from "./entityValidation.ts";

type EmptyBulkCopy = {
  bulkEdit: string;
  bulkRemoveEmpty: string;
  bulkNone: string;
  bulkFailed: string;
};

type Config<T extends NamedEntity> = {
  entities: T[];
  isEligible: (entity: T) => boolean;
  hasItem: (entity: T, item: PackItem) => boolean;
  onDelete: (entity: T) => Promise<void>;
  copy: EmptyBulkCopy;
  menuKey: string;
  confirmKey: string;
};

export const useEmptyEntityBulkEdit = <T extends NamedEntity>({
  entities,
  isEligible,
  hasItem,
  onDelete,
  copy,
  menuKey,
  confirmKey,
}: Config<T>) => {
  const { writeDb } = useSpace();
  const { show: showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const remove = async (targets: T[]) => {
    setBusy(true);
    try {
      const items = await writeDb.getPackItemsForAllPackingLists();
      const stillEmpty = getEntitiesWithoutItems(targets, items, hasItem);
      for (const entity of stillEmpty) await onDelete(entity);
      if (stillEmpty.length !== targets.length) showToast(copy.bulkFailed);
    } catch {
      showToast(copy.bulkFailed);
    } finally {
      setBusy(false);
    }
  };

  const open = () => {
    if (busy) return;
    const targets = entities.filter(isEligible);
    showActionSheet(copy.bulkEdit, [
      {
        text: i18next.t(menuKey, { count: targets.length }),
        disabled: targets.length === 0,
        disabledReason: copy.bulkNone,
        onPress: () =>
          showActionSheet(
            i18next.t(confirmKey, { count: targets.length }),
            [
              { text: copy.bulkRemoveEmpty, style: "destructive", onPress: () => void remove(targets) },
              { text: commonCopy.cancel, style: "cancel" },
            ],
            { previewItems: targets }
          ),
      },
      { text: commonCopy.cancel, style: "cancel" },
    ]);
  };

  return { open, busy };
};
