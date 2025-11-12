import { ActivityIndicator, Dimensions, ScrollView, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { buildSections, SectionGroup } from "./itemsSectionHelpers.ts";
import { HomeHeader } from "./HomeHeader.tsx";
type CategorySectionProps = SectionGroup;
type ItemsBodyProps = { loading: boolean; hasItems: boolean; items: PackItem[]; categories: NamedEntity[] };
const SWIPE_THRESHOLD = Math.round(Dimensions.get("window").width * 0.5), CLEAR_DELAY = 120;

export const ItemsSection = ({
  selection,
  categoriesState,
  itemsState,
  email,
  onSignOut,
}: ItemsSectionProps) => {
  if (!selection.selectedList) return null;
  return renderSwipeable({
    title: selection.selectedList.name ?? HOME_COPY.detailHeader,
    selection,
    categoriesState,
    itemsState,
    email,
    onSignOut,
  });
};

const renderSwipeable = ({
  title,
  selection,
  categoriesState,
  itemsState,
  email,
  onSignOut,
}: ItemsSectionProps & { title: string }) => (
  <View style={homeStyles.swipeWrapper}>
    <Swipeable
      containerStyle={homeStyles.swipeContainer}
      childrenContainerStyle={homeStyles.swipeContainer}
      renderLeftActions={LeftAction}
      leftThreshold={SWIPE_THRESHOLD}
      overshootLeft={false}
      onSwipeableLeftOpen={() => scheduleClear(selection.clear)}
    >
      {renderPanel({ title, selection, categoriesState, itemsState, email, onSignOut })}
    </Swipeable>
  </View>
);

const LeftAction = () => <View style={homeStyles.swipeAction} />;
const renderPanel = ({ title, selection, categoriesState, itemsState, email, onSignOut }: ItemsSectionProps & { title: string }) => (
  <View style={homeStyles.panel}>
    <HomeHeader title={title} email={email} onSignOut={onSignOut} onBack={selection.clear} />
    <ItemsBody
      loading={categoriesState.loading || itemsState.loading}
      hasItems={itemsState.hasItems}
      items={itemsState.items}
      categories={categoriesState.categories}
    />
  </View>
);
const ItemsBody = ({ loading, hasItems, items, categories }: ItemsBodyProps) => {
  if (loading) return <ItemsLoader />;
  if (!hasItems) return <EmptyItems />;
  return (
    <ScrollView style={homeStyles.scroll} showsVerticalScrollIndicator={false}>
      <View style={homeStyles.list}>
        {buildSections(items, categories).map((section) => (
          <CategorySection key={section.category.id || "uncategorized"} {...section} />
        ))}
      </View>
    </ScrollView>
  );
};
const CategorySection = ({ category, items }: CategorySectionProps) => (
  <View style={homeStyles.list}>
    <Text style={homeStyles.sectionTitle}>{category.name}</Text>
    {items.map((item) => (
      <ItemRow key={item.id} name={item.name} />
    ))}
  </View>
);
const ItemRow = ({ name }: { name: string }) => (
  <Text style={homeStyles.detailItem}>{`• ${name}`}</Text>
);
const scheduleClear = (clear: () => void) => setTimeout(clear, CLEAR_DELAY);
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
