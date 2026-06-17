import { useState } from "react";
import { ActivityIndicator, Pressable, Image as RNImage, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getEmojiValue } from "~/services/mediaValue.ts";
import type { Image } from "~/types/Image.ts";
import type { Space } from "~/types/Space.ts";
import { CATEGORY_COPY } from "../shared/entityStyles.ts";
import { hasDuplicateEntityName } from "../shared/entityValidation.ts";
import { listCopy } from "./listCopy.ts";
import { ListActions } from "./listSectionState.ts";
import { showActionSheet } from "./showActionSheet.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { homeColors } from "./theme.ts";
import { PackingListSummary } from "./types.ts";
import { DragOffset, useDraggableRow } from "./useDraggableRow.tsx";

const DRAG_HANDLE_ICON = "≡";
const MENU_ICON = "⋮";

type ListCardProps = {
  list: PackingListSummary;
  lists: PackingListSummary[];
  isSelected: boolean;
  actions: ListActions;
  color: string;
  spaces: Space[];
  currentSpaceId: string;
  onMoveToSpace: (listId: string, targetSpaceId: string) => void;
  image?: Image;
  imageLoading?: boolean;
  hideImagePlaceholder?: boolean;
  showImageMenuAction?: boolean;
  onImagePress: (listId: string, image?: Image) => void;
  hidden?: boolean;
  onDragStart?: () => void;
  onDragMove?: (offset: DragOffset) => void;
  onDragEnd?: () => void;
  onSelect: (id: string) => void;
};

type ListCardTextProps = {
  list: PackingListSummary;
  summary: string;
};

export const ListCard = (props: ListCardProps) => {
  const { wrap } = useDraggableRow(
    {
      onStart: props.onDragStart,
      onMove: props.onDragMove,
      onEnd: props.onDragEnd,
    },
    { applyTranslation: false }
  );
  const rename = useRenameDialog(props.list, props.lists, props.actions.onRename);
  const summary = formatSummary(props.list);
  const isTemplate = props.list.isTemplate === true;
  const isPinned = props.list.pinned === true;
  const isArchived = props.list.archived === true;
  const canMove = props.spaces.length > 1;

  const openDeleteConfirm = () =>
    showActionSheet(listCopy.deleteConfirm.replace("{name}", props.list.name), [
      {
        text: listCopy.delete,
        style: "destructive",
        onPress: () => void props.actions.onDelete(props.list),
      },
    ]);
  const openUncheckConfirm = () =>
    showActionSheet(listCopy.uncheckConfirm.replace("{name}", props.list.name), [
      {
        text: listCopy.uncheckAll,
        onPress: () => void props.actions.onUncheckAll(props.list),
      },
    ]);
  const openMovePicker = () =>
    showActionSheet(
      listCopy.moveToSpace,
      props.spaces
        .filter((s) => s.id !== props.currentSpaceId)
        .map((s) => ({
          text: s.name,
          onPress: () => props.onMoveToSpace(props.list.id, s.id),
        }))
    );
  const openMenu = () =>
    showActionSheet(
      props.list.name,
      buildMenuItems(
        props.list,
        props.actions,
        isTemplate,
        isPinned,
        isArchived,
        openDeleteConfirm,
        openUncheckConfirm,
        rename.open,
        props.showImageMenuAction,
        () => props.onImagePress(props.list.id, props.image),
        !!props.image,
        canMove ? openMovePicker : undefined
      )
    );
  const cardStyle = getCardStyle(props.isSelected, props.color, isArchived);
  return (
    <View>
      <Pressable
        style={[cardStyle, props.hidden ? { opacity: 0 } : null]}
        onPress={() => props.onSelect(props.list.id)}
        accessibilityRole="button"
        accessibilityLabel={props.list.name}
        accessibilityHint={summary}
      >
        <View style={homeStyles.listCardInner}>
          {!isTemplate && wrap(<DragHandle />)}
          <ListImage
            imageUrl={props.image?.url}
            loading={props.imageLoading}
            hidePlaceholder={props.hideImagePlaceholder}
            onPress={() => props.onImagePress(props.list.id, props.image)}
          />
          <View style={homeStyles.listCardBody}>
            <ListCardText list={props.list} summary={summary} />
          </View>
          {isPinned && <PinButton onPress={() => void props.actions.onUnpin(props.list)} />}
          <ListMenuButton onPress={openMenu} />
        </View>
      </Pressable>
      <TextPromptDialog
        visible={rename.visible}
        title={listCopy.renameList}
        confirmLabel={listCopy.renameConfirm}
        value={rename.value}
        error={rename.error}
        getError={rename.getError}
        onChange={rename.setValue}
        onCancel={rename.close}
        onSubmitText={rename.submitText}
        onSubmit={rename.submit}
      />
    </View>
  );
};

