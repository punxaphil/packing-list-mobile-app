import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { PACKING_KITS, type PackingKit } from "~/data/packingKits.ts";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { FadeScrollView, FadeScrollViewRef } from "../shared/FadeScrollView.tsx";
import { useFlashHighlight } from "../shared/useFlashHighlight.ts";
import { CategorySection } from "./CategorySection.tsx";
import { useItemOrdering } from "./itemOrdering.ts";
import { buildSections } from "./itemsSectionHelpers.ts";
import { buildItemCategoryColors } from "./listColors.ts";
import { MemberInitialsMap, MemberNamesMap } from "./memberInitialsUtils.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import { useDragState } from "./useDragState.ts";
import type { SearchState } from "./useSearch.ts";

const SCROLL_PADDING = 100;
const HIGHLIGHT_DELAY_MS = 300;

type ItemsListProps = {
  loading: boolean;
  hasItems: boolean;
  filteredEmpty: boolean;
  items: PackItem[];
  categories: NamedEntity[];
  members: NamedEntity[];
  memberImages: Image[];
  categoryImages: Image[];
  memberInitials: MemberInitialsMap;
  memberNames: MemberNamesMap;
  lists: NamedEntity[];
  currentListId: string;
  isTemplateList: boolean;
  search: SearchState;
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
  onBrowseKits: () => void;
  onAddKit: (kits: PackingKit[]) => Promise<void>;
};

export const ItemsList = (props: ItemsListProps) => {
  const drag = useDragState();
  const ordering = useItemOrdering(props.items);
  const sections = buildSections(ordering.items, props.categories).filter((s) => s.items.length);
  const colors = buildItemCategoryColors(sections.map((s) => s.category));
  const itemCategoryMap = buildItemCategoryMap(props.items);
  const prevItemIds = useRef(new Set(props.items.map((i) => i.id)));
  const pendingScrollId = useRef<string | null>(null);
  const { highlightId, highlightOpacity, flash } = useFlashHighlight();

  useEffect(() => {
    const currentIds = new Set(props.items.map((i) => i.id));
    const newItem = props.items.find((i) => !prevItemIds.current.has(i.id));
    prevItemIds.current = currentIds;
    if (newItem) pendingScrollId.current = newItem.id;
  }, [props.items]);

  useEffect(() => {
    const id = pendingScrollId.current;
    if (!id) return;
    const categoryId = itemCategoryMap[id];
    if (categoryId === undefined) return;
    const itemLayout = drag.layouts[id];
    const sectionLayout = drag.sectionLayouts[categoryId];
    const bodyLayout = drag.bodyLayouts[categoryId];
    if (!itemLayout || !sectionLayout || !bodyLayout) return;
    pendingScrollId.current = null;
    const absoluteY = sectionLayout.y + bodyLayout.y + itemLayout.y;
    props.search.scrollRef.current?.scrollTo({
      y: Math.max(0, absoluteY - SCROLL_PADDING),
      animated: true,
    });
    setTimeout(() => flash(id), HIGHLIGHT_DELAY_MS);
  }, [drag.layouts, drag.sectionLayouts, drag.bodyLayouts, itemCategoryMap, props.search.scrollRef, flash]);

  useEffect(() => {
    const { currentMatchId, scrollToMatch } = props.search;
    if (!currentMatchId) return;
    const categoryId = itemCategoryMap[currentMatchId];
    if (categoryId === undefined) return;
    scrollToMatch(currentMatchId, categoryId, drag.layouts, drag.sectionLayouts, drag.bodyLayouts);
  }, [props.search, itemCategoryMap, drag.layouts, drag.sectionLayouts, drag.bodyLayouts]);

  return (
    <FadeScrollView
      ref={props.search.scrollRef as React.RefObject<FadeScrollViewRef>}
      style={homeStyles.scroll}
      scrollEnabled={!drag.snapshot}
    >
      <View style={homeStyles.list}>
        {!props.hasItems && <EmptyItems onBrowseKits={props.onBrowseKits} onAddKit={props.onAddKit} />}
        {props.filteredEmpty && <FilteredEmpty />}
        {sections.map((section, i) => (
          <CategorySection
            key={section.category.id || `uncategorized-${i}`}
            section={section}
            color={colors[section.category.id]}
            members={props.members}
            memberImages={props.memberImages}
            categoryImages={props.categoryImages}
            initialsMap={props.memberInitials}
            memberNames={props.memberNames}
            categories={props.categories}
            lists={props.lists}
            currentListId={props.currentListId}
            isTemplateList={props.isTemplateList}
            search={props.search}
            drag={drag}
            highlightId={highlightId}
            highlightOpacity={highlightOpacity}
            onDrop={ordering.drop}
            onToggle={props.onToggle}
            onRenameItem={props.onRenameItem}
            onDeleteItem={props.onDeleteItem}
            onAddItem={props.onOpenAddDialog}
            onRenameCategory={props.onRenameCategory}
            onToggleCategory={props.onToggleCategory}
            onAssignMembers={props.onAssignMembers}
            onToggleMemberPacked={props.onToggleMemberPacked}
            onToggleAllMembers={props.onToggleAllMembers}
            onMoveCategory={props.onMoveCategory}
            onMoveItemsToCategory={props.onMoveItemsToCategory}
            onCopyToList={props.onCopyToList}
            onSortCategoryAlpha={props.onSortCategoryAlpha}
          />
        ))}
      </View>
    </FadeScrollView>
  );
};

