import i18next from "i18next";
import { useState } from "react";
import type { WriteDb } from "~/services/database.ts";
import { withoutPackItemMembers } from "~/services/packItemState.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { homeCopy } from "./copy.ts";
import { getBulkEditTargets } from "./itemsSectionHelpers.ts";
import { showActionSheet } from "./showActionSheet.ts";
import { useToast } from "./Toast.tsx";

export const useBulkEdit = (items: PackItem[], writeDb: WriteDb) => {
  const [busy, setBusy] = useState(false);
  const { show: showToast } = useToast();
  const run = async (targets: PackItem[], action: (item: PackItem) => Promise<void>) => {
    setBusy(true);
    try {
      for (const item of targets) await action(item);
    } catch {
      showToast(homeCopy.bulkEditError);
    } finally {
      setBusy(false);
    }
  };
  const confirm = (title: string, label: string, targets: PackItem[], action: (item: PackItem) => Promise<void>) => {
    showActionSheet(
      title,
      [
        { text: label, style: "destructive", onPress: () => void run(targets, action) },
        { text: homeCopy.cancel, style: "cancel" },
      ],
      { previewItems: targets }
    );
  };
  const open = () => {
    if (busy) return;
    const { tickedItems, assignedItems } = getBulkEditTargets(items);
    showActionSheet(homeCopy.bulkEdit, [
      {
        text: i18next.t("home.removeTickedItemsCount", { count: tickedItems.length }),
        disabled: tickedItems.length === 0,
        disabledReason: homeCopy.noTickedItems,
        onPress: () =>
          confirm(
            i18next.t("home.removeTickedConfirm", { count: tickedItems.length }),
            homeCopy.removeTickedItems,
            tickedItems,
            (item) => writeDb.deletePackItem(item.id)
          ),
      },
      {
        text: i18next.t("home.removeAllMembersCount", { count: assignedItems.length }),
        disabled: assignedItems.length === 0,
        disabledReason: homeCopy.noAssignedMembers,
        onPress: () =>
          confirm(
            i18next.t("home.removeMembersConfirm", { count: assignedItems.length }),
            homeCopy.removeAllMembers,
            assignedItems,
            (item) => writeDb.updatePackItem(withoutPackItemMembers(item))
          ),
      },
      { text: homeCopy.cancel, style: "cancel" },
    ]);
  };
  return { open, busy };
};
