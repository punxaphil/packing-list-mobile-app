import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { buildSections, SectionGroup } from "./itemsSectionHelpers.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { CategorySection } from "./CategorySection.tsx";

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
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => Promise<PackItem>;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
};

const FALLBACK_TOKENS = ["blue.50", "green.50", "purple.50", "orange.50", "red.50"] as const;
const COLOR_TOKENS: Record<string, string> = {
  "blue.50": "#eff6ff",
  "green.50": "#ecfdf5",
  "purple.50": "#f5f3ff",
  "orange.50": "#fff7ed",
  "red.50": "#fef2f2",
  "gray.50": "#f9fafb",
};

export const ItemsList = (props: ItemsListProps) => {
  if (props.loading) return <ItemsLoader />;
  const sections = buildSections(props.items, props.categories).filter((section) => section.items.length);
  return renderItems({
    sections,
    hasItems: props.hasItems,
    onToggle: props.onToggle,
    onRenameItem: props.onRenameItem,
    onDeleteItem: props.onDeleteItem,
    onAddItem: props.onAddItem,
    onRenameCategory: props.onRenameCategory,
    onToggleCategory: props.onToggleCategory,
  });
};

const resolveColor = (token: string) => COLOR_TOKENS[token] ?? token;
const sectionColor = (category: NamedEntity, index: number) =>
  resolveColor(category.color ?? FALLBACK_TOKENS[index % FALLBACK_TOKENS.length]);

const renderItems = ({ sections, hasItems, onToggle, onRenameItem, onDeleteItem, onAddItem, onRenameCategory, onToggleCategory }: RenderItemsProps) => (
  <ScrollView style={homeStyles.scroll} showsVerticalScrollIndicator={false}>
    <View style={homeStyles.list}>
      {!hasItems && <EmptyItems />}
      {sections.map((section, index) => (
        <CategorySection
          key={section.category.id || `uncategorized-${index}`}
          section={section}
          color={sectionColor(section.category, index)}
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
