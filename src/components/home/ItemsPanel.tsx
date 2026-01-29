import { View } from "react-native";
import { useTemplate } from "~/providers/TemplateContext.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { AddItemDialog } from "./AddItemDialog.tsx";
import { HomeHeader } from "./HomeHeader.tsx";
import { ItemsList } from "./ItemsList.tsx";
import { QuickAddRow } from "./QuickAddRow.tsx";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { ItemsSectionProps } from "./types.ts";
import type { FilterDialogState } from "./useFilterDialog.ts";
import type { SearchState } from "./useSearch.ts";

export type TextDialogState = {
  visible: boolean;
  value: string;
  error?: string | null;
  setValue: (text: string) => void;
  open: () => void;
  close: () => void;
  submit: () => void;
};

export type AddItemDialogState = {
  visible: boolean;
  open: () => void;
  close: () => void;
  submit: (itemName: string, category: NamedEntity | null, newCategoryName: string | null) => void;
};

export type ListHandlers = {
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
  onSortCategoryAlpha: (items: PackItem[]) => Promise<void>;
};

type ItemsPanelProps = ItemsSectionProps &
  ListHandlers & {
    list: NamedEntity;
    displayName: string;
    renameDialog: TextDialogState;
    addItemDialog: AddItemDialogState;
    filterDialog: FilterDialogState;
    search: SearchState;
  };

export const ItemsPanel = (props: ItemsPanelProps) => (
  <View style={homeStyles.swipeWrapper}>
    <PanelCard {...props} />
  </View>
);

const PanelCard = (props: ItemsPanelProps) => (
  <View style={homeStyles.panel}>
    <HeaderRow {...props} />
    <QuickAddRow addDialog={props.addItemDialog} filterDialog={props.filterDialog} search={props.search} />
    <RenameDialog dialog={props.renameDialog} />
    <AddItemDialogView {...props} />
    <ItemsListView {...props} />
  </View>
);

const HeaderRow = ({ displayName, email, renameDialog, onProfile }: ItemsPanelProps) => (
  <HomeHeader title={displayName} email={email} onPressTitle={renameDialog.open} onProfile={onProfile} />
);

const RenameDialog = ({ dialog }: { dialog: TextDialogState }) => (
  <TextPromptDialog
    visible={dialog.visible}
    title={HOME_COPY.renameListPrompt}
    confirmLabel={HOME_COPY.renameListConfirm}
    value={dialog.value}
    error={dialog.error}
    onChange={dialog.setValue}
    onCancel={dialog.close}
    onSubmit={dialog.submit}
  />
);

const AddItemDialogView = ({ addItemDialog, categoriesState, itemsState }: ItemsPanelProps) => (
  <AddItemDialog
    visible={addItemDialog.visible}
    categories={categoriesState.categories}
    items={itemsState.items}
    onCancel={addItemDialog.close}
    onSubmit={addItemDialog.submit}
  />
);

const ItemsListView = ({
  categoriesState,
  itemsState,
  membersState,
  imagesState,
  lists,
  selection,
  search,
  onToggle,
  onRenameItem,
  onDeleteItem,
  onAddItem,
  onRenameCategory,
  onToggleCategory,
  onAssignMembers,
  onToggleMemberPacked,
  onToggleAllMembers,
  onMoveCategory,
  onCopyToList,
  onSortCategoryAlpha,
}: ItemsPanelProps) => {
  const memberImages = imagesState.images.filter((img) => img.type === "members");
  const categoryImages = imagesState.images.filter((img) => img.type === "categories");
  const { isTemplateList } = useTemplate();
  const isTemplate = isTemplateList(selection.selectedId);
  return (
    <ItemsList
      loading={categoriesState.loading || itemsState.loading}
      hasItems={itemsState.hasItems}
      items={itemsState.items}
      categories={categoriesState.categories}
      members={membersState.members}
      memberImages={memberImages}
      categoryImages={categoryImages}
      memberInitials={membersState.memberInitials}
      lists={lists}
      currentListId={selection.selectedId}
      isTemplateList={isTemplate}
      search={search}
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
      onSortCategoryAlpha={onSortCategoryAlpha}
    />
  );
};
