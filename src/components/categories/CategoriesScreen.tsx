import { useState } from "react";
import { useCategories } from "~/hooks/useCategories.ts";
import { useCategoryItemCounts } from "~/hooks/useCategoryItemCounts.ts";
import { useImages } from "~/hooks/useImages.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { HomeHeader } from "../home/HomeHeader.tsx";
import { buildEntityColors } from "../home/listColors.ts";
import { PanelShell } from "../home/PanelShell.tsx";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { useDragState } from "../home/useDragState.ts";
import { EntityHeader } from "../shared/EntityHeader.tsx";
import { EntityScroll } from "../shared/EntityScroll.tsx";
import { CATEGORY_COPY } from "../shared/entityStyles.ts";
import { ImageViewerModal } from "../shared/ImageViewerModal.tsx";
import { useCreateEntityDialog } from "../shared/useCreateEntityDialog.ts";
import { useEmptyEntityBulkEdit } from "../shared/useEmptyEntityBulkEdit.ts";
import { useEntityActions } from "../shared/useEntityActions.ts";
import { useEntityImageActions } from "../shared/useEntityImageActions.ts";
import { computeEntityDropIndex, useEntityOrdering } from "../shared/useEntityOrdering.ts";
import { useRevisitOrderedColors } from "../shared/useRevisitOrderedColors.ts";
import { MoveCategoryItemsModal } from "./MoveCategoryItemsModal.tsx";

type CategoriesScreenProps = {
  email: string;
  onProfile: () => void;
};

export const CategoriesScreen = ({ email, onProfile }: CategoriesScreenProps) => {
  const { spaceId, writeDb, profile } = useSpace();
  const { categories } = useCategories(spaceId);
  const { images } = useImages(spaceId);
  const { counts: itemCounts } = useCategoryItemCounts();
  const [moveCategory, setMoveCategory] = useState<NamedEntity | null>(null);

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

  const actions = useEntityActions(categories, itemCounts, CATEGORY_COPY, categoryDb, setMoveCategory);
  const bulkEdit = useEmptyEntityBulkEdit({
    entities: categories,
    isEligible: (category) => (itemCounts[category.id] ?? 0) === 0,
    hasItem: (category, item) => item.category === category.id,
    onDelete: (category) => writeDb.deleteCategory(category.id, [], false),
    copy: CATEGORY_COPY,
    menuKey: "category.bulkRemoveEmptyCount",
    confirmKey: "category.bulkConfirm",
  });
  const creation = useCreateEntityDialog(actions.onAdd, categories, CATEGORY_COPY.type);
  const drag = useDragState();
  const ordering = useEntityOrdering(categories, writeDb.updateCategories);
  const [sortByAlpha, setSortByAlpha] = useState(false);
  const sorted = sortByAlpha ? [...ordering.entities].sort((a, b) => a.name.localeCompare(b.name)) : ordering.entities;
  const colors = useRevisitOrderedColors(sorted, buildEntityColors);
  const categoryImages = images.filter((img) => img.type === "categories");
  const imageActions = useEntityImageActions("categories", imageDb);
  const hideImagePlaceholder = profile?.hideImagePlaceholder ?? false;

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <PanelShell>
        <HomeHeader
          title={CATEGORY_COPY.header}
          email={email}
          profileImageUrl={profile?.imageUrl}
          onProfile={onProfile}
        />
        <EntityHeader
          addLabel={CATEGORY_COPY.addButton}
          bulkEditLabel={CATEGORY_COPY.bulkEdit}
          onAdd={creation.open}
          onBulkEdit={bulkEdit.open}
          bulkEditing={bulkEdit.busy}
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
          hideImagePlaceholder={hideImagePlaceholder}
          showImageMenuAction
        />
        <TextPromptDialog
          visible={creation.visible}
          title={CATEGORY_COPY.createPrompt}
          confirmLabel={CATEGORY_COPY.createConfirm}
          value={creation.value}
          error={creation.error}
          getError={creation.getError}
          onChange={creation.setValue}
          onCancel={creation.close}
          onSubmitText={creation.submitText}
          onSubmit={creation.submit}
        />
        {moveCategory && (
          <MoveCategoryItemsModal
            visible={true}
            sourceCategory={moveCategory}
            categories={categories}
            onClose={() => setMoveCategory(null)}
          />
        )}
        {imageActions.viewerState && (
          <ImageViewerModal
            visible={true}
            imageUrl={imageActions.viewerState.image.url}
            title={CATEGORY_COPY.imageTitle}
            connectedLabel={categories.find((category) => category.id === imageActions.viewerState?.entityId)?.name}
            loading={imageActions.modalLoading}
            textValue={imageActions.textValue}
            textSubmitDisabled={!imageActions.textValue.trim()}
            onTextChange={imageActions.setTextValue}
            onTextSubmit={() => void imageActions.submitText()}
            onClose={imageActions.closeViewer}
            onReplace={imageActions.handleReplace}
            onRemove={imageActions.handleRemove}
          />
        )}
      </PanelShell>
    </div>
  );
};
