import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { PACKING_KITS, type PackingKit } from "~/data/packingKits.ts";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import {
  FadeScrollView,
  FadeScrollViewRef,
} from "../shared/FadeScrollView.tsx";
import { CategorySection } from "./CategorySection.tsx";
import { useItemOrdering } from "./itemOrdering.ts";
import { buildSections } from "./itemsSectionHelpers.ts";
import { buildCategoryColors } from "./listColors.ts";
import { MemberInitialsMap } from "./memberInitialsUtils.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import { useDragState } from "./useDragState.ts";
import type { SearchState } from "./useSearch.ts";

type ItemsListProps = {
  loading: boolean;
  hasItems: boolean;
  items: PackItem[];
  categories: NamedEntity[];
  members: NamedEntity[];
  memberImages: Image[];
  categoryImages: Image[];
  memberInitials: MemberInitialsMap;
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
  onCopyToList: (item: PackItem, listId: string) => Promise<void>;
  onSortCategoryAlpha: (items: PackItem[]) => Promise<void>;
  onBrowseKits: () => void;
  onAddKit: (kits: PackingKit[]) => Promise<void>;
};

export const ItemsList = (props: ItemsListProps) => {
  const drag = useDragState();
  const ordering = useItemOrdering(props.items);
  const sections = buildSections(ordering.items, props.categories).filter(
    (s) => s.items.length,
  );
  const colors = buildCategoryColors(sections.map((s) => s.category));
  const itemCategoryMap = buildItemCategoryMap(props.items);

  useEffect(() => {
    const { currentMatchId, scrollToMatch } = props.search;
    if (!currentMatchId) return;
    const categoryId = itemCategoryMap[currentMatchId];
    if (categoryId === undefined) return;
    scrollToMatch(
      currentMatchId,
      categoryId,
      drag.layouts,
      drag.sectionLayouts,
      drag.bodyLayouts,
    );
  }, [
    props.search,
    itemCategoryMap,
    drag.layouts,
    drag.sectionLayouts,
    drag.bodyLayouts,
  ]);

  if (props.loading) return <ItemsLoader />;

  return (
    <FadeScrollView
      ref={props.search.scrollRef as React.RefObject<FadeScrollViewRef>}
      style={homeStyles.scroll}
      scrollEnabled={!drag.snapshot}
    >
      <View style={homeStyles.list}>
        {!props.hasItems && (
          <EmptyItems
            onBrowseKits={props.onBrowseKits}
            onAddKit={props.onAddKit}
          />
        )}
        {sections.map((section, i) => (
          <CategorySection
            key={section.category.id || `uncategorized-${i}`}
            section={section}
            color={section.category.color ?? colors[section.category.id]}
            members={props.members}
            memberImages={props.memberImages}
            categoryImages={props.categoryImages}
            initialsMap={props.memberInitials}
            categories={props.categories}
            lists={props.lists}
            currentListId={props.currentListId}
            isTemplateList={props.isTemplateList}
            search={props.search}
            drag={drag}
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
  const [pendingKit, setPendingKit] = useState<PackingKit | null>(null);
  const handleConfirm = useCallback(async () => {
    if (!pendingKit) return;
    setPendingKit(null);
    await onAddKit([pendingKit]);
  }, [pendingKit, onAddKit]);
  return (
    <View style={homeStyles.empty}>
      <Text style={homeStyles.emptyText}>{HOME_COPY.emptyItems}</Text>
      <View style={emptyStyles.kitsSection}>
        <Text style={emptyStyles.kitsTitle}>{EMPTY_COPY.quickStart}</Text>
        <View style={emptyStyles.kitsList}>
          {PACKING_KITS.map((kit) => (
            <Pressable
              key={kit.id}
              style={emptyStyles.kitChip}
              onPress={() => setPendingKit(kit)}
            >
              <MaterialCommunityIcons
                name={kit.icon}
                size={18}
                color={homeColors.primary}
              />
              <Text style={emptyStyles.kitChipText}>{kit.name}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={onBrowseKits}>
          <Text style={emptyStyles.browseLink}>{EMPTY_COPY.browseKits}</Text>
        </Pressable>
      </View>
      <DialogShell
        visible={!!pendingKit}
        title={EMPTY_COPY.confirmTitle.replace(
          "{name}",
          pendingKit?.name ?? "",
        )}
        onClose={() => setPendingKit(null)}
        actions={
          <DialogActions
            cancelLabel={EMPTY_COPY.cancel}
            confirmLabel={EMPTY_COPY.confirmAdd}
            onCancel={() => setPendingKit(null)}
            onConfirm={handleConfirm}
          />
        }
      >
        <Text style={emptyStyles.confirmText}>
          {EMPTY_COPY.confirmBody.replace(
            "{count}",
            String(pendingKit?.items.length ?? 0),
          )}
        </Text>
      </DialogShell>
    </View>
  );
};
const ItemsLoader = () => (
  <View style={homeStyles.loading}>
    <ActivityIndicator size="small" />
    <Text style={homeStyles.loadingText}>{HOME_COPY.itemsLoading}</Text>
  </View>
);

const EMPTY_COPY = {
  quickStart: "Quick start with a Packing Kit:",
  browseKits: "Browse Packing Kits",
  confirmTitle: "Add {name} items?",
  confirmBody: "This will add {count} items to your list.",
  confirmAdd: "Add",
  cancel: "Cancel",
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
  kitChipText: { fontSize: 14, color: homeColors.text },
  browseLink: {
    fontSize: 14,
    fontWeight: "600",
    color: homeColors.primary,
    marginTop: homeSpacing.xs,
  },
  confirmText: { fontSize: 14, color: homeColors.muted, textAlign: "center" },
});
