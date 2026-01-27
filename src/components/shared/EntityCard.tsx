import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, LayoutChangeEvent, LayoutRectangle, Pressable, Image as RNImage, Text, View } from "react-native";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { ActionMenu } from "../home/ActionMenu.tsx";
import { EditableText } from "../home/EditableText.tsx";
import { homeColors } from "../home/theme.ts";
import { DragOffset, useDraggableRow } from "../home/useDraggableRow.tsx";
import { EntityCopy, entityStyles } from "./entityStyles.ts";

const DRAG_HANDLE_ICON = "≡";
const MENU_ICON = "⋮";

export type EntityActions = {
  onAdd: (name: string) => Promise<void>;
  onDelete: (entity: NamedEntity) => Promise<void>;
  onRename: (entity: NamedEntity, name: string) => Promise<void>;
};

type EntityCardProps = {
  entity: NamedEntity;
  actions: EntityActions;
  copy: EntityCopy;
  color: string;
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

const formatItemCount = (count: number) => {
  if (count === 0) return "No items";
  return `${count} ${count === 1 ? "item" : "items"}`;
};

export const EntityCard = (props: EntityCardProps) => {
  const { wrap } = useDraggableRow(
    { onStart: props.onDragStart, onMove: props.onDragMove, onEnd: props.onDragEnd },
    { applyTranslation: false }
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const handleLayout = (event: LayoutChangeEvent) => props.onLayout?.(event.nativeEvent.layout);
  const handleRename = (name: string) => props.actions.onRename(props.entity, name);
  const cardStyle = [entityStyles.card, { backgroundColor: props.color }, props.hidden ? { opacity: 0 } : null];
  const menuItems = [
    { text: "Delete", style: "destructive" as const, onPress: () => setDeleteConfirmVisible(true) },
    { text: "Cancel", style: "cancel" as const },
  ];
  const deleteConfirmItems = [
    { text: "Delete", style: "destructive" as const, onPress: () => void props.actions.onDelete(props.entity) },
    { text: "Cancel", style: "cancel" as const },
  ];
  return (
    <View onLayout={handleLayout}>
      <Pressable style={cardStyle} accessibilityRole="button" accessibilityLabel={props.entity.name}>
        <View style={entityStyles.cardInner}>
          {wrap(<DragHandle disabled={!props.dragEnabled} />)}
          <EntityImage imageUrl={props.image?.url} onPress={props.onImagePress} copy={props.copy} />
          <View style={entityStyles.cardBody}>
            <EditableText value={props.entity.name} onSubmit={handleRename} textStyle={entityStyles.cardName} />
            <Text style={entityStyles.itemSummary}>{formatItemCount(props.itemCount)}</Text>
          </View>
          <MenuButton onPress={() => setMenuVisible(true)} />
        </View>
      </Pressable>
      <ActionMenu
        visible={menuVisible}
        title={props.entity.name}
        items={menuItems}
        onClose={() => setMenuVisible(false)}
      />
      <ActionMenu
        visible={deleteConfirmVisible}
        title={`Delete "${props.entity.name}"?`}
        items={deleteConfirmItems}
        onClose={() => setDeleteConfirmVisible(false)}
      />
    </View>
  );
};

type EntityImageProps = { imageUrl?: string; onPress: () => void; copy: EntityCopy };

const EntityImage = ({ imageUrl, onPress, copy }: EntityImageProps) => (
  <Pressable
    style={[entityStyles.imageContainer, !imageUrl && entityStyles.imagePlaceholder]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={copy.imageTitle}
  >
    {imageUrl ? (
      <RNImage source={{ uri: imageUrl }} style={entityStyles.image} />
    ) : (
      <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={homeColors.border} />
    )}
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
