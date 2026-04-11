import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { Button } from "../shared/Button.tsx";
import { spaceCopy } from "./spaceCopy.ts";
import { spaceSheetStyles as styles } from "./spaceSheetStyles.ts";
import { homeColors } from "./theme.ts";

export const buildLabel = (name: string, isPersonal: boolean, isOwner = false) => {
  const base = isPersonal ? `${name} (${spaceCopy.personalSpace})` : name;
  return isOwner ? `${base}${spaceCopy.ownerSeparator}${spaceCopy.ownerBadge}` : base;
};

export const SpaceNameRow = ({ name, onRename, isOwner }: { name: string; onRename: () => void; isOwner: boolean }) => (
  <View style={styles.nameRow}>
    <Text style={styles.spaceName} numberOfLines={1}>
      {name}
    </Text>
    {isOwner && <Text style={styles.ownerBadge}>{spaceCopy.ownerBadge}</Text>}
    <Pressable onPress={onRename} hitSlop={8}>
      <MaterialCommunityIcons name="pencil-outline" size={18} color={homeColors.muted} />
    </Pressable>
  </View>
);

type SpaceActionsProps = {
  onInvite: () => void;
  onLeave: () => void;
  onDelete: () => void;
  isPersonal: boolean;
  isOwner: boolean;
};

export const SpaceActions = ({ onInvite, onLeave, onDelete, isPersonal, isOwner }: SpaceActionsProps) => (
  <View style={styles.actions}>
    {isOwner && <Button label={spaceCopy.inviteUser} onPress={onInvite} />}
    {!isPersonal && !isOwner && <Button label={spaceCopy.leaveSpace} onPress={onLeave} />}
    {!isPersonal && isOwner && <Button label={spaceCopy.deleteSpace} onPress={onDelete} variant="danger" />}
  </View>
);

export const CreateSpaceButton = ({ onPress }: { onPress: () => void }) => (
  <Button label={spaceCopy.createSpace} onPress={onPress} />
);

export const InviteSection = ({
  invites,
  onAccept,
}: {
  invites: SpaceInvite[];
  onAccept: (i: SpaceInvite) => void;
}) => {
  if (!invites.length) return null;
  return (
    <>
      <Text style={styles.sectionTitle}>{spaceCopy.pendingInvites}</Text>
      {invites.map((inv) => (
        <SpaceRow
          key={`${inv.spaceId}-${inv.fromEmail}`}
          label={`${inv.spaceName} — ${spaceCopy.inviteFrom} ${inv.fromEmail}`}
          onPress={() => void onAccept(inv)}
        />
      ))}
    </>
  );
};

export const SpaceRow = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable style={({ pressed }) => [styles.rowMain, pressed && styles.rowPressed]} onPress={onPress}>
    <Text style={styles.rowLabel}>{label}</Text>
  </Pressable>
);
