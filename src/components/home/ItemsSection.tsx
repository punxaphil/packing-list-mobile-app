import { ActivityIndicator, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { ItemsSectionProps } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";

type CategorySectionProps = {
  category: NamedEntity;
  items: PackItem[];
};

export const ItemsSection = ({
  selection,
  categoriesState,
  itemsState,
}: ItemsSectionProps) => {
  const title = selection.selectedList?.name ?? HOME_COPY.detailHeader;
  const loading = categoriesState.loading || itemsState.loading;
  const renderContent = () => {
    if (loading) return <ItemsLoader />;
    if (!itemsState.hasItems) return <EmptyItems />;
    return (
      <View style={homeStyles.list}>
        {buildSections(itemsState.items, categoriesState.categories).map(
          (section) => (
            <CategorySection
              key={section.category.id || "uncategorized"}
              {...section}
            />
          ),
        )}
      </View>
    );
  };
  return (
    <View style={homeStyles.detailContainer}>
      <Text style={homeStyles.detailHeader}>{title}</Text>
      {renderContent()}
    </View>
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

const buildSections = (items: PackItem[], categories: NamedEntity[]) => {
  const grouped = groupItems(orderItems(items));
  return getOrderedCategories(categories, grouped)
    .map((category) => ({
      category,
      items: grouped.get(category.id) ?? [],
    }))
    .filter((section) => section.items.length);
};

const orderItems = (items: PackItem[]) =>
  [...items].sort((first, second) => second.rank - first.rank);

const groupItems = (items: PackItem[]) => {
  const groups = new Map<string, PackItem[]>();
  for (const item of items) {
    const key = item.category || UNCATEGORIZED.id;
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return groups;
};

const getOrderedCategories = (
  categories: NamedEntity[],
  groups: Map<string, PackItem[]>,
) => {
  const sorted = [...categories]
    .filter((category) => category.id && groups.has(category.id))
    .sort((a, b) => b.rank - a.rank);
  return groups.has(UNCATEGORIZED.id) ? [UNCATEGORIZED, ...sorted] : sorted;
};
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