const buildItemCategoryMap = (items: PackItem[]): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const item of items) map[item.id] = item.category;
  return map;
};

const EmptyItems = ({
  onBrowseKits,
  onAddKit,
}: {
  onBrowseKits: () => void;
  onAddKit: (kits: PackingKit[]) => Promise<void>;
}) => {
  const [addingKitId, setAddingKitId] = useState<string | null>(null);
  const handleAddKit = useCallback(
    async (kit: PackingKit) => {
      if (addingKitId) return;
      setAddingKitId(kit.id);
      try {
        await onAddKit([kit]);
      } finally {
        setAddingKitId(null);
      }
    },
    [addingKitId, onAddKit]
  );

  return (
    <View style={homeStyles.empty}>
      <Text style={homeStyles.emptyText}>{HOME_COPY.emptyItems}</Text>
      <View style={emptyStyles.kitsSection}>
        <Text style={emptyStyles.kitsTitle}>{EMPTY_COPY.quickStart}</Text>
        <View style={emptyStyles.kitsList}>
          {PACKING_KITS.map((kit) => (
            <Pressable
              key={kit.id}
              style={[emptyStyles.kitChip, addingKitId ? emptyStyles.kitChipDisabled : null]}
              onPress={() => void handleAddKit(kit)}
              disabled={addingKitId !== null}
            >
              <MaterialCommunityIcons name={kit.icon} size={18} color={homeColors.primary} />
              <View style={emptyStyles.kitChipContent}>
                <Text style={emptyStyles.kitChipText}>{kit.name}</Text>
                <Text style={emptyStyles.kitChipCount}>
                  {EMPTY_COPY.itemCount.replace("{count}", String(kit.items.length))}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={onBrowseKits} disabled={addingKitId !== null}>
          <Text style={emptyStyles.browseLink}>{EMPTY_COPY.browseKits}</Text>
        </Pressable>
      </View>
    </View>
  );
};
const FilteredEmpty = () => (
  <View style={homeStyles.empty}>
    <Text style={homeStyles.emptyText}>{FILTERED_COPY.noMatch}</Text>
  </View>
);

const FILTERED_COPY = { noMatch: "No items match the current filters." };

const EMPTY_COPY = {
  quickStart: "Quick start with a Packing Kit:",
  browseKits: "Browse Packing Kits",
  itemCount: "{count} items",
};

const emptyStyles = StyleSheet.create({
  kitsSection: {
    marginTop: homeSpacing.md,
    alignItems: "center",
    gap: homeSpacing.sm,
  },
  kitsTitle: { fontSize: 14, color: homeColors.muted },
  kitsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: homeSpacing.xs,
  },
  kitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: homeSpacing.xs,
    paddingHorizontal: homeSpacing.md,
    paddingVertical: homeSpacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: homeColors.border,
    backgroundColor: homeColors.surface,
  },
  kitChipContent: {
    alignItems: "flex-start",
  },
  kitChipDisabled: { opacity: 0.6 },
  kitChipText: { fontSize: 14, color: homeColors.text },
  kitChipCount: { fontSize: 12, color: homeColors.muted },
  browseLink: {
    fontSize: 14,
    fontWeight: "600",
    color: homeColors.primary,
    marginTop: homeSpacing.xs,
  },
});
