import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { useCategories } from "~/hooks/useCategories.ts";
import { useCategoryItemCounts } from "~/hooks/useCategoryItemCounts.ts";
import { useImages } from "~/hooks/useImages.ts";
import { writeDb } from "~/services/database.ts";
import { getProfileImage } from "~/services/utils.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { HomeHeader } from "../home/HomeHeader.tsx";
import { buildCategoryColors } from "../home/listColors.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { homeColors } from "../home/theme.ts";
import { useDragState } from "../home/useDragState.ts";
import { EntityScroll } from "../shared/EntityScroll.tsx";
import { CATEGORY_COPY, entityStyles } from "../shared/entityStyles.ts";
import { ImageViewerModal } from "../shared/ImageViewerModal.tsx";
import { useCreateEntityDialog } from "../shared/useCreateEntityDialog.ts";
import { useEntityActions } from "../shared/useEntityActions.ts";
import { useEntityImageActions } from "../shared/useEntityImageActions.ts";
import { computeEntityDropIndex, useEntityOrdering } from "../shared/useEntityOrdering.ts";
import { MoveCategoryItemsModal } from "./MoveCategoryItemsModal.tsx";

type CategoriesScreenProps = { userId: string; email: string; onProfile: () => void };

const categoryDb = {
  add: writeDb.addCategory,
  update: (c: NamedEntity) => writeDb.updateCategories(c),
  delete: writeDb.deleteCategory,
};

const imageDb = {
  add: writeDb.addImage,
  update: writeDb.updateImage,
  delete: writeDb.deleteImage,
};

export const CategoriesScreen = ({ userId, email, onProfile }: CategoriesScreenProps) => {
  const { categories } = useCategories(userId);
  const { images } = useImages(userId);
  const { counts: itemCounts, refresh: refreshCounts } = useCategoryItemCounts();
  const [moveCategory, setMoveCategory] = useState<NamedEntity | null>(null);
  const actions = useEntityActions(categories, itemCounts, CATEGORY_COPY, categoryDb, setMoveCategory);
  const creation = useCreateEntityDialog(actions.onAdd, categories, CATEGORY_COPY.type);
  const drag = useDragState();
  const ordering = useEntityOrdering(categories, writeDb.updateCategories);
  const [sortByAlpha, setSortByAlpha] = useState(false);
  const sorted = sortByAlpha ? [...ordering.entities].sort((a, b) => a.name.localeCompare(b.name)) : ordering.entities;
  const colors = buildCategoryColors(categories);
  const categoryImages = images.filter((img) => img.type === "categories");
  const imageActions = useEntityImageActions("categories", imageDb);

  return (
    <View style={entityStyles.container}>
      <View style={entityStyles.panel}>
        <HomeHeader
          title={CATEGORY_COPY.header}
          email={email}
          profileImageUrl={getProfileImage(images)?.url}
          onProfile={onProfile}
        />
        <CategoryHeader
          onAdd={creation.open}
          sortByAlpha={sortByAlpha}
          onToggleSort={() => setSortByAlpha(!sortByAlpha)}
        />
        <EntityScroll
          entities={sorted}
          actions={actions}
          copy={CATEGORY_COPY}
          colors={colors}
          drag={drag}
          onDrop={ordering.drop}
          computeDropIndex={computeEntityDropIndex}
          dragEnabled={!sortByAlpha}
          itemCounts={itemCounts}
          images={categoryImages}
          onImagePress={imageActions.handleImagePress}
          imageLoading={imageActions.loadingEntityId}
        />
        <TextPromptDialog
          visible={creation.visible}
          title={CATEGORY_COPY.createPrompt}
          confirmLabel={CATEGORY_COPY.createConfirm}
          value={creation.value}
          placeholder={CATEGORY_COPY.createPlaceholder}
          error={creation.error}
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
        {imageActions.viewerState && (
          <ImageViewerModal
            visible={true}
            imageUrl={imageActions.viewerState.image.url}
            onClose={imageActions.closeViewer}
            onReplace={imageActions.handleReplace}
            onRemove={imageActions.handleRemove}
          />
        )}
      </View>
    </View>
  );
};

type CategoryHeaderProps = { onAdd: () => void; sortByAlpha: boolean; onToggleSort: () => void };

const CategoryHeader = ({ onAdd, sortByAlpha, onToggleSort }: CategoryHeaderProps) => (
  <View style={entityStyles.actions}>
    <Pressable
      style={entityStyles.addLink}
      onPress={onAdd}
      accessibilityRole="button"
      accessibilityLabel={CATEGORY_COPY.addButton}
      hitSlop={8}
    >
      <Text style={entityStyles.addLinkLabel}>Add category...</Text>
    </Pressable>
    <View style={entityStyles.spacer} />
    <View style={entityStyles.sortToggle}>
      <Text style={entityStyles.sortLabel}>{sortByAlpha ? "A-Z" : "Rank"}</Text>
      <Switch
        value={sortByAlpha}
        onValueChange={onToggleSort}
        trackColor={{ true: homeColors.primary, false: homeColors.border }}
      />
    </View>
  </View>
);
