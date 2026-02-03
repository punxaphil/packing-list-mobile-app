import { useState } from "react";
import { View } from "react-native";
import { useCategories } from "~/hooks/useCategories.ts";
import { useCategoryItemCounts } from "~/hooks/useCategoryItemCounts.ts";
import { useImages } from "~/hooks/useImages.ts";
import { writeDb } from "~/services/database.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { buildCategoryColors } from "../home/listColors.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { useDragState } from "../home/useDragState.ts";
import { EntityScroll } from "../shared/EntityScroll.tsx";
import { CATEGORY_COPY, entityStyles } from "../shared/entityStyles.ts";
import { FloatingAddButton } from "../shared/FloatingAddButton.tsx";
import { ImageViewerModal } from "../shared/ImageViewerModal.tsx";
import { useCreateEntityDialog } from "../shared/useCreateEntityDialog.ts";
import { useEntityActions } from "../shared/useEntityActions.ts";
import { useEntityImageActions } from "../shared/useEntityImageActions.ts";
import { computeEntityDropIndex, useEntityOrdering } from "../shared/useEntityOrdering.ts";
import { MoveCategoryItemsModal } from "./MoveCategoryItemsModal.tsx";

type CategoriesScreenProps = { userId: string; sortByAlpha: boolean };

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

export const CategoriesScreen = ({ userId, sortByAlpha }: CategoriesScreenProps) => {
  const { categories } = useCategories(userId);
  const { images } = useImages(userId);
  const { counts: itemCounts, refresh: refreshCounts } = useCategoryItemCounts();
  const [moveCategory, setMoveCategory] = useState<NamedEntity | null>(null);
  const actions = useEntityActions(categories, itemCounts, CATEGORY_COPY, categoryDb, setMoveCategory);
  const creation = useCreateEntityDialog(actions.onAdd, categories, CATEGORY_COPY.type);
  const drag = useDragState();
  const ordering = useEntityOrdering(categories, writeDb.updateCategories);
  const sorted = sortByAlpha ? [...ordering.entities].sort((a, b) => a.name.localeCompare(b.name)) : ordering.entities;
  const colors = buildCategoryColors(categories);
  const categoryImages = images.filter((img) => img.type === "categories");
  const imageActions = useEntityImageActions("categories", imageDb);

  return (
    <View style={entityStyles.container}>
      <View style={entityStyles.panelScrollable}>
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
      <FloatingAddButton onPress={creation.open} />
    </View>
  );
};
