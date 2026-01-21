import { Animated, LayoutRectangle, ScrollView, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DragOffset } from "../home/useDraggableRow.tsx";
import { DragSnapshot, useDragState } from "../home/useDragState.ts";
import { CategoryCard, CategoryCardPreview } from "./CategoryCard.tsx";
import { computeCategoryDropIndex } from "./categoryOrdering";
import { CategoryActions } from "./categorySectionState.ts";
import { categoryStyles } from "./styles.ts";

type CategoryScrollProps = {
  categories: NamedEntity[];
  actions: CategoryActions;
  drag: ReturnType<typeof useDragState>;
  onDrop: (snapshot: DragSnapshot, layouts: Record<string, LayoutRectangle>) => void;
  dragEnabled?: boolean;
  itemCounts: Record<string, number>;
  images: Image[];
  onImagePress: (categoryId: string, image?: Image) => void;
};

export const CategoryScroll = ({ categories, actions, drag, onDrop, dragEnabled = true, itemCounts, images, onImagePress }: CategoryScrollProps) => {
  const categoryIds = categories.map((c) => c.id);
  const dropIndex = dragEnabled ? computeCategoryDropIndex(categoryIds, drag.snapshot, drag.layouts) : null;
  const originalIndex = drag.snapshot ? categoryIds.indexOf(drag.snapshot.id) : -1;
  const wouldMove = dropIndex !== null && dropIndex !== originalIndex;
  const showBelow = wouldMove && (drag.snapshot?.offsetY ?? 0) > 0;

  return (
    <ScrollView style={categoryStyles.scroll} showsVerticalScrollIndicator={false}>
      <View style={[categoryStyles.list, categoryStyles.relative]}>
        {categories.map((category) => {
          const image = images.find((img) => img.typeId === category.id);
          return (
            <CategoryCard
              key={category.id}
              category={category}
              actions={actions}
              hidden={drag.snapshot?.id === category.id}
              dragEnabled={dragEnabled}
              itemCount={itemCounts[category.id] ?? 0}
              image={image}
              onImagePress={() => onImagePress(category.id, image)}
              onLayout={(layout: LayoutRectangle) => drag.recordLayout(category.id, layout)}
              onDragStart={dragEnabled ? () => drag.start(category.id, "") : undefined}
              onDragMove={dragEnabled ? (offset: DragOffset) => drag.move(category.id, offset) : undefined}
              onDragEnd={dragEnabled ? () => drag.end((snapshot) => snapshot && onDrop(snapshot, drag.layouts)) : undefined}
            />
          );
        })}
        {dragEnabled && <DropIndicator dropIndex={dropIndex} categories={categories} layouts={drag.layouts} below={showBelow} />}
        {dragEnabled && <GhostRow categories={categories} drag={drag.snapshot} layouts={drag.layouts} />}
      </View>
    </ScrollView>
  );
};

type GhostProps = {
  categories: NamedEntity[];
  drag: DragSnapshot;
  layouts: Record<string, LayoutRectangle>;
};

const GhostRow = ({ categories, drag, layouts }: GhostProps) => {
  if (!drag) return null;
  const layout = layouts[drag.id];
  if (!layout) return null;
  const category = categories.find((c) => c.id === drag.id);
  if (!category) return null;
  return (
    <Animated.View pointerEvents="none" style={[categoryStyles.ghost, { top: layout.y + drag.offsetY, height: layout.height, width: layout.width }]}>
      <CategoryCardPreview category={category} />
    </Animated.View>
  );
};

type DropIndicatorProps = {
  dropIndex: number | null;
  categories: NamedEntity[];
  layouts: Record<string, LayoutRectangle>;
  below: boolean;
};

const DropIndicator = ({ dropIndex, categories, layouts, below }: DropIndicatorProps) => {
  if (dropIndex === null) return null;
  const targetId = categories[dropIndex]?.id;
  if (!targetId) return null;
  const layout = layouts[targetId];
  if (!layout) return null;
  const top = below ? layout.y + layout.height - 2 : layout.y - 2;
  return <View style={[categoryStyles.indicator, { top }]} />;
};