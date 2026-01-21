import { Alert, Image as RNImage, LayoutChangeEvent, LayoutRectangle, Pressable, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { EditableText } from "../home/EditableText.tsx";
import { DragOffset, useDraggableRow } from "../home/useDraggableRow.tsx";
import { entityStyles, EntityCopy } from "./entityStyles.ts";

const DRAG_HANDLE_ICON = "≡";
const UPLOAD_ICON = "⬆";

export type EntityActions = {
  onAdd: (name: string) => Promise<void>;
  onDelete: (entity: NamedEntity) => Promise<void>;
  onRename: (entity: NamedEntity, name: string) => Promise<void>;
};

type EntityCardProps = {
  entity: NamedEntity;
  actions: EntityActions;
  copy: EntityCopy;
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

export const EntityCard = (props: EntityCardProps) => {
  const { wrap } = useDraggableRow({ onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd }, { applyTranslation: false });
  const handleLayout = (event: LayoutChangeEvent) => props.onLayout?.(event.nativeEvent.layout);
  const handleRename = (name: string) => props.actions.onRename(props.entity, name);
  return (
    <View onLayout={handleLayout}>
      <Pressable style={[entityStyles.card, props.hidden ? { opacity: 0 } : null]} accessibilityRole="button" accessibilityLabel={props.entity.name}>
        <View style={entityStyles.cardInner}>
          {wrap(<DragHandle disabled={!props.dragEnabled} />)}
          <EntityImage imageUrl={props.image?.url} onPress={props.onImagePress} copy={props.copy} />
          <View style={entityStyles.cardBody}>
            <EditableText value={props.entity.name} onSubmit={handleRename} textStyle={entityStyles.cardName} />
          </View>
          <Text style={entityStyles.itemCount}>{props.itemCount}</Text>
          <DeleteButton onDelete={() => props.actions.onDelete(props.entity)} copy={props.copy} />
        </View>
      </Pressable>
    </View>
  );
};

type EntityImageProps = { imageUrl?: string; onPress: () => void; copy: EntityCopy };

const EntityImage = ({ imageUrl, onPress, copy }: EntityImageProps) => (
  <Pressable style={[entityStyles.imageContainer, !imageUrl && entityStyles.imagePlaceholder]} onPress={onPress} accessibilityRole="button" accessibilityLabel={copy.imageTitle}>
    {imageUrl ? <RNImage source={{ uri: imageUrl }} style={entityStyles.image} /> : <Text style={entityStyles.uploadIcon}>{UPLOAD_ICON}</Text>}
  </Pressable>
);

export const showImageActionSheet = (copy: EntityCopy, onReplace: () => void, onRemove: () => void) => {
  Alert.alert(copy.imageTitle, undefined, [
    { text: copy.imageReplace, onPress: onReplace },
    { text: copy.imageRemove, onPress: onRemove, style: "destructive" },
    { text: copy.cancel, style: "cancel" },
  ]);
};

const DragHandle = ({ disabled }: { disabled?: boolean }) => (
  <View style={entityStyles.dragHandle}>
    <Text style={[entityStyles.dragHandleIcon, disabled && entityStyles.dragHandleDisabled]}>{DRAG_HANDLE_ICON}</Text>
  </View>
);

const DeleteButton = ({ onDelete, copy }: { onDelete: () => Promise<void>; copy: EntityCopy }) => (
  <Pressable style={entityStyles.deleteButton} onPress={() => void onDelete()} accessibilityRole="button" accessibilityLabel={copy.delete}>
    <Text style={entityStyles.deleteIcon}>{copy.deleteIcon}</Text>
  </Pressable>
);

const DELETE_ICON = "×";

export const EntityCardPreview = ({ entity }: { entity: NamedEntity }) => (
  <View style={[entityStyles.card, { flex: 1 }]}>
    <View style={entityStyles.cardInner}>
      <View style={entityStyles.dragHandle}>
        <Text style={entityStyles.dragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
      </View>
      <View style={entityStyles.cardBody}>
        <Text style={entityStyles.cardName}>{entity.name}</Text>
      </View>
      <View style={entityStyles.deleteButton}>
        <Text style={entityStyles.deleteIcon}>{DELETE_ICON}</Text>
      </View>
    </View>
  </View>
);
