import Checkbox from "expo-checkbox";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { buildSections, SectionGroup } from "./itemsSectionHelpers.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors } from "./theme.ts";

type ItemsListProps = {
  loading: boolean;
  hasItems: boolean;
  items: PackItem[];
  categories: NamedEntity[];
  onToggle: (item: PackItem) => void;
};

type CategoryProps = SectionGroup & { onToggle: (item: PackItem) => void };
type RenderItemsProps = Pick<ItemsListProps, "items" | "categories" | "onToggle">;

const CHECK_COLOR = homeColors.primary;

export const ItemsList = (props: ItemsListProps) => {
  if (props.loading) return <ItemsLoader />;
  if (!props.hasItems) return <EmptyItems />;
  return renderItems(props);
};

const renderItems = ({ items, categories, onToggle }: RenderItemsProps) => (
  <ScrollView style={homeStyles.scroll} showsVerticalScrollIndicator={false}>
    <View style={homeStyles.list}>
      {buildSections(items, categories).map((section) => (
        <CategorySection key={section.category.id || "uncategorized"} {...section} onToggle={onToggle} />
      ))}
    </View>
  </ScrollView>
);

const CategorySection = ({ category, items, onToggle }: CategoryProps) => (
  <View style={homeStyles.list}>
    <Text style={homeStyles.sectionTitle}>{category.name}</Text>
    {items.map((item) => (
      <ItemRow key={item.id} item={item} onToggle={onToggle} />
    ))}
  </View>
);

const ItemRow = ({ item, onToggle }: { item: PackItem; onToggle: (item: PackItem) => void }) => {
  const toggle = () => onToggle(item);
  return <CheckboxRow checked={item.checked} label={item.name} onToggle={toggle} />;
};

const CheckboxRow = ({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) => (
  <Pressable style={homeStyles.detailItem} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked }} hitSlop={8}>
    <Checkbox value={checked} onValueChange={onToggle} color={checked ? CHECK_COLOR : undefined} style={homeStyles.checkbox} />
    <Text style={[homeStyles.detailLabel, checked && homeStyles.detailLabelChecked]} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
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
