import { useCallback, useState } from "react";
import { LayoutRectangle, Pressable, Text, View } from "react-native";
import { useCategories } from "~/hooks/useCategories.ts";
import { HomeHeader } from "../home/HomeHeader.tsx";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { useDragState } from "../home/useDragState.ts";
import { useCategoryOrdering } from "./categoryOrdering";
import { useCategoryActions } from "./categorySectionState.ts";
import { CategoryScroll } from "./CategoryScroll.tsx";
import { categoryStyles, CATEGORY_COPY } from "./styles.ts";

type CategoriesScreenProps = {
  userId: string;
  email: string;
  onProfile: () => void;
};

export const CategoriesScreen = ({ userId, email, onProfile }: CategoriesScreenProps) => {
  const { categories } = useCategories(userId);
  const actions = useCategoryActions(categories);
  const creation = useCreateCategoryDialog(actions.onAdd);
  const drag = useDragState();
  const ordering = useCategoryOrdering(categories);

  return (
    <View style={categoryStyles.container}>
      <View style={categoryStyles.panel}>
        <HomeHeader title={CATEGORY_COPY.header} email={email} onProfile={onProfile} />
        <CategoryHeader onAdd={creation.open} />
        <CategoryScroll categories={ordering.categories} actions={actions} drag={drag} onDrop={ordering.drop} />
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
      </View>
    </View>
  );
};

const CategoryHeader = ({ onAdd }: { onAdd: () => void }) => (
  <View style={categoryStyles.actions}>
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
