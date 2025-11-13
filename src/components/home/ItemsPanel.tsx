import type { Dispatch, SetStateAction } from "react";
import { Animated, Dimensions, Pressable, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { HomeHeader } from "./HomeHeader.tsx";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { ItemsList } from "./ItemsList.tsx";

const CLEAR_DELAY = 120;
const SWIPE_THRESHOLD = Math.round(Dimensions.get("window").width * 0.5);

export type TextDialogState = {
    visible: boolean;
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    open: () => void;
    close: () => void;
    submit: () => void;
};

export type ListHandlers = {
    onToggle: (item: PackItem) => void;
    onRenameItem: (item: PackItem, name: string) => void;
    onDeleteItem: (id: string) => void;
    onAddItem: (category: NamedEntity) => Promise<PackItem>;
    onRenameCategory: (category: NamedEntity, name: string) => void;
    onToggleCategory: (items: PackItem[], checked: boolean) => void;
};

type ItemsPanelProps = ItemsSectionProps &
    ListHandlers & {
        list: NamedEntity;
        displayName: string;
        renameDialog: TextDialogState;
        quickAddDialog: TextDialogState;
        fade: { opacity: Animated.Value };
    };

export const ItemsPanel = (props: ItemsPanelProps) => (
    <Animated.View style={[homeStyles.swipeWrapper, props.fade]}>
        <Swipeable
            containerStyle={homeStyles.swipeContainer}
            childrenContainerStyle={homeStyles.swipeContainer}
            renderLeftActions={LeftAction}
            leftThreshold={SWIPE_THRESHOLD}
            overshootLeft={false}
            onSwipeableLeftOpen={() => scheduleClear(props.selection.clear)}
        >
            <PanelCard {...props} />
        </Swipeable>
    </Animated.View>
);

const PanelCard = (props: ItemsPanelProps) => (
    <View style={homeStyles.panel}>
        <HeaderRow {...props} />
        <QuickAddRow dialog={props.quickAddDialog} />
        <RenameDialog dialog={props.renameDialog} />
        <QuickAddDialog dialog={props.quickAddDialog} />
        <ItemsListView {...props} />
    </View>
);

const HeaderRow = ({ displayName, email, onSignOut, selection, renameDialog }: ItemsPanelProps) => (
    <HomeHeader title={displayName} email={email} onSignOut={onSignOut} onBack={selection.clear} onPressTitle={renameDialog.open} />
);

const QuickAddRow = ({ dialog }: { dialog: TextDialogState }) => (
    <Pressable style={homeStyles.quickAdd} onPress={dialog.open} accessibilityRole="button" accessibilityLabel={HOME_COPY.addItemQuick} hitSlop={8}>
        <Text style={homeStyles.quickAddLabel}>{HOME_COPY.addItemQuick}</Text>
    </Pressable>
);

const RenameDialog = ({ dialog }: { dialog: TextDialogState }) => (
    <TextPromptDialog visible={dialog.visible} title={HOME_COPY.renameListPrompt} confirmLabel={HOME_COPY.renameListConfirm} value={dialog.value} onChange={dialog.setValue} onCancel={dialog.close} onSubmit={dialog.submit} />
);

const QuickAddDialog = ({ dialog }: { dialog: TextDialogState }) => (
    <TextPromptDialog
        visible={dialog.visible}
        title={HOME_COPY.addItemPrompt}
        confirmLabel={HOME_COPY.addItemConfirm}
        value={dialog.value}
        placeholder={HOME_COPY.addItemPlaceholder}
        onChange={dialog.setValue}
        onCancel={dialog.close}
        onSubmit={dialog.submit}
    />
);

const ItemsListView = ({ categoriesState, itemsState, onToggle, onRenameItem, onDeleteItem, onAddItem, onRenameCategory, onToggleCategory }: ItemsPanelProps) => (
    <ItemsList loading={categoriesState.loading || itemsState.loading} hasItems={itemsState.hasItems} items={itemsState.items} categories={categoriesState.categories} onToggle={onToggle} onRenameItem={onRenameItem} onDeleteItem={onDeleteItem} onAddItem={onAddItem} onRenameCategory={onRenameCategory} onToggleCategory={onToggleCategory} />
);

const LeftAction = () => <View style={homeStyles.swipeAction} />;
const scheduleClear = (clear: () => void) => setTimeout(clear, CLEAR_DELAY);
