import { useCallback, useMemo, useState } from "react";
import { Alert, Animated, LayoutRectangle, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useTemplate } from "~/providers/TemplateContext.ts";
import { FadeScrollView } from "../shared/FadeScrollView.tsx";
import { HomeHeader } from "./HomeHeader.tsx";
import { ListCard, ListCardPreview } from "./ListCard.tsx";
import { buildListColors } from "./listColors.ts";
import { computeDropIndex, useListOrdering } from "./listOrdering.ts";
import { ListActions, useListActions } from "./listSectionState.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { homeColors, homeSpacing } from "./theme.ts";
import { PackingListSummary, SelectionState } from "./types.ts";
import { DragOffset } from "./useDraggableRow.tsx";
import { DragSnapshot, useDragState } from "./useDragState.ts";

type ListSectionProps = {
  lists: PackingListSummary[];
  selection: SelectionState;
  email: string;
  onProfile: () => void;
  onListSelect: (id: string) => void;
};
export const ListSection = (props: ListSectionProps) => {
  const { templateList } = useTemplate();
  const actions = useListActions(props.lists, props.selection, templateList, props.onListSelect);
  const creation = useCreateListDialog(actions.onAdd, !!templateList);
  const colors = useMemo(() => buildListColors(props.lists), [props.lists]);
  const drag = useDragState();
  const ordering = useListOrdering(props.lists);
  const [showArchived, setShowArchived] = useState(false);
  const hasArchived = props.lists.some((list) => list.archived);
  const filteredLists = showArchived ? ordering.lists : ordering.lists.filter((list) => !list.archived);
  return (
    <View style={homeStyles.panel}>
      <HomeHeader title={HOME_COPY.listHeader} email={props.email} onProfile={props.onProfile} />
      <ListHeader
        onAdd={creation.open}
        showArchived={showArchived}
        hasArchived={hasArchived}
        onToggleArchived={() => setShowArchived((v) => !v)}
      />
      <ListScroll
        lists={filteredLists}
        selectedId={props.selection.selectedId}
        actions={actions}
        colors={colors}
        drag={drag}
        onDrop={ordering.drop}
        onListSelect={props.onListSelect}
      />
      <TextPromptDialog
        visible={creation.visible}
        title={HOME_COPY.createListPrompt}
        confirmLabel={HOME_COPY.createListConfirm}
        value={creation.value}
        placeholder={HOME_COPY.createListPlaceholder}
        onChange={creation.setValue}
        onCancel={creation.close}
        onSubmit={creation.submit}
      />
    </View>
  );
};

type ListHeaderProps = {
  onAdd: () => void;
  showArchived: boolean;
  hasArchived: boolean;
  onToggleArchived: () => void;
};

const ListHeader = ({ onAdd, showArchived, hasArchived, onToggleArchived }: ListHeaderProps) => (
  <View style={localStyles.headerRow}>
    <Pressable
      style={localStyles.createLink}
      onPress={onAdd}
      accessibilityRole="button"
      accessibilityLabel={HOME_COPY.createList}
      hitSlop={8}
    >
      <Text style={homeStyles.quickAddLabel}>Create list...</Text>
    </Pressable>
    <View style={localStyles.spacer} />
    {hasArchived && (
      <View style={localStyles.archiveToggle}>
        <Text style={localStyles.archiveToggleText}>Archived</Text>
        <Switch
          value={showArchived}
          onValueChange={onToggleArchived}
          trackColor={{ true: homeColors.primary, false: homeColors.border }}
        />
      </View>
    )}
  </View>
);

type ScrollProps = {
  lists: PackingListSummary[];
  selectedId: string;
  actions: ListActions;
  colors: Record<string, string>;
  drag: ReturnType<typeof useDragState>;
  onDrop: (snapshot: DragSnapshot, layouts: Record<string, LayoutRectangle>) => void;
  onListSelect: (id: string) => void;
};

const ListScroll = ({ lists, selectedId, actions, colors, drag, onDrop, onListSelect }: ScrollProps) => {
  const listIds = lists.map((l) => l.id);
  const dropIndex = computeDropIndex(listIds, drag.snapshot, drag.layouts);
  const originalIndex = drag.snapshot ? listIds.indexOf(drag.snapshot.id) : -1;
  const wouldMove = dropIndex !== null && dropIndex !== originalIndex;
  const showBelow = wouldMove && (drag.snapshot?.offsetY ?? 0) > 0;
  const separatorIndices = useMemo(() => getSeparatorIndices(lists), [lists]);
  return (
    <FadeScrollView style={homeStyles.scroll}>
      <View style={[homeStyles.list, dragStyles.relative]}>
        {lists.map((list, index) => (
          <View key={list.id} style={separatorIndices.has(index) ? localStyles.sectionSeparator : null}>
            <ListCard
              list={list}
              isSelected={selectedId === list.id}
              actions={actions}
              color={colors[list.id]}
              hidden={drag.snapshot?.id === list.id}
              onLayout={(layout: LayoutRectangle) => drag.recordLayout(list.id, layout)}
              onDragStart={() => drag.start(list.id, "")}
              onDragMove={(offset: DragOffset) => drag.move(list.id, offset)}
              onDragEnd={() => drag.end((snapshot) => snapshot && onDrop(snapshot, drag.layouts))}
              onSelect={onListSelect}
            />
          </View>
        ))}
        <DropIndicator dropIndex={dropIndex} lists={lists} layouts={drag.layouts} below={showBelow} />
        <GhostRow lists={lists} colors={colors} drag={drag.snapshot} layouts={drag.layouts} />
        <DragDebugPanel snapshot={drag.snapshot} layout={drag.snapshot ? drag.layouts[drag.snapshot.id] : undefined} />
      </View>
    </FadeScrollView>
  );
};

