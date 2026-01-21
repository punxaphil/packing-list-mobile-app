import { Alert, Image as RNImage, LayoutChangeEvent, LayoutRectangle, Pressable, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { EditableText } from "../home/EditableText.tsx";
import { DragOffset, useDraggableRow } from "../home/useDraggableRow.tsx";
import { categoryStyles, CATEGORY_COPY } from "./styles.ts";
import { CategoryActions } from "./categorySectionState.ts";

const DRAG_HANDLE_ICON = "≡";
const UPLOAD_ICON = "⬆";

const IMAGE_COPY = {
  title: "Category Image",
  replace: "Replace Image",
  remove: "Remove Image",
  cancel: "Cancel",
};

type CategoryCardProps = {
  category: NamedEntity;
  actions: CategoryActions;
  hidden?: boolean;
  dragEnabled?: boolean;
  itemCount: number;
  image?: Image;
  onImagePress: () => void;
  onLayout?: (layout: LayoutRectangle) => void;
  onDragStart?: () => void;
  onDragMove?: (offset: DragOffset) => void;
  onDragEnd?: () => void;
};

export const CategoryCard = (props: CategoryCardProps) => {
  const { wrap } = useDraggableRow({ onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd }, { applyTranslation: false });
  const handleLayout = (event: LayoutChangeEvent) => props.onLayout?.(event.nativeEvent.layout);
  const handleRename = (name: string) => props.actions.onRename(props.category, name);
  return (
    <View onLayout={handleLayout}>
      <Pressable style={[categoryStyles.card, props.hidden ? { opacity: 0 } : null]} accessibilityRole="button" accessibilityLabel={props.category.name}>
        <View style={categoryStyles.cardInner}>
          {wrap(<DragHandle disabled={!props.dragEnabled} />)}
          <CategoryImage imageUrl={props.image?.url} onPress={props.onImagePress} />
          <View style={categoryStyles.cardBody}>
            <EditableText value={props.category.name} onSubmit={handleRename} textStyle={categoryStyles.cardName} />
          </View>
          <Text style={categoryStyles.itemCount}>{props.itemCount}</Text>
          <DeleteButton onDelete={() => props.actions.onDelete(props.category)} />
        </View>
      </Pressable>
    </View>
  );
};

const CategoryImage = ({ imageUrl, onPress }: { imageUrl?: string; onPress: () => void }) => (
  <Pressable style={[categoryStyles.imageContainer, !imageUrl && categoryStyles.imagePlaceholder]} onPress={onPress} accessibilityRole="button" accessibilityLabel={IMAGE_COPY.title}>
    {imageUrl ? (
      <RNImage source={{ uri: imageUrl }} style={categoryStyles.image} />
    ) : (
      <Text style={categoryStyles.uploadIcon}>{UPLOAD_ICON}</Text>
    )}
  </Pressable>
);

export const showImageActionSheet = (onReplace: () => void, onRemove: () => void) => {
  Alert.alert(IMAGE_COPY.title, undefined, [
    { text: IMAGE_COPY.replace, onPress: onReplace },
    { text: IMAGE_COPY.remove, onPress: onRemove, style: "destructive" },
    { text: IMAGE_COPY.cancel, style: "cancel" },
  ]);
};

const DragHandle = ({ disabled }: { disabled?: boolean }) => (
  <View style={categoryStyles.dragHandle}>
    <Text style={[categoryStyles.dragHandleIcon, disabled && categoryStyles.dragHandleDisabled]}>{DRAG_HANDLE_ICON}</Text>
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
