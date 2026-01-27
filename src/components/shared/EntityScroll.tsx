import { Animated, LayoutRectangle, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DragOffset } from "../home/useDraggableRow.tsx";
import { DragSnapshot, useDragState } from "../home/useDragState.ts";
import { EntityActions, EntityCard, EntityCardPreview } from "./EntityCard.tsx";
import { EntityCopy, entityStyles } from "./entityStyles.ts";
import { FadeScrollView } from "./FadeScrollView.tsx";

type EntityScrollProps = {
  entities: NamedEntity[];
  actions: EntityActions;
  copy: EntityCopy;
  colors: Record<string, string>;
  drag: ReturnType<typeof useDragState>;
  onDrop: (snapshot: DragSnapshot, layouts: Record<string, LayoutRectangle>) => void;
  computeDropIndex: (ids: string[], snapshot: DragSnapshot, layouts: Record<string, LayoutRectangle>) => number | null;
  dragEnabled?: boolean;
  itemCounts: Record<string, number>;
  images: Image[];
  onImagePress: (entityId: string, image?: Image) => void;
};

export const EntityScroll = (props: EntityScrollProps) => {
  const {
    entities,
    actions,
    copy,
    colors,
    drag,
    onDrop,
    computeDropIndex,
    dragEnabled = true,
    itemCounts,
    images,
    onImagePress,
  } = props;
  const ids = entities.map((e) => e.id);
  const dropIndex = dragEnabled ? computeDropIndex(ids, drag.snapshot, drag.layouts) : null;
  const originalIndex = drag.snapshot ? ids.indexOf(drag.snapshot.id) : -1;
  const wouldMove = dropIndex !== null && dropIndex !== originalIndex;
  const showBelow = wouldMove && (drag.snapshot?.offsetY ?? 0) > 0;

  return (
    <FadeScrollView style={entityStyles.scroll}>
      <View style={[entityStyles.list, entityStyles.relative]}>
        {entities.map((entity) => {
          const image = images.find((img) => img.typeId === entity.id);
          return (
            <EntityCard
              key={entity.id}
              entity={entity}
              actions={actions}
              copy={copy}
              color={colors[entity.id]}
              hidden={drag.snapshot?.id === entity.id}
              dragEnabled={dragEnabled}
              itemCount={itemCounts[entity.id] ?? 0}
              image={image}
              onImagePress={() => onImagePress(entity.id, image)}
              onLayout={(layout: LayoutRectangle) => drag.recordLayout(entity.id, layout)}
              onDragStart={dragEnabled ? () => drag.start(entity.id, "") : undefined}
              onDragMove={dragEnabled ? (offset: DragOffset) => drag.move(entity.id, offset) : undefined}
              onDragEnd={
                dragEnabled ? () => drag.end((snapshot) => snapshot && onDrop(snapshot, drag.layouts)) : undefined
              }
            />
          );
        })}
        {dragEnabled && (
          <DropIndicator dropIndex={dropIndex} entities={entities} layouts={drag.layouts} below={showBelow} />
        )}
        {dragEnabled && <GhostRow entities={entities} drag={drag.snapshot} layouts={drag.layouts} />}
      </View>
    </FadeScrollView>
  );
};

type GhostProps = { entities: NamedEntity[]; drag: DragSnapshot; layouts: Record<string, LayoutRectangle> };

const GhostRow = ({ entities, drag, layouts }: GhostProps) => {
  if (!drag) return null;
  const layout = layouts[drag.id];
  if (!layout) return null;
  const entity = entities.find((e) => e.id === drag.id);
  if (!entity) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[entityStyles.ghost, { top: layout.y + drag.offsetY, height: layout.height, width: layout.width }]}
    >
      <EntityCardPreview entity={entity} />
    </Animated.View>
  );
};

type DropIndicatorProps = {
  dropIndex: number | null;
  entities: NamedEntity[];
  layouts: Record<string, LayoutRectangle>;
  below: boolean;
};

const DropIndicator = ({ dropIndex, entities, layouts, below }: DropIndicatorProps) => {
  if (dropIndex === null) return null;
  const targetId = entities[dropIndex]?.id;
  if (!targetId) return null;
  const layout = layouts[targetId];
  if (!layout) return null;
  const top = below ? layout.y + layout.height - 2 : layout.y - 2;
  return <View style={[entityStyles.indicator, { top }]} />;
};