const getSeparatorIndices = (lists: PackingListSummary[]): Set<number> => {
  const indices = new Set<number>();
  const lastTemplateIdx = lists.findLastIndex((l) => l.isTemplate && !l.archived);
  const lastPinnedIdx = lists.findLastIndex((l) => l.pinned && !l.isTemplate && !l.archived);
  const lastActiveIdx = lists.findLastIndex((l) => !l.archived);
  if (lastTemplateIdx >= 0 && lastTemplateIdx < lastActiveIdx) indices.add(lastTemplateIdx);
  if (lastPinnedIdx >= 0 && lastPinnedIdx < lastActiveIdx) indices.add(lastPinnedIdx);
  return indices;
};

const useCreateListDialog = (create: (name: string, useTemplate: boolean) => Promise<void>, hasTemplate: boolean) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const open = useCallback(() => {
    setValue("");
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    close();
    if (hasTemplate) {
      askUseTemplate(trimmed, create);
    } else {
      void create(trimmed, false);
    }
  }, [value, create, close, hasTemplate]);
  return { visible, value, setValue, open, close, submit } as const;
};

const askUseTemplate = (name: string, create: (name: string, useTemplate: boolean) => Promise<void>) => {
  Alert.alert(HOME_COPY.useTemplateTitle, HOME_COPY.useTemplateMessage, [
    { text: HOME_COPY.useTemplateNo, onPress: () => void create(name, false) },
    { text: HOME_COPY.useTemplateYes, onPress: () => void create(name, true) },
  ]);
};

type GhostProps = {
  lists: PackingListSummary[];
  colors: Record<string, string>;
  drag: DragSnapshot;
  layouts: Record<string, LayoutRectangle>;
};

const GhostRow = ({ lists, colors, drag, layouts }: GhostProps) => {
  if (!drag) return null;
  const layout = layouts[drag.id];
  if (!layout) return null;
  const list = lists.find((entry) => entry.id === drag.id);
  if (!list) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[dragStyles.ghost, { top: layout.y + drag.offsetY, height: layout.height, width: layout.width }]}
    >
      <ListCardPreview list={list} color={colors[list.id]} />
    </Animated.View>
  );
};

type DropIndicatorProps = {
  dropIndex: number | null;
  lists: PackingListSummary[];
  layouts: Record<string, LayoutRectangle>;
  below: boolean;
};

const DropIndicator = ({ dropIndex, lists, layouts, below }: DropIndicatorProps) => {
  if (dropIndex === null) return null;
  const targetId = lists[dropIndex]?.id;
  if (!targetId) return null;
  const layout = layouts[targetId];
  if (!layout) return null;
  const top = below ? layout.y + layout.height - 2 : layout.y - 2;
  return <View style={[dragStyles.indicator, { top }]} />;
};

const dragStyles = StyleSheet.create({
  relative: { position: "relative" },
  ghost: {
    position: "absolute",
    zIndex: 10,
    elevation: 5,
    opacity: 0.85,
  },
  indicator: {
    position: "absolute",
    left: -12,
    right: -12,
    height: 2,
    backgroundColor: "#000000",
    borderRadius: 1,
    zIndex: 15,
  },
  debug: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 8,
    borderRadius: 8,
  },
  debugText: { color: "#ffffff", fontSize: 12, lineHeight: 16 },
});

const localStyles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: homeSpacing.sm },
  createLink: { paddingVertical: homeSpacing.xs / 2 },
  archiveToggle: { flexDirection: "row", alignItems: "center", gap: homeSpacing.xs },
  archiveToggleText: { fontSize: 12, color: homeColors.muted },
  spacer: { flex: 1 },
  sectionSeparator: { marginBottom: homeSpacing.sm },
});

const DragDebugPanel = ({ snapshot, layout }: { snapshot: DragSnapshot; layout?: LayoutRectangle }) => {
  if (!snapshot) return null;
  return (
    <View style={dragStyles.debug} pointerEvents="none">
      <Text style={dragStyles.debugText}>{`id: ${snapshot.id}`}</Text>
      <Text style={dragStyles.debugText}>{`offsetY: ${snapshot.offsetY.toFixed(1)}`}</Text>
      <Text style={dragStyles.debugText}>
        {layout ? `y: ${layout.y.toFixed(1)} h: ${layout.height.toFixed(1)}` : "layout: none"}
      </Text>
    </View>
  );
};
