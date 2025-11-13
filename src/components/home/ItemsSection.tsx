import { useCallback, useRef, useEffect } from "react";
import { Animated, Dimensions, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { HomeHeader } from "./HomeHeader.tsx";
import { writeDb } from "~/services/database.ts";
import { ItemsList } from "./ItemsList.tsx";
import { getNextItemRank } from "./itemsSectionHelpers.ts";
import { animateLayout } from "./layoutAnimation.ts";
const CLEAR_DELAY = 120;
const SWIPE_THRESHOLD = Math.round(Dimensions.get("window").width * 0.5);
const FADE_DURATION = 1000;

const useItemToggle = () => useCallback((item: PackItem) => { animateLayout(); void writeDb.updatePackItem({ ...item, checked: !item.checked }); }, []);
const useItemRename = () => useCallback((item: PackItem, name: string) => { const trimmed = name.trim(); if (!trimmed || trimmed === item.name) return; void writeDb.updatePackItem({ ...item, name: trimmed }); }, []);
const useItemDelete = () => useCallback((id: string) => { animateLayout(); void writeDb.deletePackItem(id); }, []);
const useItemAdder = (items: PackItem[], packingListId?: string | null) => useCallback(async (category: NamedEntity) => {
  if (!packingListId) throw new Error("Missing packing list");
  animateLayout();
  return await writeDb.addPackItem(HOME_COPY.newItem, [], category.id, packingListId, getNextItemRank(items));
}, [items, packingListId]);
const useCategoryRename = () => useCallback((category: NamedEntity, name: string) => { const trimmed = name.trim(); if (!trimmed || trimmed === category.name) return; void writeDb.updateCategories({ ...category, name: trimmed }); }, []);
const useCategoryToggle = () => useCallback((items: PackItem[], checked: boolean) => { animateLayout(); const updates = items.map((item) => writeDb.updatePackItem({ ...item, checked })); void Promise.all(updates); }, []);

export const ItemsSection = (props: ItemsSectionProps) => {
  const handlers = useItemsSectionHandlers(props);
  const fade = useSelectionFade(props.selection.selectedId);
  const list = props.selection.selectedList;
  if (!list) return null;
  return renderSwipeable({ ...props, title: list.name ?? HOME_COPY.detailHeader, ...handlers, fade });
};
type ListHandlers = { onToggle: (item: PackItem) => void; onRenameItem: (item: PackItem, name: string) => void; onDeleteItem: (id: string) => void; onAddItem: (category: NamedEntity) => Promise<PackItem>; onRenameCategory: (category: NamedEntity, name: string) => void; onToggleCategory: (items: PackItem[], checked: boolean) => void };

const renderSwipeable = ({ title, selection, categoriesState, itemsState, email, onSignOut, fade, ...handlers }: ItemsSectionProps & { title: string; fade: FadeStyle } & ListHandlers) => (
  <Animated.View style={[homeStyles.swipeWrapper, fade]}>
    <Swipeable containerStyle={homeStyles.swipeContainer} childrenContainerStyle={homeStyles.swipeContainer} renderLeftActions={LeftAction} leftThreshold={SWIPE_THRESHOLD} overshootLeft={false} onSwipeableLeftOpen={() => scheduleClear(selection.clear)}>
      {renderPanel({ title, selection, categoriesState, itemsState, email, onSignOut, ...handlers })}
    </Swipeable>
  </Animated.View>
);

const LeftAction = () => <View style={homeStyles.swipeAction} />;
const renderPanel = ({ title, selection, categoriesState, itemsState, email, onSignOut, onToggle, onRenameItem, onDeleteItem, onAddItem, onRenameCategory, onToggleCategory }: ItemsSectionProps & { title: string } & ListHandlers) => (
  <View style={homeStyles.panel}>
    <HomeHeader title={title} email={email} onSignOut={onSignOut} onBack={selection.clear} />
    <ItemsList
      loading={categoriesState.loading || itemsState.loading}
      hasItems={itemsState.hasItems}
      items={itemsState.items}
      categories={categoriesState.categories}
      onToggle={onToggle}
      onRenameItem={onRenameItem}
      onDeleteItem={onDeleteItem}
      onAddItem={onAddItem}
      onRenameCategory={onRenameCategory}
      onToggleCategory={onToggleCategory}
    />
  </View>
);
const scheduleClear = (clear: () => void) => setTimeout(clear, CLEAR_DELAY);

const useItemsSectionHandlers = (props: ItemsSectionProps) => ({
  onToggle: useItemToggle(),
  onRenameItem: useItemRename(),
  onDeleteItem: useItemDelete(),
  onAddItem: useItemAdder(props.itemsState.items, props.selection.selectedList?.id),
  onRenameCategory: useCategoryRename(),
  onToggleCategory: useCategoryToggle(),
});

const useSelectionFade = (selectedId: string) => {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }).start();
  }, [selectedId, opacity]);
  return { opacity } as const;
};

type FadeStyle = ReturnType<typeof useSelectionFade>;
