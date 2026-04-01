import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  LayoutRectangle,
  Pressable,
  Image as RNImage,
  Text,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { EditableText } from "../home/EditableText.tsx";
import { showActionSheet } from "../home/showActionSheet.ts";
import { useToast } from "../home/Toast.tsx";
import { homeColors } from "../home/theme.ts";
import { DragOffset, useDraggableRow } from "../home/useDraggableRow.tsx";
import { EntityCopy, entityStyles } from "./entityStyles.ts";
import { hasDuplicateEntityName } from "./entityValidation.ts";

const DRAG_HANDLE_ICON = "≡";
const MENU_ICON = "⋮";
const COPY = { duplicateName: "{type} with this name already exists" };

export type EntityActions = {
  onAdd: (name: string) => Promise<void>;
  onDelete: (entity: NamedEntity) => Promise<void>;
  onRename: (entity: NamedEntity, name: string) => Promise<void>;
};

type EntityCardProps = {
  entity: NamedEntity;
  entities: NamedEntity[];
  actions: EntityActions;
  copy: EntityCopy;
  color: string;
  hidden?: boolean;
  highlightOpacity?: Animated.Value;
  dragEnabled?: boolean;
  itemCount: number;
  image?: Image;
  imageLoading?: boolean;
  onImagePress: () => void;
  onLayout?: (layout: LayoutRectangle) => void;
  onDragStart?: () => void;
  onDragMove?: (offset: DragOffset) => void;
  onDragEnd?: () => void;
};

const formatItemCount = (count: number) => {
  if (count === 0) return "No items";
  return `${count} ${count === 1 ? "item" : "items"}`;
};

export const EntityCard = (props: EntityCardProps) => {
  const { wrap } = useDraggableRow(
    {
      onStart: props.onDragStart,
      onMove: props.onDragMove,
      onEnd: props.onDragEnd,
    },
    { applyTranslation: false }
  );
  const showToast = useToast();
  const handleLayout = (event: LayoutChangeEvent) => props.onLayout?.(event.nativeEvent.layout);
  const handleRename = (name: string) => props.actions.onRename(props.entity, name);
  const validateName = (name: string) => !hasDuplicateEntityName(name, props.entities, props.entity.id);
  const onDuplicateName = () => showToast(COPY.duplicateName.replace("{type}", props.copy.type));
  const cardStyle = [entityStyles.card, { backgroundColor: props.color }, props.hidden ? { opacity: 0 } : null];
  const showHighlight = !!props.highlightOpacity;
  const openMenu = () =>
    showActionSheet(props.entity.name, [
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void props.actions.onDelete(props.entity),
      },
    ]);
  return (
    <View onLayout={handleLayout}>
      <Pressable style={cardStyle} accessibilityRole="button" accessibilityLabel={props.entity.name}>
        {showHighlight && (
          <Animated.View
            pointerEvents="none"
            style={[entityStyles.cardHighlight, { opacity: props.highlightOpacity }]}
          />
        )}
        <View style={entityStyles.cardInner}>
          {wrap(<DragHandle disabled={!props.dragEnabled} />)}
          <EntityImage
            imageUrl={props.image?.url}
            loading={props.imageLoading}
            onPress={props.onImagePress}
            copy={props.copy}
          />
          <View style={entityStyles.cardBody}>
            <EditableText
              value={props.entity.name}
              onSubmit={handleRename}
              validate={validateName}
              onValidationFail={onDuplicateName}
              textStyle={entityStyles.cardName}
            />
            <Text style={entityStyles.itemSummary}>{formatItemCount(props.itemCount)}</Text>
          </View>
          <MenuButton onPress={openMenu} />
        </View>
      </Pressable>
    </View>
  );
};

type EntityImageProps = {
  imageUrl?: string;
  loading?: boolean;
  onPress: () => void;
  copy: EntityCopy;
};

const EntityImage = ({ imageUrl, loading, onPress, copy }: EntityImageProps) => (
  <Pressable
    style={[entityStyles.imageContainer, !imageUrl && entityStyles.imagePlaceholder]}
    onPress={onPress}
    disabled={loading}
    accessibilityRole="button"
    accessibilityLabel={copy.imageTitle}
  >
    {loading ? (
      <ActivityIndicator size="small" color={homeColors.surface} />
    ) : imageUrl ? (
      <RNImage source={{ uri: imageUrl }} style={entityStyles.image} />
    ) : (
      <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={homeColors.surface} />
    )}
  </Pressable>
);

const DragHandle = ({ disabled }: { disabled?: boolean }) => (
  <View style={entityStyles.dragHandle}>
    <Text style={[entityStyles.dragHandleIcon, disabled && entityStyles.dragHandleDisabled]}>{DRAG_HANDLE_ICON}</Text>
  </View>
);

const MenuButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={entityStyles.menuButton} onPress={onPress} accessibilityRole="button" accessibilityLabel="Menu">
    <Text style={entityStyles.menuIcon}>{MENU_ICON}</Text>
  </Pressable>
);

export const EntityCardPreview = ({ entity }: { entity: NamedEntity }) => (
  <View style={[entityStyles.card, { flex: 1 }]}>
    <View style={entityStyles.cardInner}>
      <View style={entityStyles.dragHandle}>
        <Text style={entityStyles.dragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
      </View>
      <View style={entityStyles.cardBody}>
        <Text style={entityStyles.cardName}>{entity.name}</Text>
      </View>
      <View style={entityStyles.menuButton}>
        <Text style={entityStyles.menuIcon}>{MENU_ICON}</Text>
      </View>
    </View>
  </View>
);
