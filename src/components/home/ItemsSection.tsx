import { ActivityIndicator, Text, View } from "react-native";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";

export const ItemsSection = ({ selection, itemsState }: ItemsSectionProps) => (
  <View style={homeStyles.detailContainer}>
    <Text style={homeStyles.detailHeader}>
      {selection.selectedList?.name ?? HOME_COPY.detailHeader}
    </Text>
    <ItemsContent {...itemsState} />
  </View>
);

const ItemsContent = ({
  items,
  loading,
  hasItems,
}: ItemsSectionProps["itemsState"]) => {
  if (loading) return <ItemsLoader />;
  if (!hasItems) return <EmptyItems />;
  return <ItemsList items={items} />;
};

const ItemsList = ({
  items,
}: {
  items: ItemsSectionProps["itemsState"]["items"];
}) => (
  <View style={homeStyles.list}>
    {items.map((item) => (
      <ItemRow key={item.id} name={item.name} />
    ))}
  </View>
);

const ItemRow = ({ name }: { name: string }) => (
  <Text style={homeStyles.detailItem}>{`• ${name}`}</Text>
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
