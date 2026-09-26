import type { Image } from "~/types/Image.ts";
import type { PackItem } from "~/types/PackItem.ts";
import type { useFlashHighlight } from "../shared/useFlashHighlight.ts";
import type { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import type { DragOffset } from "./useDraggableRow.tsx";

export type RowLayout = { x: number; y: number; width: number; height: number };

export type CategoryItemRowProps = {
  item: PackItem;
  dragDisabled: boolean;
  columnCount: number;
  color: string;
  checkboxColor: string;
  initialsMap: MemberInitialsMap;
  memberNames: MemberNamesMap;
  memberImages: Image[];
  itemImage?: Image;
  hidden: boolean;
  highlightOpacity?: ReturnType<typeof useFlashHighlight>["highlightOpacity"];
  hasOtherLists: boolean;
  checkboxDisabled: boolean;
  isCurrentMatch: boolean;
  onToggle: (item: PackItem) => void;
  onDeleteItem: (id: string) => void;
  onLayout: (layout: RowLayout) => void;
  onDragStart: () => void;
  onDragMove: (offset: DragOffset) => void;
  onDragEnd: () => void;
  onOpenAssignMembers: () => void;
  onOpenMoveCategory: () => void;
  onOpenCopyToList: () => void;
  onOpenRename: () => void;
  onOpenImagePicker: () => void;
  onToggleMemberPacked: (memberId: string) => void;
  onToggleAllMembers: (checked: boolean) => void;
};

export const areRowPropsEqual = (prev: CategoryItemRowProps, next: CategoryItemRowProps): boolean =>
  prev.item.id === next.item.id &&
  prev.item.checked === next.item.checked &&
  prev.item.name === next.item.name &&
  prev.color === next.color &&
  prev.checkboxColor === next.checkboxColor &&
  prev.item.members.length === next.item.members.length &&
  prev.item.members.every((member, index) => member.checked === next.item.members[index]?.checked) &&
  prev.hidden === next.hidden &&
  prev.columnCount === next.columnCount &&
  !!prev.highlightOpacity === !!next.highlightOpacity &&
  prev.hasOtherLists === next.hasOtherLists &&
  prev.checkboxDisabled === next.checkboxDisabled &&
  prev.isCurrentMatch === next.isCurrentMatch &&
  prev.initialsMap === next.initialsMap &&
  prev.memberNames === next.memberNames &&
  prev.memberImages === next.memberImages &&
  prev.itemImage?.id === next.itemImage?.id &&
  prev.itemImage?.url === next.itemImage?.url;
