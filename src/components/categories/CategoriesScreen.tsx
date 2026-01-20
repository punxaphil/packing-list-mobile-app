import { useCallback, useState } from "react";
import { LayoutRectangle, Pressable, Switch, Text, View } from "react-native";
import { useCategories } from "~/hooks/useCategories.ts";
import { useCategoryItemCounts } from "~/hooks/useCategoryItemCounts.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { HomeHeader } from "../home/HomeHeader.tsx";
import { homeColors } from "../home/theme.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { useDragState } from "../home/useDragState.ts";
import { useCategoryOrdering } from "./categoryOrdering";
import { useCategoryActions } from "./categorySectionState.ts";
import { CategoryScroll } from "./CategoryScroll.tsx";
import { MoveCategoryItemsModal } from "./MoveCategoryItemsModal.tsx";
import { categoryStyles, CATEGORY_COPY } from "./styles.ts";

type CategoriesScreenProps = {
  userId: string;
  email: string;
  onProfile: () => void;
};

export const CategoriesScreen = ({ userId, email, onProfile }: CategoriesScreenProps) => {
  const { categories } = useCategories(userId);
  const { counts: itemCounts, refresh: refreshCounts } = useCategoryItemCounts();
  const [moveCategory, setMoveCategory] = useState<NamedEntity | null>(null);
  const actions = useCategoryActions(categories, itemCounts, setMoveCategory);
  const creation = useCreateCategoryDialog(actions.onAdd);
  const drag = useDragState();
  const ordering = useCategoryOrdering(categories);
  const [sortByAlpha, setSortByAlpha] = useState(false);
  const sortedCategories = sortByAlpha ? [...ordering.categories].sort((a, b) => a.name.localeCompare(b.name)) : ordering.categories;

  return (
    <View style={categoryStyles.container}>
      <View style={categoryStyles.panel}>
        <HomeHeader title={CATEGORY_COPY.header} email={email} onProfile={onProfile} />
        <CategoryHeader onAdd={creation.open} sortByAlpha={sortByAlpha} onToggleSort={() => setSortByAlpha(!sortByAlpha)} />
        <CategoryScroll categories={sortedCategories} actions={actions} drag={drag} onDrop={ordering.drop} dragEnabled={!sortByAlpha} itemCounts={itemCounts} />
        <TextPromptDialog
          visible={creation.visible}
          title={CATEGORY_COPY.createPrompt}
          confirmLabel={CATEGORY_COPY.createConfirm}
          value={creation.value}
          placeholder={CATEGORY_COPY.createPlaceholder}
          onChange={creation.setValue}
          onCancel={creation.close}
          onSubmit={creation.submit}
        />
        {moveCategory && (
          <MoveCategoryItemsModal
            visible={true}
            sourceCategory={moveCategory}
            categories={categories}
            onClose={() => setMoveCategory(null)}
            onMoved={refreshCounts}
          />
        )}
      </View>
    </View>
  );
};

type CategoryHeaderProps = { onAdd: () => void; sortByAlpha: boolean; onToggleSort: () => void };

const CategoryHeader = ({ onAdd, sortByAlpha, onToggleSort }: CategoryHeaderProps) => (
  <View style={categoryStyles.actions}>
    <View style={categoryStyles.sortToggle}>
      <Text style={categoryStyles.sortLabel}>{sortByAlpha ? "A-Z" : "Rank"}</Text>
      <Switch value={sortByAlpha} onValueChange={onToggleSort} trackColor={{ true: homeColors.primary, false: homeColors.border }} />
    </View>
    <View style={categoryStyles.spacer} />
    <Pressable style={categoryStyles.actionButton} onPress={onAdd} accessibilityRole="button" accessibilityLabel={CATEGORY_COPY.createCategory}>
      <Text style={categoryStyles.actionLabel}>{CATEGORY_COPY.createCategory}</Text>
    </Pressable>
  </View>
);

const useCreateCategoryDialog = (create: (name: string) => Promise<void>) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const open = useCallback(() => { setValue(""); setVisible(true); }, []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    void create(trimmed);
    close();
  }, [value, create, close]);
  return { visible, value, setValue, open, close, submit } as const;
};
