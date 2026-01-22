import type { Dispatch, SetStateAction } from "react";
import { Pressable, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { HomeHeader } from "./HomeHeader.tsx";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { ItemsList } from "./ItemsList.tsx";
import { AddItemDialog } from "./AddItemDialog.tsx";

export type TextDialogState = {
    visible: boolean;
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
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
};

type ItemsPanelProps = ItemsSectionProps &
    ListHandlers & {
        list: NamedEntity;
        displayName: string;
        renameDialog: TextDialogState;
        addItemDialog: AddItemDialogState;
    };

export const ItemsPanel = (props: ItemsPanelProps) => (
    <View style={homeStyles.swipeWrapper}>
        <PanelCard {...props} />
    </View>
);

const PanelCard = (props: ItemsPanelProps) => (
    <View style={homeStyles.panel}>
        <HeaderRow {...props} />
        <QuickAddRow dialog={props.addItemDialog} />
        <RenameDialog dialog={props.renameDialog} />
        <AddItemDialogView {...props} />
        <ItemsListView {...props} />
    </View>
);

const HeaderRow = ({ displayName, email, renameDialog, onProfile }: ItemsPanelProps) => (
    <HomeHeader title={displayName} email={email} onPressTitle={renameDialog.open} onProfile={onProfile} />
);

const QuickAddRow = ({ dialog }: { dialog: AddItemDialogState }) => (
    <Pressable style={homeStyles.quickAdd} onPress={dialog.open} accessibilityRole="button" accessibilityLabel={HOME_COPY.addItemQuick} hitSlop={8}>
        <Text style={homeStyles.quickAddLabel}>{HOME_COPY.addItemQuick}</Text>
    </Pressable>
);

const RenameDialog = ({ dialog }: { dialog: TextDialogState }) => (
    <TextPromptDialog visible={dialog.visible} title={HOME_COPY.renameListPrompt} confirmLabel={HOME_COPY.renameListConfirm} value={dialog.value} onChange={dialog.setValue} onCancel={dialog.close} onSubmit={dialog.submit} />
);

const AddItemDialogView = ({ addItemDialog, categoriesState }: ItemsPanelProps) => (
    <AddItemDialog
        visible={addItemDialog.visible}
        categories={categoriesState.categories}
        onCancel={addItemDialog.close}
        onSubmit={addItemDialog.submit}
    />
);

const ItemsListView = ({ categoriesState, itemsState, membersState, imagesState, onToggle, onRenameItem, onDeleteItem, onAddItem, onRenameCategory, onToggleCategory, onAssignMembers, onToggleMemberPacked, onToggleAllMembers }: ItemsPanelProps) => {
    const memberImages = imagesState.images.filter((img) => img.type === "members");
    return (
        <ItemsList loading={categoriesState.loading || itemsState.loading} hasItems={itemsState.hasItems} items={itemsState.items} categories={categoriesState.categories} members={membersState.members} memberImages={memberImages} onToggle={onToggle} onRenameItem={onRenameItem} onDeleteItem={onDeleteItem} onAddItem={onAddItem} onRenameCategory={onRenameCategory} onToggleCategory={onToggleCategory} onAssignMembers={onAssignMembers} onToggleMemberPacked={onToggleMemberPacked} onToggleAllMembers={onToggleAllMembers} />
    );
};
