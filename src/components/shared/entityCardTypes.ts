import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { RowLayout } from "../home/itemRowProps.ts";
import type { DragOffset } from "../home/useDraggableRow.tsx";
import type { EntityCopy } from "./entityStyles.ts";
import type { useFlashHighlight } from "./useFlashHighlight.ts";

export type EntityActions = {
  onAdd: (name: string) => Promise<void>;
  onDelete: (entity: NamedEntity) => Promise<void>;
  onRename: (entity: NamedEntity, name: string) => Promise<void>;
};

export type EntityMenuAction = {
  text: string;
  onPress: () => void;
  style?: "destructive";
  disabled?: boolean;
};

export type EntityCardProps = {
  entity: NamedEntity;
  entities: NamedEntity[];
  actions: EntityActions;
  copy: EntityCopy;
  color: string;
  hidden?: boolean;
  highlightOpacity?: ReturnType<typeof useFlashHighlight>["highlightOpacity"];
  dragEnabled?: boolean;
  readOnly?: boolean;
  itemCount: number;
  image?: Image;
  imageLoading?: boolean;
  hideImagePlaceholder?: boolean;
  showImageMenuAction?: boolean;
  menuItems?: EntityMenuAction[];
  onImagePress: () => void;
  onLayout?: (layout: RowLayout) => void;
  onDragStart?: () => void;
  onDragMove?: (offset: DragOffset) => void;
  onDragEnd?: () => void;
};
