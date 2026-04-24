import { useState } from "react";
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
import { getEmojiValue } from "~/services/mediaValue.ts";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { showActionSheet } from "../home/showActionSheet.ts";
import { showNativeTextPrompt } from "../home/showNativeTextPrompt.ts";
import { HOME_COPY } from "../home/styles.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { homeColors } from "../home/theme.ts";
import { DragOffset, useDraggableRow } from "../home/useDraggableRow.tsx";
import { EntityCopy, entityStyles } from "./entityStyles.ts";
import { hasDuplicateEntityName } from "./entityValidation.ts";

const DRAG_HANDLE_ICON = "≡";
const MENU_ICON = "⋮";

export type EntityActions = {
  onAdd: (name: string) => Promise<void>;
  onDelete: (entity: NamedEntity) => Promise<void>;
  onRename: (entity: NamedEntity, name: string) => Promise<void>;
};

export type EntityMenuAction = {
  text: string;
  onPress: () => void;
  style?: "destructive";
  disabled?: boolean;
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
  readOnly?: boolean;
  itemCount: number;
  image?: Image;
  imageLoading?: boolean;
  hideImagePlaceholder?: boolean;
  showImageMenuAction?: boolean;
  menuItems?: EntityMenuAction[];
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
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState(props.entity.name);
  const { wrap } = useDraggableRow(
    {
      onStart: props.onDragStart,
      onMove: props.onDragMove,
      onEnd: props.onDragEnd,
    },
    { applyTranslation: false }
  );
  const handleLayout = (event: LayoutChangeEvent) => props.onLayout?.(event.nativeEvent.layout);
  const handleRename = (name: string) => props.actions.onRename(props.entity, name);
  const getRenameError = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === props.entity.name) return null;
    return hasDuplicateEntityName(trimmed, props.entities, props.entity.id)
      ? `${props.copy.type} with this name already exists`
      : null;
  };
  const submitRename = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === props.entity.name) return;
    void handleRename(trimmed);
  };
  const openRename = () => {
    setRenameValue(props.entity.name);
    if (
      showNativeTextPrompt({
        title: props.copy.renamePrompt,
        confirmLabel: props.copy.renameConfirm,
        cancelLabel: HOME_COPY.cancel,
        value: props.entity.name,
        getError: getRenameError,
        onSubmit: submitRename,
      })
    ) {
      return;
    }
    setRenameVisible(true);
  };
  const closeRename = () => {
    setRenameVisible(false);
    setRenameValue(props.entity.name);
  };
  const isReadOnly = props.readOnly ?? false;
  const menuItems = buildMenuItems(
    props,
    isReadOnly,
    openRename,
    () => void props.actions.onDelete(props.entity),
    !!props.image
  );
  const cardStyle = [entityStyles.card, { backgroundColor: props.color }, props.hidden ? { opacity: 0 } : null];
  const showHighlight = !!props.highlightOpacity;
  const openMenu = () => {
    if (!menuItems.length) return;
    showActionSheet(props.entity.name, menuItems);
  };
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
            hidePlaceholder={props.hideImagePlaceholder}
            onPress={isReadOnly ? () => {} : props.onImagePress}
            copy={props.copy}
          />
          <View style={entityStyles.cardBody}>
            {isReadOnly ? (
              <Text style={entityStyles.cardName}>{props.entity.name}</Text>
            ) : (
              <Pressable onPress={openRename}>
                <Text style={entityStyles.cardName}>{props.entity.name}</Text>
              </Pressable>
            )}
            <Text style={entityStyles.itemSummary}>{formatItemCount(props.itemCount)}</Text>
          </View>
          <MenuButton onPress={openMenu} disabled={menuItems.length === 0} />
        </View>
      </Pressable>
      <TextPromptDialog
        visible={renameVisible}
        title={props.copy.renamePrompt}
        confirmLabel={props.copy.renameConfirm}
        value={renameValue}
        error={getRenameError(renameValue)}
        disabled={!!getRenameError(renameValue)}
        onChange={setRenameValue}
        onCancel={closeRename}
        onSubmit={() => {
          submitRename(renameValue);
          closeRename();
        }}
      />
    </View>
  );
};

type EntityImageProps = {
  imageUrl?: string;
  loading?: boolean;
  hidePlaceholder?: boolean;
  onPress: () => void;
  copy: EntityCopy;
};

const EntityImage = ({ imageUrl, loading, hidePlaceholder, onPress, copy }: EntityImageProps) => {
  if (!imageUrl && hidePlaceholder) return null;
  const emoji = getEmojiValue(imageUrl);
  return (
    <Pressable
      style={[entityStyles.imageContainer, !imageUrl && entityStyles.imagePlaceholder]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={copy.imageTitle}
    >
      {loading ? (
        <ActivityIndicator size="small" color={homeColors.surface} />
      ) : emoji ? (
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      ) : imageUrl ? (
        <RNImage source={{ uri: imageUrl }} style={entityStyles.image} />
      ) : (
        <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={homeColors.surface} />
      )}
    </Pressable>
  );
};

const buildMenuItems = (
  props: Pick<EntityCardProps, "menuItems" | "showImageMenuAction" | "onImagePress">,
  isReadOnly: boolean,
  openRename: () => void,
  onDelete: () => void,
  hasImage: boolean
) => {
  const items = [...(props.menuItems ?? [])];
  if (!isReadOnly) {
    items.unshift({ text: HOME_COPY.rename, onPress: openRename });
  }
  if (!isReadOnly && props.showImageMenuAction) {
    items.push({ text: hasImage ? "Update image" : "Add image", onPress: props.onImagePress });
  }
  if (!isReadOnly) {
    items.push({ text: "Delete", style: "destructive" as const, onPress: onDelete });
  }
  return items;
};

const DragHandle = ({ disabled }: { disabled?: boolean }) => (
  <View style={entityStyles.dragHandle}>
    <Text style={[entityStyles.dragHandleIcon, disabled && entityStyles.dragHandleDisabled]}>{DRAG_HANDLE_ICON}</Text>
  </View>
);

const MenuButton = ({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) => (
  <Pressable
    style={entityStyles.menuButton}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel="Menu"
  >
    <Text style={[entityStyles.menuIcon, disabled && entityStyles.dragHandleDisabled]}>{MENU_ICON}</Text>
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