const useRenameDialog = (
  list: PackingListSummary,
  lists: PackingListSummary[],
  onRename: (list: PackingListSummary, name: string) => Promise<void>
) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const open = () => {
    setValue(list.name);
    setError(null);
    setVisible(true);
  };
  const close = () => setVisible(false);
  const getError = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return HOME_COPY.nameRequired;
    const isDuplicate = trimmed !== list.name && hasDuplicateEntityName(trimmed, lists, list.id);
    return isDuplicate ? HOME_COPY.duplicateListName : null;
  };
  const onChange = (text: string) => {
    setValue(text);
    setError(getError(text));
  };
  const submitText = (text: string) => {
    const trimmed = text.trim();
    const nextError = getError(text);
    if (!trimmed || trimmed === list.name || nextError) {
      setError(nextError);
      if (!nextError) close();
      return;
    }
    void onRename(list, trimmed);
    close();
  };
  const submit = () => {
    submitText(value);
  };
  return {
    visible,
    value,
    error,
    getError,
    setValue: onChange,
    open,
    close,
    submitText,
    submit,
  };
};

const DragHandle = () => (
  <View style={homeStyles.listDragHandle}>
    <Text style={homeStyles.listDragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
  </View>
);

const ListCardText = ({ list, summary }: ListCardTextProps) => (
  <View style={homeStyles.listCardText}>
    <View style={homeStyles.listNameRow}>
      <Text style={homeStyles.listName} numberOfLines={1}>
        {list.name}
      </Text>
      {list.isTemplate && <TemplateBadge />}
      {list.archived && <ArchivedBadge />}
    </View>
    <Text style={homeStyles.listSummary}>{summary}</Text>
  </View>
);

const TemplateBadge = () => (
  <View style={homeStyles.templateBadge}>
    <Text style={homeStyles.templateBadgeText}>{listCopy.template}</Text>
  </View>
);

const PinButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={homeStyles.pinButton}
    accessibilityRole="button"
    accessibilityLabel={listCopy.unpin}
  >
    <MaterialCommunityIcons name="pin-outline" size={18} color={homeColors.muted} />
  </Pressable>
);

const ArchivedBadge = () => (
  <View style={homeStyles.archivedBadge}>
    <Text style={homeStyles.archivedBadgeText}>{listCopy.archivedSingular}</Text>
  </View>
);

type ListImageProps = {
  imageUrl?: string;
  loading?: boolean;
  hidePlaceholder?: boolean;
  onPress: () => void;
};

const ListImage = ({ imageUrl, loading, hidePlaceholder, onPress }: ListImageProps) => {
  if (!imageUrl && hidePlaceholder) return null;
  const emoji = getEmojiValue(imageUrl);
  return (
    <Pressable
      style={[homeStyles.listImageContainer, !imageUrl && homeStyles.listImagePlaceholder]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="List image"
    >
      {loading ? (
        <ActivityIndicator size="small" color={homeColors.surface} />
      ) : emoji ? (
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      ) : imageUrl ? (
        <RNImage source={{ uri: imageUrl }} style={homeStyles.listImage} />
      ) : (
        <MaterialCommunityIcons name="cloud-upload-outline" size={20} color={homeColors.surface} />
      )}
    </Pressable>
  );
};

const ListMenuButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    style={homeStyles.listMenuButton}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={listCopy.listMenu}
  >
    <Text style={homeStyles.listMenuIcon}>{MENU_ICON}</Text>
  </Pressable>
);

