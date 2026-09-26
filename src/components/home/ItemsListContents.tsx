import { orderEntityLayouts } from "../shared/orderEntityLayouts.ts";
import { CategorySection } from "./CategorySection.tsx";
import { homeCopy } from "./copy.ts";
import type { ItemsListProps } from "./ItemsList.tsx";
import { EmptyItems, FilteredEmpty, NotesBanner } from "./ItemsListExtras.tsx";
import type { useItemOrdering } from "./itemOrdering.ts";
import type { buildSections } from "./itemsSectionHelpers.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import type { useDragState } from "./useDragState.ts";
import type { useItemsListNavigation } from "./useItemsListNavigation.ts";
import "./itemsList.css";

type ContentsProps = {
  props: ItemsListProps;
  sections: ReturnType<typeof buildSections>;
  columnCount: number;
  colors: Record<string, string>;
  drag: ReturnType<typeof useDragState>;
  highlightId: ReturnType<typeof useItemsListNavigation>["highlightId"];
  highlightOpacity: ReturnType<typeof useItemsListNavigation>["highlightOpacity"];
  onDrop: ReturnType<typeof useItemOrdering>["drop"];
};

export const ItemsListContents = ({
  props,
  sections,
  columnCount,
  colors,
  drag,
  highlightId,
  highlightOpacity,
  onDrop,
}: ContentsProps) => {
  const layouts = { ...drag.layouts };
  for (const section of sections) {
    Object.assign(
      layouts,
      orderEntityLayouts(
        section.items.map((item) => item.id),
        drag.layouts,
        homeSpacing.xs
      )
    );
  }
  return (
    <div
      className="items-list"
      style={
        {
          gap: homeSpacing.xs,
          paddingTop: homeSpacing.xs,
          "--items-muted": homeColors.muted,
          "--items-border": homeColors.border,
          "--items-surface": homeColors.surface,
          "--items-text": homeColors.text,
          "--items-notes-bg": homeColors.primaryLight,
          "--items-notes-text": homeColors.primaryForeground,
        } as React.CSSProperties
      }
    >
      {props.notes ? <NotesBanner notes={props.notes} onPress={props.onNotesPress} /> : null}
      {!props.hasItems && <EmptyItems onBrowseKits={props.onBrowseKits} onAddKit={props.onAddKit} />}
      {props.filteredEmpty && <FilteredEmpty />}
      {sections.map((section, index) => (
        <CategorySection
          key={section.category.id || `uncategorized-${index}`}
          {...props}
          section={section}
          columnCount={columnCount}
          color={colors[section.category.id]}
          initialsMap={props.memberInitials}
          drag={drag}
          layouts={layouts}
          highlightId={highlightId}
          highlightOpacity={highlightOpacity}
          onDrop={onDrop}
          onAddItem={props.onOpenAddDialog}
        />
      ))}
      {props.hasItems && (
        <div className="items-list-changes">
          <button type="button" onClick={props.onShowChanges}>
            {homeCopy.listChanges}
          </button>
        </div>
      )}
    </div>
  );
};
