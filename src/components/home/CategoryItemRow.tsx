import i18next from "i18next";
import { type CSSProperties, memo } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getPackItemChecked } from "~/services/packItemState.ts";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { homeCopy } from "./copy.ts";
import { createItemRowMenu } from "./createItemRowMenu.ts";
import { ItemRowDetails } from "./ItemRowDetails.tsx";
import { ItemRowHighlight } from "./ItemRowHighlight.tsx";
import { areRowPropsEqual, type CategoryItemRowProps } from "./itemRowProps.ts";
import { MultiCheckbox } from "./MultiCheckbox.tsx";
import { homeStyles } from "./styles.ts";
import { useToast } from "./Toast.tsx";
import { CHECKBOX_SIZE, homeColors, homeSpacing } from "./theme.ts";
import { useDraggableRow } from "./useDraggableRow.tsx";
import { useMeasuredItemRow } from "./useMeasuredItemRow.ts";

const DRAG_GUIDANCE_DURATION = 5000;

export const DragHandle = () => (
  <span className="item-row-drag mdi mdi-drag-vertical" aria-hidden="true" style={{ color: homeColors.muted }} />
);

export const CategoryItemRow = memo((props: CategoryItemRowProps) => {
  const { profile } = useSpace();
  const { show: showToast } = useToast();
  const rowRef = useMeasuredItemRow(props.onLayout);
  const dragHandlers = { onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd };
  const { wrap, dragging } = useDraggableRow(dragHandlers, { applyTranslation: false });
  const checked = getPackItemChecked(props.item);
  return (
    <div
      ref={rowRef}
      className="item-row"
      style={{
        width: props.columnCount === 1 ? "100%" : props.columnCount === 2 ? "50%" : "33.333%",
        paddingInline: props.columnCount > 1 ? homeSpacing.xs / 2 : 0,
      }}
    >
      <div
        className={`item-row-main${props.isCurrentMatch ? " item-row-match" : ""}`}
        style={
          {
            opacity: props.hidden ? 0 : dragging ? 0.5 : 1,
            backgroundColor: props.isCurrentMatch
              ? homeColors.highlight
              : props.dragDisabled
                ? homeStyles.categoryBody.backgroundColor
                : undefined,
            "--item-highlight": homeColors.highlight,
          } as CSSProperties
        }
      >
        <ItemRowHighlight opacity={props.highlightOpacity} />
        {props.dragDisabled ? (
          <button
            type="button"
            className="item-row-disabled-handle"
            onClick={() => showToast(homeCopy.dragSingleColumnOnly, DRAG_GUIDANCE_DURATION)}
            aria-label={homeCopy.dragSingleColumnOnly}
          >
            <DragHandle />
          </button>
        ) : (
          wrap(<DragHandle />)
        )}
        {props.item.members.length > 0 ? (
          <MultiCheckbox
            item={props.item}
            disabled={props.checkboxDisabled}
            onToggle={props.onToggleAllMembers}
            checkedColor={props.checkboxColor}
            size={CHECKBOX_SIZE}
          />
        ) : (
          <AppCheckbox
            checked={checked}
            label={props.item.name}
            onToggle={() => props.onToggle(props.item)}
            disabled={props.checkboxDisabled}
            size={CHECKBOX_SIZE}
            checkedColor={props.checkboxColor}
          />
        )}
        <ItemRowDetails {...props} checked={checked} wrapItemText={profile?.wrapItemText ?? false} />
        <button
          type="button"
          className="item-row-menu"
          onClick={createItemRowMenu(props)}
          style={{ color: homeColors.muted }}
          aria-label={i18next.t("home.itemMenu")}
          title={i18next.t("home.itemMenu")}
        >
          <span className="mdi mdi-dots-vertical" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}, areRowPropsEqual);
