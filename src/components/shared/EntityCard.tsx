import i18next from "i18next";
import type { CSSProperties } from "react";
import { homeCopy } from "../home/copy.ts";
import { ItemRowHighlight } from "../home/ItemRowHighlight.tsx";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { homeColors } from "../home/theme.ts";
import { useDraggableRow } from "../home/useDraggableRow.tsx";
import { useMeasuredItemRow } from "../home/useMeasuredItemRow.ts";
import { createEntityCardMenu } from "./createEntityCardMenu.ts";
import { EntityDragGlyph, EntityMenuGlyph } from "./EntityCardPreview.tsx";
import { EntityImage } from "./EntityImage.tsx";
import type { EntityCardProps } from "./entityCardTypes.ts";
import { useEntityRenameDialog } from "./useEntityRenameDialog.ts";
import "./entityCard.css";

export type { EntityActions, EntityMenuAction } from "./entityCardTypes.ts";

export const EntityCard = (props: EntityCardProps) => {
  const rename = useEntityRenameDialog(props);
  const menu = createEntityCardMenu(props, rename.open);
  const rowRef = useMeasuredItemRow(props.onLayout);
  const { wrap } = useDraggableRow(
    { onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd },
    { applyTranslation: false }
  );
  const count =
    props.itemCount === 0
      ? homeCopy.listNoItems
      : `${props.itemCount} ${props.itemCount === 1 ? homeCopy.itemSingular : homeCopy.itemPlural}`;
  return (
    <div ref={rowRef} className="entry-card-row">
      <div
        className="entity-card"
        style={
          {
            backgroundColor: props.color,
            opacity: props.hidden ? 0 : 1,
            "--item-highlight": homeColors.highlightSubtle,
            "--entity-border": homeColors.border,
            "--entity-primary": homeColors.primary,
            "--entity-text": homeColors.text,
          } as CSSProperties
        }
      >
        <ItemRowHighlight opacity={props.highlightOpacity} />
        <div className="entity-card-inner">
          {props.dragEnabled ? (
            wrap(<EntityDragGlyph />)
          ) : (
            <span className="entity-card-static-drag">
              <EntityDragGlyph />
            </span>
          )}
          <EntityImage
            imageUrl={props.image?.url}
            loading={props.imageLoading}
            hidePlaceholder={props.hideImagePlaceholder}
            disabled={props.readOnly}
            onPress={props.onImagePress}
            copy={props.copy}
          />
          <div className="entity-card-body">
            {props.readOnly ? (
              <span className="entity-card-name">{props.entity.name}</span>
            ) : (
              <button type="button" className="entity-card-name entity-card-rename" onClick={rename.open}>
                {props.entity.name}
              </button>
            )}
            <span className="entity-card-count" style={{ color: homeColors.muted }}>
              {count}
            </span>
          </div>
          <button
            type="button"
            className="entity-card-menu"
            onClick={menu.open}
            disabled={menu.disabled}
            aria-label={i18next.t("common.menu")}
            title={i18next.t("common.menu")}
          >
            <EntityMenuGlyph />
          </button>
        </div>
      </div>
      <TextPromptDialog
        visible={rename.visible}
        title={props.copy.renamePrompt}
        confirmLabel={props.copy.renameConfirm}
        value={rename.value}
        error={rename.getError(rename.value)}
        disabled={!rename.value.trim() || !!rename.getError(rename.value)}
        onChange={rename.setValue}
        onCancel={rename.close}
        onSubmit={rename.submit}
      />
    </div>
  );
};
