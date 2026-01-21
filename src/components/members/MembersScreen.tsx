import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { useImages } from "~/hooks/useImages.ts";
import { useMemberItemCounts } from "~/hooks/useMemberItemCounts.ts";
import { useMembers } from "~/hooks/useMembers.ts";
import { writeDb } from "~/services/database.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { HomeHeader } from "../home/HomeHeader.tsx";
import { buildCategoryColors } from "../home/listColors.ts";
import { homeColors } from "../home/theme.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { useDragState } from "../home/useDragState.ts";
import { entityStyles, MEMBER_COPY } from "../shared/entityStyles.ts";
import { EntityScroll } from "../shared/EntityScroll.tsx";
import { useCreateEntityDialog } from "../shared/useCreateEntityDialog.ts";
import { useEntityActions } from "../shared/useEntityActions.ts";
import { useEntityImageActions } from "../shared/useEntityImageActions.ts";
import { computeEntityDropIndex, useEntityOrdering } from "../shared/useEntityOrdering.ts";

type MembersScreenProps = { userId: string; email: string; onProfile: () => void };

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

export const MembersScreen = ({ userId, email, onProfile }: MembersScreenProps) => {
  const { members } = useMembers(userId);
  const { images } = useImages(userId);
  const { counts: itemCounts } = useMemberItemCounts();
  const actions = useEntityActions(members, itemCounts, MEMBER_COPY, memberDb);
  const creation = useCreateEntityDialog(actions.onAdd);
  const drag = useDragState();
  const ordering = useEntityOrdering(members, writeDb.updateMembers);
  const [sortByAlpha, setSortByAlpha] = useState(false);
  const sorted = sortByAlpha ? [...ordering.entities].sort((a, b) => a.name.localeCompare(b.name)) : ordering.entities;
  const colors = buildCategoryColors(members);
  const memberImages = images.filter((img) => img.type === "members");
  const imageActions = useEntityImageActions("members", MEMBER_COPY, imageDb);

  return (
    <View style={entityStyles.container}>
      <View style={entityStyles.panel}>
        <HomeHeader title={MEMBER_COPY.header} email={email} onProfile={onProfile} />
        <MemberHeader onAdd={creation.open} sortByAlpha={sortByAlpha} onToggleSort={() => setSortByAlpha(!sortByAlpha)} />
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
        />
        <TextPromptDialog
          visible={creation.visible}
          title={MEMBER_COPY.createPrompt}
          confirmLabel={MEMBER_COPY.createConfirm}
          value={creation.value}
          placeholder={MEMBER_COPY.createPlaceholder}
          onChange={creation.setValue}
          onCancel={creation.close}
          onSubmit={creation.submit}
        />
      </View>
    </View>
  );
};

type MemberHeaderProps = { onAdd: () => void; sortByAlpha: boolean; onToggleSort: () => void };

const MemberHeader = ({ onAdd, sortByAlpha, onToggleSort }: MemberHeaderProps) => (
  <View style={entityStyles.actions}>
    <View style={entityStyles.sortToggle}>
      <Text style={entityStyles.sortLabel}>{sortByAlpha ? "A-Z" : "Rank"}</Text>
      <Switch value={sortByAlpha} onValueChange={onToggleSort} trackColor={{ true: homeColors.primary, false: homeColors.border }} />
    </View>
    <View style={entityStyles.spacer} />
    <Pressable style={entityStyles.actionButton} onPress={onAdd} accessibilityRole="button" accessibilityLabel={MEMBER_COPY.addButton}>
      <Text style={entityStyles.actionLabel}>{MEMBER_COPY.addButton}</Text>
    </Pressable>
  </View>
);

