import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { buildSections, SectionGroup } from "./itemsSectionHelpers.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { CategorySection } from "./CategorySection.tsx";
import { buildCategoryColors } from "./listColors.ts";

type ItemsListProps = {
  loading: boolean;
  hasItems: boolean;
  items: PackItem[];
  categories: NamedEntity[];
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => Promise<PackItem>;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
};

type RenderItemsProps = {
  sections: SectionGroup[];
  hasItems: boolean;
  colors: Record<string, string>;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => Promise<PackItem>;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
};

export const ItemsList = (props: ItemsListProps) => {
  if (props.loading) return <ItemsLoader />;
  const sections = buildSections(props.items, props.categories).filter((section) => section.items.length);
  const colors = buildCategoryColors(sections.map((section) => section.category));
  return renderItems({
    sections,
    hasItems: props.hasItems,
    colors,
    onToggle: props.onToggle,
    onRenameItem: props.onRenameItem,
    onDeleteItem: props.onDeleteItem,
    onAddItem: props.onAddItem,
    onRenameCategory: props.onRenameCategory,
    onToggleCategory: props.onToggleCategory,
  });
};

const renderItems = ({ sections, hasItems, colors, onToggle, onRenameItem, onDeleteItem, onAddItem, onRenameCategory, onToggleCategory }: RenderItemsProps) => (
  <ScrollView style={homeStyles.scroll} showsVerticalScrollIndicator={false}>
    <View style={homeStyles.list}>
      {!hasItems && <EmptyItems />}
      {sections.map((section, index) => (
        <CategorySection
          key={section.category.id || `uncategorized-${index}`}
          section={section}
          color={section.category.color ?? colors[section.category.id]}
          onToggle={onToggle}
          onRenameItem={onRenameItem}
          onDeleteItem={onDeleteItem}
          onAddItem={onAddItem}
          onRenameCategory={onRenameCategory}
          onToggleCategory={onToggleCategory}
        />
      ))}
    </View>
  </ScrollView>
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
