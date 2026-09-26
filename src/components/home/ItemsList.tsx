import { useEffect } from "react";
import type { PackingKit } from "~/data/packingKits.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { FadeScrollView, FadeScrollViewRef } from "../shared/FadeScrollView.tsx";
import { useRevisitOrderedColors } from "../shared/useRevisitOrderedColors.ts";
import { ItemsListContents } from "./ItemsListContents.tsx";
import { useItemOrdering } from "./itemOrdering.ts";
import { buildSections, getItemColumnCount } from "./itemsSectionHelpers.ts";
import { buildItemCategoryColors } from "./listColors.ts";
import { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import { homeStyles } from "./styles.ts";
import { useDragState } from "./useDragState.ts";
import { useItemsListNavigation } from "./useItemsListNavigation.ts";
import type { SearchState } from "./useSearch.ts";
import { useViewportWidth } from "./useViewportWidth.ts";

export type ItemsListProps = {
  loading: boolean;
  hasItems: boolean;
  filteredEmpty: boolean;
  items: PackItem[];
  allItems: PackItem[];
  categories: NamedEntity[];
  members: NamedEntity[];
  memberImages: Image[];
  categoryImages: Image[];
  itemImages: Image[];
  memberInitials: MemberInitialsMap;
  memberNames: MemberNamesMap;
  lists: NamedEntity[];
  currentListId: string;
  isTemplateList: boolean;
  search: SearchState;
  notes?: string;
  onNotesPress?: () => void;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onOpenAddDialog: (category: NamedEntity) => void;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
  onAssignMembers: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
  onToggleMemberPacked: (item: PackItem, memberId: string) => void;
  onToggleAllMembers: (item: PackItem, checked: boolean) => void;
  onMoveCategory: (item: PackItem, categoryId: string) => void;
  onMoveItemsToCategory: (items: PackItem[], categoryId: string) => Promise<void>;
  onCopyToList: (item: PackItem, listId: string) => Promise<void>;
  onSortCategoryAlpha: (items: PackItem[]) => Promise<void>;
  onItemImagePress: (item: PackItem) => void;
  onBrowseKits: () => void;
  onAddKit: (kits: PackingKit[]) => Promise<void>;
  onShowChanges: () => void;
};

export const ItemsList = (props: ItemsListProps) => {
  const { profile } = useSpace();
  const columnCount = getItemColumnCount(useViewportWidth(), profile?.forceSingleColumn ?? false);
  const drag = useDragState();
  useEffect(() => {
    if (columnCount > 1 && drag.snapshot) drag.end();
  }, [columnCount, drag.snapshot, drag.end]);
  const ordering = useItemOrdering(props.items);
  const sections = buildSections(ordering.items, props.categories, profile?.checkedItemsLast ?? false).filter(
    (section) => section.items.length
  );
  const colors = useRevisitOrderedColors(
    sections.map((s) => s.category),
    buildItemCategoryColors
  );
  const { highlightId, highlightOpacity } = useItemsListNavigation(props.items, props.search, drag);

  return (
    <FadeScrollView
      ref={props.search.scrollRef as React.RefObject<FadeScrollViewRef>}
      style={homeStyles.scroll}
      scrollEnabled={!drag.snapshot}
      drag={drag}
    >
      <ItemsListContents
        props={props}
        sections={sections}
        columnCount={columnCount}
        colors={colors}
        drag={drag}
        highlightId={highlightId}
        highlightOpacity={highlightOpacity}
        onDrop={ordering.drop}
      />
    </FadeScrollView>
  );
};
