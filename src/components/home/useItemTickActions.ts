import { useCallback } from "react";
import { withPackItemMembers } from "~/services/packItemState.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { useTickUndo } from "./useTickUndo.ts";

export const useItemTickActions = (
  items: PackItem[],
  listId: string | null | undefined,
  updateItem: (item: PackItem) => void,
  updateBatch: (items: PackItem[]) => void
) => {
  const { record, undo, canUndo } = useTickUndo(listId, items, updateBatch);
  const toggleCategory = useCallback(
    (categoryItems: PackItem[], checked: boolean) => {
      record(
        categoryItems
          .filter((item) => item.checked !== checked || item.members.some((member) => member.checked !== checked))
          .map((item) => ({
            id: item.id,
            checked: item.checked,
            members: item.members.map(({ id, checked }) => ({ id, checked })),
          }))
      );
      updateBatch(
        categoryItems.map((item) => ({
          ...item,
          checked,
          members: item.members.map((member) => ({ ...member, checked })),
        }))
      );
    },
    [record, updateBatch]
  );

  const toggleItem = useCallback(
    (item: PackItem) => {
      record([{ id: item.id, checked: item.checked }]);
      updateItem({ ...item, checked: !item.checked });
    },
    [record, updateItem]
  );

  const toggleMemberPacked = useCallback(
    (item: PackItem, memberId: string) => {
      const member = item.members.find((entry) => entry.id === memberId);
      if (!member) return;
      record([{ id: item.id, members: [{ id: memberId, checked: member.checked }] }]);
      updateItem(
        withPackItemMembers(
          item,
          item.members.map((entry) => (entry.id === memberId ? { ...entry, checked: !entry.checked } : entry))
        )
      );
    },
    [record, updateItem]
  );

  const toggleAllMembers = useCallback(
    (item: PackItem, checked: boolean) => {
      record(
        [
          {
            id: item.id,
            members: item.members
              .filter((member) => member.checked !== checked)
              .map(({ id, checked }) => ({ id, checked })),
          },
        ].filter((change) => change.members.length)
      );
      updateItem(
        withPackItemMembers(
          item,
          item.members.map((member) => ({ ...member, checked }))
        )
      );
    },
    [record, updateItem]
  );

  return { toggleCategory, toggleItem, toggleMemberPacked, toggleAllMembers, undo, canUndo };
};
