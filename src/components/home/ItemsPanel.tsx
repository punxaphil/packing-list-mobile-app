import { KeyboardAvoidingView, Platform, View } from "react-native";
import { PackingKit } from "~/data/packingKits.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
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
  getError?: (text: string) => string | null;
  setValue: (text: string) => void;
  open: () => void;
  close: () => void;
  submitText: (text: string) => void;
  submit: () => void;
};

export type AddItemDialogState = {
  visible: boolean;
  initialCategory?: NamedEntity;
  open: (initialCategory?: NamedEntity) => void;
  close: () => void;
  submit: (
    itemName: string,
    category: NamedEntity | null,
    newCategoryName: string | null,
    keepOpen: boolean
  ) => Promise<NamedEntity>;
  onBrowseKits: () => void;
  kitPickerVisible: boolean;
  closeKitPicker: () => void;
  addKits: (kits: PackingKit[]) => Promise<void>;
};

export type ListHandlers = {
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
  onAssignMembers: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
  onToggleMemberPacked: (item: PackItem, memberId: string) => void;
  onToggleAllMembers: (item: PackItem, checked: boolean) => void;
  onMoveCategory: (item: PackItem, categoryId: string) => void;
  onMoveItemsToCategory: (items: PackItem[], categoryId: string) => Promise<void>;
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
    <KeyboardAvoidingView style={homeStyles.panelBody} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <QuickAddRow addDialog={props.addItemDialog} filterDialog={props.filterDialog} search={props.search} />
      <ItemsListView {...props} />
    </KeyboardAvoidingView>
    <RenameDialog dialog={props.renameDialog} />
    <AddItemDialogView {...props} />
  </View>
);

const HeaderRow = ({ displayName, email, renameDialog, onProfile }: ItemsPanelProps) => {
  const { profile } = useSpace();
  return (
    <HomeHeader
      title={displayName}
      email={email}
      profileImageUrl={profile?.imageUrl}
      onPressTitle={renameDialog.open}
      onProfile={onProfile}
    />
  );
};

const RenameDialog = ({ dialog }: { dialog: TextDialogState }) => (
  <TextPromptDialog
    visible={dialog.visible}
    title={HOME_COPY.renameListPrompt}
    confirmLabel={HOME_COPY.renameListConfirm}
    value={dialog.value}
    error={dialog.error}
    getError={dialog.getError}
    onChange={dialog.setValue}
    onCancel={dialog.close}
    onSubmitText={dialog.submitText}
    onSubmit={dialog.submit}
  />
);

const AddItemDialogView = ({ addItemDialog, categoriesState, itemsState, imagesState }: ItemsPanelProps) => (
  <AddItemDialog
    visible={addItemDialog.visible}
    initialCategory={addItemDialog.initialCategory}
    categories={categoriesState.categories}
    categoryImages={imagesState.images.filter((img) => img.type === "categories")}
    items={itemsState.items}
    onCancel={addItemDialog.close}
    onSubmit={addItemDialog.submit}
    onBrowseKits={addItemDialog.onBrowseKits}
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
  addItemDialog,
  onToggle,
  onRenameItem,
  onDeleteItem,
  onRenameCategory,
  onToggleCategory,
  onAssignMembers,
  onToggleMemberPacked,
  onToggleAllMembers,
  onMoveCategory,
  onMoveItemsToCategory,
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
      filteredEmpty={itemsState.filteredEmpty === true}
      items={itemsState.items}
      categories={categoriesState.categories}
      members={membersState.members}
      memberImages={memberImages}
      categoryImages={categoryImages}
      memberInitials={membersState.memberInitials}
      memberNames={membersState.memberNames}
      lists={lists}
      currentListId={selection.selectedId}
      isTemplateList={isTemplate}
      search={search}
      onToggle={onToggle}
      onRenameItem={onRenameItem}
      onDeleteItem={onDeleteItem}
      onOpenAddDialog={addItemDialog.open}
      onRenameCategory={onRenameCategory}
      onToggleCategory={onToggleCategory}
      onAssignMembers={onAssignMembers}
      onToggleMemberPacked={onToggleMemberPacked}
      onToggleAllMembers={onToggleAllMembers}
      onMoveCategory={onMoveCategory}
      onMoveItemsToCategory={onMoveItemsToCategory}
      onCopyToList={onCopyToList}
      onSortCategoryAlpha={onSortCategoryAlpha}
      onBrowseKits={addItemDialog.onBrowseKits}
      onAddKit={addItemDialog.addKits}
    />
  );
};
