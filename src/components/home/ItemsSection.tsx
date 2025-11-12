import { useCallback } from "react";
import { Dimensions, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { PackItem } from "~/types/PackItem.ts";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { HomeHeader } from "./HomeHeader.tsx";
import { writeDb } from "~/services/database.ts";
import { ItemsList } from "./ItemsList.tsx";
const CLEAR_DELAY = 120;
const SWIPE_THRESHOLD = Math.round(Dimensions.get("window").width * 0.5);

const useItemToggle = () =>
  useCallback((item: PackItem) => {
    void writeDb.updatePackItem({ ...item, checked: !item.checked });
  }, []);

export const ItemsSection = (props: ItemsSectionProps) => {
  const toggleItem = useItemToggle();
  const { selection } = props;
  if (!selection.selectedList) return null;
  return renderSwipeable({
    ...props,
    title: selection.selectedList.name ?? HOME_COPY.detailHeader,
    onToggle: toggleItem,
  });
};

const renderSwipeable = ({ title, selection, categoriesState, itemsState, email, onSignOut, onToggle }: ItemsSectionProps & { title: string; onToggle: (item: PackItem) => void }) => (
  <View style={homeStyles.swipeWrapper}>
    <Swipeable containerStyle={homeStyles.swipeContainer} childrenContainerStyle={homeStyles.swipeContainer} renderLeftActions={LeftAction} leftThreshold={SWIPE_THRESHOLD} overshootLeft={false} onSwipeableLeftOpen={() => scheduleClear(selection.clear)}>
      {renderPanel({ title, selection, categoriesState, itemsState, email, onSignOut, onToggle })}
    </Swipeable>
  </View>
);

const LeftAction = () => <View style={homeStyles.swipeAction} />;
const renderPanel = ({ title, selection, categoriesState, itemsState, email, onSignOut, onToggle }: ItemsSectionProps & { title: string; onToggle: (item: PackItem) => void }) => (
  <View style={homeStyles.panel}>
    <HomeHeader title={title} email={email} onSignOut={onSignOut} onBack={selection.clear} />
    <ItemsList
      loading={categoriesState.loading || itemsState.loading}
      hasItems={itemsState.hasItems}
      items={itemsState.items}
      categories={categoriesState.categories}
      onToggle={onToggle}
    />
  </View>
);
const scheduleClear = (clear: () => void) => setTimeout(clear, CLEAR_DELAY);
