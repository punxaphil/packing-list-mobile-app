import { LayoutChangeEvent, LayoutRectangle, Pressable, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DragOffset, useDraggableRow } from "../home/useDraggableRow.tsx";
import { categoryStyles, CATEGORY_COPY } from "./styles.ts";
import { CategoryActions } from "./categorySectionState.ts";

const DRAG_HANDLE_ICON = "≡";

type CategoryCardProps = {
  category: NamedEntity;
  actions: CategoryActions;
  hidden?: boolean;
  onLayout?: (layout: LayoutRectangle) => void;
  onDragStart?: () => void;
  onDragMove?: (offset: DragOffset) => void;
  onDragEnd?: () => void;
  onSelect: (id: string) => void;
};

export const CategoryCard = (props: CategoryCardProps) => {
  const { wrap } = useDraggableRow({ onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd }, { applyTranslation: false });
  const handleLayout = (event: LayoutChangeEvent) => props.onLayout?.(event.nativeEvent.layout);
  return (
    <View onLayout={handleLayout}>
      <Pressable
        style={[categoryStyles.card, props.hidden ? { opacity: 0 } : null]}
        onPress={() => props.onSelect(props.category.id)}
        accessibilityRole="button"
        accessibilityLabel={props.category.name}
      >
        <View style={categoryStyles.cardInner}>
          {wrap(<DragHandle />)}
          <View style={categoryStyles.cardBody}>
            <Text style={categoryStyles.cardName}>{props.category.name}</Text>
          </View>
          <DeleteButton onDelete={() => props.actions.onDelete(props.category)} />
        </View>
      </Pressable>
    </View>
  );
};

const DragHandle = () => (
  <View style={categoryStyles.dragHandle}>
    <Text style={categoryStyles.dragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
  </View>
);

const DeleteButton = ({ onDelete }: { onDelete: () => Promise<void> }) => (
  <Pressable style={categoryStyles.deleteButton} onPress={() => void onDelete()} accessibilityRole="button" accessibilityLabel={CATEGORY_COPY.delete}>
    <Text style={categoryStyles.deleteIcon}>{CATEGORY_COPY.deleteIcon}</Text>
  </Pressable>
);

export const CategoryCardPreview = ({ category }: { category: NamedEntity }) => (
  <View style={[categoryStyles.card, { flex: 1 }]}>
    <View style={categoryStyles.cardInner}>
      <View style={categoryStyles.dragHandle}>
        <Text style={categoryStyles.dragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
      </View>
      <View style={categoryStyles.cardBody}>
        <Text style={categoryStyles.cardName}>{category.name}</Text>
      </View>
      <View style={categoryStyles.deleteButton}>
        <Text style={categoryStyles.deleteIcon}>{CATEGORY_COPY.deleteIcon}</Text>
      </View>
    </View>
  </View>
);
