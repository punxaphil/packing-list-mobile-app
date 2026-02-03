import { View } from "react-native";
import { useImages } from "~/hooks/useImages.ts";
import { useMemberItemCounts } from "~/hooks/useMemberItemCounts.ts";
import { useMembers } from "~/hooks/useMembers.ts";
import { writeDb } from "~/services/database.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { buildCategoryColors } from "../home/listColors.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { useDragState } from "../home/useDragState.ts";
import { EntityScroll } from "../shared/EntityScroll.tsx";
import { entityStyles, MEMBER_COPY } from "../shared/entityStyles.ts";
import { FloatingAddButton } from "../shared/FloatingAddButton.tsx";
import { ImageViewerModal } from "../shared/ImageViewerModal.tsx";
import { useCreateEntityDialog } from "../shared/useCreateEntityDialog.ts";
import { useEntityActions } from "../shared/useEntityActions.ts";
import { useEntityImageActions } from "../shared/useEntityImageActions.ts";
import { computeEntityDropIndex, useEntityOrdering } from "../shared/useEntityOrdering.ts";

type MembersScreenProps = { userId: string; sortByAlpha: boolean };

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

export const MembersScreen = ({ userId, sortByAlpha }: MembersScreenProps) => {
  const { members } = useMembers(userId);
  const { images } = useImages(userId);
  const { counts: itemCounts } = useMemberItemCounts();
  const actions = useEntityActions(members, itemCounts, MEMBER_COPY, memberDb);
  const creation = useCreateEntityDialog(actions.onAdd, members, MEMBER_COPY.type);
  const drag = useDragState();
  const ordering = useEntityOrdering(members, writeDb.updateMembers);
  const sorted = sortByAlpha ? [...ordering.entities].sort((a, b) => a.name.localeCompare(b.name)) : ordering.entities;
  const colors = buildCategoryColors(members);
  const memberImages = images.filter((img) => img.type === "members");
  const imageActions = useEntityImageActions("members", imageDb);

  return (
    <View style={entityStyles.container}>
      <View style={entityStyles.panelScrollable}>
        <EntityScroll
          entities={sorted}
          actions={actions}
          copy={MEMBER_COPY}
          colors={colors}
          drag={drag}
          onDrop={ordering.drop}
          computeDropIndex={computeEntityDropIndex}
          dragEnabled={!sortByAlpha}
          itemCounts={itemCounts}
          images={memberImages}
          onImagePress={imageActions.handleImagePress}
          imageLoading={imageActions.loadingEntityId}
        />
        <TextPromptDialog
          visible={creation.visible}
          title={MEMBER_COPY.createPrompt}
          confirmLabel={MEMBER_COPY.createConfirm}
          value={creation.value}
          placeholder={MEMBER_COPY.createPlaceholder}
          error={creation.error}
          onChange={creation.setValue}
          onCancel={creation.close}
          onSubmit={creation.submit}
        />
        {imageActions.viewerState && (
          <ImageViewerModal
            visible={true}
            imageUrl={imageActions.viewerState.image.url}
            onClose={imageActions.closeViewer}
            onReplace={imageActions.handleReplace}
            onRemove={imageActions.handleRemove}
          />
        )}
      </View>
      <FloatingAddButton onPress={creation.open} />
    </View>
  );
};
