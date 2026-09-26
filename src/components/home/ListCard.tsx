import type { Image } from "~/types/Image.ts";
import type { Space } from "~/types/Space.ts";
import { createListCardMenu } from "./createListCardMenu.ts";
import { DragHandle, ListImage, ListMenuButton, PinButton } from "./ListCardControls.tsx";
import { formatListSummary, ListCardText } from "./ListCardDetails.tsx";
import { listCardTheme } from "./listCardTheme.ts";
import { listCopy } from "./listCopy.ts";
import type { ListActions } from "./listSectionState.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { homeColors } from "./theme.ts";
import type { PackingListSummary } from "./types.ts";
import { type DragOffset, useDraggableRow } from "./useDraggableRow.tsx";
import { useListRenameDialog } from "./useListRenameDialog.ts";
import "./listCard.css";

export { ListCardPreview } from "./ListCardPreview.tsx";

export type ListCardProps = {
  list: PackingListSummary;
  lists: PackingListSummary[];
  isSelected: boolean;
  actions: ListActions;
  color: string;
  spaces: Space[];
  currentSpaceId: string;
  onMoveToSpace: (listId: string, targetSpaceId: string) => void;
  image?: Image;
  imageLoading?: boolean;
  hideImagePlaceholder?: boolean;
  showImageMenuAction?: boolean;
  onImagePress: (listId: string, image?: Image) => void;
  hidden?: boolean;
  onDragStart?: () => void;
  onDragMove?: (offset: DragOffset) => void;
  onDragEnd?: () => void;
  onSelect: (id: string) => void;
};

export const ListCard = (props: ListCardProps) => {
  const { wrap } = useDraggableRow(
    {
      onStart: props.onDragStart,
      onMove: props.onDragMove,
      onEnd: props.onDragEnd,
    },
    { applyTranslation: false }
  );
  const rename = useListRenameDialog(props.list, props.lists, props.actions.onRename);
  const summary = formatListSummary(props.list);
  const isTemplate = props.list.isTemplate === true;
  const isArchived = props.list.archived === true;
  const openMenu = createListCardMenu(props, rename.open);
  return (
    <div>
      <div
        className={`list-card${props.isSelected ? " list-card-selected" : ""}`}
        style={{
          ...listCardTheme,
          backgroundColor: isArchived ? homeColors.border : props.color,
          opacity: props.hidden ? 0 : isArchived ? 0.7 : 1,
        }}
      >
        <div className="list-card-inner">
          {!isTemplate && wrap(<DragHandle />)}
          <ListImage
            imageUrl={props.image?.url}
            loading={props.imageLoading}
            hidePlaceholder={props.hideImagePlaceholder}
            onPress={() => props.onImagePress(props.list.id, props.image)}
          />
          <button
            type="button"
            className="list-card-select"
            onClick={() => props.onSelect(props.list.id)}
            aria-label={props.list.name}
            title={summary}
          >
            <ListCardText list={props.list} summary={summary} />
          </button>
          {props.list.pinned && <PinButton onPress={() => void props.actions.onUnpin(props.list)} />}
          <ListMenuButton onPress={openMenu} />
        </div>
      </div>
      <TextPromptDialog
        visible={rename.visible}
        title={listCopy.renameList}
        confirmLabel={listCopy.renameConfirm}
        value={rename.value}
        error={rename.error}
        getError={rename.getError}
        onChange={rename.setValue}
        onCancel={rename.close}
        onSubmitText={rename.submitText}
        onSubmit={rename.submit}
      />
    </div>
  );
};