const formatSummary = (list: PackingListSummary) => {
  const total = isNumber(list.itemCount) ? list.itemCount : 0;
  const packed = isNumber(list.packedCount) ? list.packedCount : 0;
  if (!total) return HOME_COPY.listNoItems;
  if (list.isTemplate) return `${total} ${total === 1 ? HOME_COPY.itemSingular : HOME_COPY.itemPlural}`;
  const itemsLabel = total === 1 ? HOME_COPY.itemSingular : HOME_COPY.itemPlural;
  const packedLabel = packed === 1 ? HOME_COPY.packedSingular : HOME_COPY.packedPlural;
  return `${total} ${itemsLabel} (${packed} ${packedLabel})`;
};

export const ListCardPreview = ({ list, color }: { list: PackingListSummary; color: string }) => (
  <View style={[getCardStyle(false, color, false), { flex: 1 }]}>
    <View style={homeStyles.listCardInner}>
      <View style={homeStyles.listDragHandle}>
        <Text style={homeStyles.listDragHandleIcon}>{DRAG_HANDLE_ICON}</Text>
      </View>
      <View style={homeStyles.listCardBody}>
        <ListCardText list={list} summary={formatSummary(list)} />
      </View>
      <View style={homeStyles.listMenuButton}>
        <Text style={homeStyles.listMenuIcon}>{MENU_ICON}</Text>
      </View>
    </View>
  </View>
);

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const getCardStyle = (selected: boolean, color: string, archived: boolean) => [
  homeStyles.listCard,
  { backgroundColor: archived ? homeColors.border : color },
  archived && { opacity: 0.7 },
  selected && homeStyles.listCardSelected,
];

const buildMenuItems = (
  list: PackingListSummary,
  actions: ListActions,
  isTemplate: boolean,
  isPinned: boolean,
  isArchived: boolean,
  showDeleteConfirm: () => void,
  showUncheckConfirm: () => void,
  showRename: () => void,
  showImageMenuAction: boolean | undefined,
  handleImageAction: () => void,
  hasImage: boolean,
  showMoveToSpace?: () => void
) => {
  const t = (key: string) => (listCopy as Record<string, string>)[key] ?? key;
  const items = [];
  items.push({ text: t("rename"), onPress: showRename });
  items.push({ text: t("copy"), onPress: () => void actions.onCopy(list) });
  if (showImageMenuAction) {
    items.push({
      text: hasImage ? CATEGORY_COPY.updateImage : CATEGORY_COPY.addImage,
      onPress: handleImageAction,
    });
  }
  if (isArchived) {
    items.push({
      text: t("restore"),
      onPress: () => void actions.onRestore(list),
    });
  } else {
    if (isPinned) {
      items.push({ text: t("unpin"), onPress: () => void actions.onUnpin(list) });
    } else {
      items.push({
        text: t("pinToTop"),
        onPress: () => void actions.onPin(list),
      });
    }
    const hasPacked = (list.packedCount ?? 0) > 0;
    if (isTemplate) {
      items.push({
        text: t("removeTemplate"),
        onPress: () => void actions.onRemoveTemplate(list),
      });
    } else {
      items.push({
        text: t("setAsTemplate"),
        onPress: () => void actions.onSetTemplate(list),
      });
      items.push({
        text: t("archive"),
        onPress: () => void actions.onArchive(list),
      });
      items.push({
        text: t("uncheckAll"),
        onPress: showUncheckConfirm,
        disabled: !hasPacked,
      });
    }
  }
  if (showMoveToSpace) {
    items.push({ text: t("moveToSpace"), onPress: showMoveToSpace });
  }
  items.push({
    text: t("delete"),
    style: "destructive" as const,
    onPress: showDeleteConfirm,
  });
  items.push({ text: t("cancel"), style: "cancel" as const });
  return items;
};
