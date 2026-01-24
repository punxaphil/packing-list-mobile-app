import { ActivityIndicator, LayoutRectangle, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { buildSections, SectionGroup } from "./itemsSectionHelpers.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { CategorySection } from "./CategorySection.tsx";
import { buildCategoryColors } from "./listColors.ts";
import { useDragState, DragSnapshot } from "./useDragState.ts";
import { useItemOrdering } from "./itemOrdering.ts";
import { FadeScrollView } from "../shared/FadeScrollView.tsx";

type ItemsListProps = {
  loading: boolean;
  hasItems: boolean;
  items: PackItem[];
  categories: NamedEntity[];
  members: NamedEntity[];
  memberImages: Image[];
  lists: NamedEntity[];
  currentListId: string;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => Promise<PackItem>;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
  onAssignMembers: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
  onToggleMemberPacked: (item: PackItem, memberId: string) => void;
  onToggleAllMembers: (item: PackItem, checked: boolean) => void;
  onMoveCategory: (item: PackItem, categoryId: string) => void;
  onCopyToList: (item: PackItem, listId: string) => Promise<void>;
};

type RenderItemsProps = {
  sections: SectionGroup[];
  hasItems: boolean;
  colors: Record<string, string>;
  members: NamedEntity[];
  memberImages: Image[];
  categories: NamedEntity[];
  lists: NamedEntity[];
  currentListId: string;
  drag: ReturnType<typeof useDragState>;
  onDrop: (snapshot: DragSnapshot, layouts: Record<string, LayoutRectangle>, sectionLayouts: Record<string, LayoutRectangle>, bodyLayouts: Record<string, LayoutRectangle>) => void;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => Promise<PackItem>;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
  onAssignMembers: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
  onToggleMemberPacked: (item: PackItem, memberId: string) => void;
  onToggleAllMembers: (item: PackItem, checked: boolean) => void;
  onMoveCategory: (item: PackItem, categoryId: string) => void;
  onCopyToList: (item: PackItem, listId: string) => Promise<void>;
};

export const ItemsList = (props: ItemsListProps) => {
  if (props.loading) return <ItemsLoader />;
  const drag = useDragState();
  const ordering = useItemOrdering(props.items);
  const sections = buildSections(ordering.items, props.categories).filter((section) => section.items.length);
  const colors = buildCategoryColors(sections.map((section) => section.category));
  return renderItems({
    sections,
    hasItems: props.hasItems,
    colors,
    members: props.members,
    memberImages: props.memberImages,
    categories: props.categories,
    lists: props.lists,
    currentListId: props.currentListId,
    drag,
    onDrop: ordering.drop,
    onToggle: props.onToggle,
    onRenameItem: props.onRenameItem,
    onDeleteItem: props.onDeleteItem,
    onAddItem: props.onAddItem,
    onRenameCategory: props.onRenameCategory,
    onToggleCategory: props.onToggleCategory,
    onAssignMembers: props.onAssignMembers,
    onToggleMemberPacked: props.onToggleMemberPacked,
    onToggleAllMembers: props.onToggleAllMembers,
    onMoveCategory: props.onMoveCategory,
    onCopyToList: props.onCopyToList,
  });
};

const renderItems = ({ sections, hasItems, colors, members, memberImages, categories, lists, currentListId, drag, onDrop, onToggle, onRenameItem, onDeleteItem, onAddItem, onRenameCategory, onToggleCategory, onAssignMembers, onToggleMemberPacked, onToggleAllMembers, onMoveCategory, onCopyToList }: RenderItemsProps) => (
  <FadeScrollView style={homeStyles.scroll}>
    <View style={homeStyles.list}>
      {!hasItems && <EmptyItems />}
      {sections.map((section, index) => (
        <CategorySection
          key={section.category.id || `uncategorized-${index}`}
          section={section}
          color={section.category.color ?? colors[section.category.id]}
          members={members}
          memberImages={memberImages}
          categories={categories}
          lists={lists}
          currentListId={currentListId}
          drag={drag}
          onDrop={onDrop}
          onToggle={onToggle}
          onRenameItem={onRenameItem}
          onDeleteItem={onDeleteItem}
          onAddItem={onAddItem}
          onRenameCategory={onRenameCategory}
          onToggleCategory={onToggleCategory}
          onAssignMembers={onAssignMembers}
          onToggleMemberPacked={onToggleMemberPacked}
          onToggleAllMembers={onToggleAllMembers}
          onMoveCategory={onMoveCategory}
          onCopyToList={onCopyToList}
        />
      ))}
    </View>
  </FadeScrollView>
);

const EmptyItems = () => (
  <View style={homeStyles.empty}>
    <Text style={homeStyles.emptyText}>{HOME_COPY.emptyItems}</Text>
  </View>
);

const ItemsLoader = () => (
  <View style={homeStyles.loading}>
    <ActivityIndicator size="small" />
    <Text style={homeStyles.loadingText}>{HOME_COPY.itemsLoading}</Text>
  </View>
);
