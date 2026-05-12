import i18next from "i18next";
import { useMemo, useState } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import { useImages } from "~/hooks/useImages.ts";
import { useMemberItemCounts } from "~/hooks/useMemberItemCounts.ts";
import { useMembers } from "~/hooks/useMembers.ts";
import { useSpace } from "~/providers/SpaceContext.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { commonCopy } from "../home/copy.ts";
import { HomeHeader } from "../home/HomeHeader.tsx";
import { buildEntityColors } from "../home/listColors.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { homeColors } from "../home/theme.ts";
import { useDragState } from "../home/useDragState.ts";
import { EntityScroll } from "../shared/EntityScroll.tsx";
import { entityStyles, MEMBER_COPY } from "../shared/entityStyles.ts";
import { ImageViewerModal } from "../shared/ImageViewerModal.tsx";
import { useCreateEntityDialog } from "../shared/useCreateEntityDialog.ts";
import { useEntityActions } from "../shared/useEntityActions.ts";
import { useEntityImageActions } from "../shared/useEntityImageActions.ts";
import { computeEntityDropIndex, useEntityOrdering } from "../shared/useEntityOrdering.ts";
import { useRevisitOrderedColors } from "../shared/useRevisitOrderedColors.ts";
import { MoveMemberItemsDialog } from "./MoveMemberItemsDialog.tsx";

type MembersScreenProps = {
  componentId: string;
  email: string;
  onProfile: () => void;
};

export const MembersScreen = ({ componentId, email, onProfile }: MembersScreenProps) => {
  const { spaceId, writeDb, profile } = useSpace();
  const { members } = useMembers(spaceId);
  const { images } = useImages(spaceId);
  const { counts: itemCounts } = useMemberItemCounts();

  const memberDb = {
    add: writeDb.addMember,
    update: (m: NamedEntity) => writeDb.updateMembers(m),
    delete: writeDb.deleteMember,
  };

  const imageDb = {
    add: writeDb.addImage,
    update: writeDb.updateImage,
    delete: writeDb.deleteImage,
  };

  const [sortByAlpha, setSortByAlpha] = useState(false);
  const [moveSource, setMoveSource] = useState<NamedEntity | null>(null);

  const openMoveItems = (member: NamedEntity) => {
    if (members.length < 2) {
      Alert.alert(MEMBER_COPY.moveItems, i18next.t("member.moveItemsNeedMore"));
      return;
    }
    setMoveSource(member);
  };

  const moveItems = async (target: NamedEntity) => {
    if (!moveSource) return;
    await writeDb.moveMemberAssignments(moveSource.id, target.id);
    setMoveSource(null);
  };

  const actions = useEntityActions(members, itemCounts, MEMBER_COPY, memberDb, openMoveItems);
  const creation = useCreateEntityDialog(actions.onAdd, members, MEMBER_COPY.type);
  const drag = useDragState();
  const ordering = useEntityOrdering(members, writeDb.updateMembers);
  const sorted = sortByAlpha ? [...ordering.entities].sort((a, b) => a.name.localeCompare(b.name)) : ordering.entities;
  const colors = useRevisitOrderedColors(componentId, sorted, buildEntityColors);
  const memberImages = images.filter((img) => img.type === "members");
  const imageActions = useEntityImageActions("members", imageDb);
  const hideImagePlaceholder = profile?.hideImagePlaceholder ?? false;
  const readOnlyIds = useMemo(() => new Set(members.filter((m) => m.userId).map((m) => m.id)), [members]);
  const moveTargets = moveSource ? sorted.filter((member) => member.id !== moveSource.id) : [];

  return (
    <View style={entityStyles.container}>
      <View style={entityStyles.panel}>
        <HomeHeader
          title={MEMBER_COPY.header}
          email={email}
          profileImageUrl={profile?.imageUrl}
          onProfile={onProfile}
        />
        <MemberHeader
          onAdd={creation.open}
          sortByAlpha={sortByAlpha}
          onToggleSort={() => setSortByAlpha(!sortByAlpha)}
        />
        <EntityScroll
          entities={sorted}
          actions={actions}
          copy={MEMBER_COPY}
          colors={colors}
          drag={drag}
          onDrop={ordering.drop}
          computeDropIndex={computeEntityDropIndex}
          dragEnabled={!sortByAlpha}
          readOnlyIds={readOnlyIds}
          itemCounts={itemCounts}
          images={memberImages}
          onImagePress={imageActions.handleImagePress}
          imageLoading={imageActions.loadingEntityId}
          hideImagePlaceholder={hideImagePlaceholder}
          showImageMenuAction
          getMenuItems={(member) => [
            { text: MEMBER_COPY.moveItems, onPress: () => openMoveItems(member), disabled: members.length < 2 },
          ]}
        />
        <TextPromptDialog
          visible={creation.visible}
          title={MEMBER_COPY.createPrompt}
          confirmLabel={MEMBER_COPY.createConfirm}
          value={creation.value}
          placeholder={MEMBER_COPY.createPlaceholder}
          error={creation.error}
          getError={creation.getError}
          onChange={creation.setValue}
          onCancel={creation.close}
          onSubmitText={creation.submitText}
          onSubmit={creation.submit}
        />
        {imageActions.viewerState && (
          <ImageViewerModal
            visible={true}
            imageUrl={imageActions.viewerState.image.url}
            title={MEMBER_COPY.imageTitle}
            connectedLabel={members.find((member) => member.id === imageActions.viewerState?.entityId)?.name}
            loading={imageActions.modalLoading}
            textValue={imageActions.textValue}
            textSubmitDisabled={!imageActions.textValue.trim()}
            onTextChange={imageActions.setTextValue}
            onTextSubmit={() => void imageActions.submitText()}
            onClose={imageActions.closeViewer}
            onReplace={imageActions.handleReplace}
            onRemove={imageActions.handleRemove}
          />
        )}
        <MoveMemberItemsDialog
          visible={!!moveSource}
          source={moveSource}
          targets={moveTargets}
          memberImages={memberImages}
          onClose={() => setMoveSource(null)}
          onSubmit={moveItems}
        />
      </View>
    </View>
  );
};

type MemberHeaderProps = {
  onAdd: () => void;
  sortByAlpha: boolean;
  onToggleSort: () => void;
};

const MemberHeader = ({ onAdd, sortByAlpha, onToggleSort }: MemberHeaderProps) => (
  <View style={entityStyles.actions}>
    <Pressable
      style={entityStyles.addLink}
      onPress={onAdd}
      accessibilityRole="button"
      accessibilityLabel={MEMBER_COPY.addButton}
      hitSlop={8}
    >
      <Text style={entityStyles.addLinkLabel}>{MEMBER_COPY.addButton}</Text>
    </Pressable>
    <View style={entityStyles.spacer} />
    <View style={entityStyles.sortToggle}>
      <Text style={entityStyles.sortLabel}>{sortByAlpha ? "A-Z" : commonCopy.rank}</Text>
      <Switch
        value={sortByAlpha}
        onValueChange={onToggleSort}
        trackColor={{ true: homeColors.primary, false: homeColors.border }}
      />
    </View>
  </View>
);
