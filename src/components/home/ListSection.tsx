import { useCallback, useMemo, useState } from "react";
import { Animated, LayoutRectangle, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PackingListSummary, SelectionState } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { HomeHeader } from "./HomeHeader.tsx";
import { ListCard, ListCardPreview } from "./ListCard.tsx";
import { ListActions, useListActions } from "./listSectionState.ts";
import { buildListColors } from "./listColors.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { DragOffset } from "./useDraggableRow.tsx";
import { useDragDebug } from "./useDragDebug.ts";
import { useListOrdering, computeDropIndex } from "./listOrdering.ts";
import { useDragState, DragSnapshot } from "./useDragState.ts";

type ListSectionProps = {
  lists: PackingListSummary[];
  selection: SelectionState;
  email: string;
  onSignOut: () => void;
};
export const ListSection = (props: ListSectionProps) => {
  const actions = useListActions(props.lists, props.selection);
  const creation = useCreateListDialog(actions.onAdd);
  const colors = useMemo(() => buildListColors(props.lists), [props.lists]);
  const drag = useDragState();
  const ordering = useListOrdering(props.lists);
  useDragDebug({ snapshot: drag.snapshot, layouts: drag.layouts, lists: props.lists });
  return (
    <View style={homeStyles.panel}>
      <HomeHeader title={HOME_COPY.listHeader} email={props.email} onSignOut={props.onSignOut} />
      <ListHeader onAdd={creation.open} />
      <ListScroll
        lists={ordering.lists}
        selection={props.selection}
        actions={actions}
        colors={colors}
        drag={drag}
        onDrop={ordering.drop}
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

const ListHeader = ({ onAdd }: { onAdd: () => void }) => (
  <View style={homeStyles.listActions}>
    <Pressable style={homeStyles.listActionButton} onPress={onAdd} accessibilityRole="button" accessibilityLabel={HOME_COPY.createList}>
      <Text style={homeStyles.listActionLabel}>{HOME_COPY.createList}</Text>
    </Pressable>
  </View>
);

type ScrollProps = {
  lists: PackingListSummary[];
  selection: SelectionState;
  actions: ListActions;
  colors: Record<string, string>;
  drag: ReturnType<typeof useDragState>;
  onDrop: (snapshot: DragSnapshot, layouts: Record<string, LayoutRectangle>) => void;
};

const ListScroll = ({ lists, selection, actions, colors, drag, onDrop }: ScrollProps) => {
  const listIds = lists.map((l) => l.id);
  const dropIndex = computeDropIndex(listIds, drag.snapshot, drag.layouts);
  const originalIndex = drag.snapshot ? listIds.indexOf(drag.snapshot.id) : -1;
  const wouldMove = dropIndex !== null && dropIndex !== originalIndex;
  const showBelow = wouldMove && (drag.snapshot?.offsetY ?? 0) > 0;
  return (
    <ScrollView style={homeStyles.scroll} showsVerticalScrollIndicator={false}>
      <View style={[homeStyles.list, dragStyles.relative]}>
        {lists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            selection={selection}
            actions={actions}
            color={colors[list.id]}
            hidden={drag.snapshot?.id === list.id}
            onLayout={(layout: LayoutRectangle) => drag.recordLayout(list.id, layout)}
            onDragStart={() => drag.start(list.id)}
            onDragMove={(offset: DragOffset) => drag.move(list.id, offset)}
            onDragEnd={() => drag.end((snapshot) => snapshot && onDrop(snapshot, drag.layouts))}
          />
        ))}
        <DropIndicator dropIndex={dropIndex} lists={lists} layouts={drag.layouts} below={showBelow} />
        <GhostRow lists={lists} colors={colors} drag={drag.snapshot} layouts={drag.layouts} />
        <DragDebugPanel snapshot={drag.snapshot} layout={drag.snapshot ? drag.layouts[drag.snapshot.id] : undefined} />
      </View>
    </ScrollView>
  );
};

const useCreateListDialog = (create: (name: string) => Promise<void>) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const open = useCallback(() => { setValue(""); setVisible(true); }, []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    void create(trimmed);
    close();
  }, [value, create, close]);
  return { visible, value, setValue, open, close, submit } as const;
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
    <Animated.View pointerEvents="none" style={[dragStyles.ghost, { top: layout.y + drag.offsetY, height: layout.height, width: layout.width }]}>
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

const DragDebugPanel = ({ snapshot, layout }: { snapshot: DragSnapshot; layout?: LayoutRectangle }) => {
  if (!snapshot) return null;
  return (
    <View style={dragStyles.debug} pointerEvents="none">
      <Text style={dragStyles.debugText}>{`id: ${snapshot.id}`}</Text>
      <Text style={dragStyles.debugText}>{`offsetY: ${snapshot.offsetY.toFixed(1)}`}</Text>
      <Text style={dragStyles.debugText}>{layout ? `y: ${layout.y.toFixed(1)} h: ${layout.height.toFixed(1)}` : "layout: none"}</Text>
    </View>
  );
};


