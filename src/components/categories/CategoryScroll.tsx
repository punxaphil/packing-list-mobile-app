import { Animated, LayoutRectangle, ScrollView, View } from "react-native";
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
};

export const CategoryScroll = ({ categories, actions, drag, onDrop }: CategoryScrollProps) => {
  const categoryIds = categories.map((c) => c.id);
  const dropIndex = computeCategoryDropIndex(categoryIds, drag.snapshot, drag.layouts);
  const originalIndex = drag.snapshot ? categoryIds.indexOf(drag.snapshot.id) : -1;
  const wouldMove = dropIndex !== null && dropIndex !== originalIndex;
  const showBelow = wouldMove && (drag.snapshot?.offsetY ?? 0) > 0;

  return (
    <ScrollView style={categoryStyles.scroll} showsVerticalScrollIndicator={false}>
      <View style={[categoryStyles.list, categoryStyles.relative]}>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            actions={actions}
            hidden={drag.snapshot?.id === category.id}
            onLayout={(layout: LayoutRectangle) => drag.recordLayout(category.id, layout)}
            onDragStart={() => drag.start(category.id, "")}
            onDragMove={(offset: DragOffset) => drag.move(category.id, offset)}
            onDragEnd={() => drag.end((snapshot) => snapshot && onDrop(snapshot, drag.layouts))}
            onSelect={() => {}}
          />
        ))}
        <DropIndicator dropIndex={dropIndex} categories={categories} layouts={drag.layouts} below={showBelow} />
        <GhostRow categories={categories} drag={drag.snapshot} layouts={drag.layouts} />
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