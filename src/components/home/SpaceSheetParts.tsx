import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { sheetButtonStyles } from "../shared/sheetButtonStyles.ts";
import { spaceCopy } from "./spaceCopy.ts";
import { spaceSheetStyles as styles } from "./spaceSheetStyles.ts";
import { homeColors } from "./theme.ts";

export const buildLabel = (name: string, isPersonal: boolean, isOwner = false) => {
  const label = isPersonal ? `${name} (${spaceCopy.personalSpace})` : name;
  return isOwner ? `${label} · ${spaceCopy.ownerBadge}` : label;
};

export const SpaceNameRow = ({
  name,
  onRename,
  isOwner,
}: {
  name: string;
  onRename: () => void;
  isOwner: boolean;
}) => (
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
    {isOwner && (
      <Pressable style={[sheetButtonStyles.button, sheetButtonStyles.outlineNeutral]} onPress={onInvite}>
        <Text style={sheetButtonStyles.textNeutral}>{spaceCopy.inviteUser}</Text>
      </Pressable>
    )}
    {!isPersonal && !isOwner && (
      <Pressable style={[sheetButtonStyles.button, sheetButtonStyles.outlineNeutral]} onPress={onLeave}>
        <Text style={sheetButtonStyles.textNeutral}>{spaceCopy.leaveSpace}</Text>
      </Pressable>
    )}
    {!isPersonal && isOwner && (
      <Pressable style={[sheetButtonStyles.button, sheetButtonStyles.outlineDanger]} onPress={onDelete}>
        <Text style={sheetButtonStyles.textDanger}>{spaceCopy.deleteSpace}</Text>
      </Pressable>
    )}
  </View>
);

export const CreateSpaceButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={[sheetButtonStyles.button, sheetButtonStyles.outlineNeutral]} onPress={onPress}>
    <Text style={sheetButtonStyles.textNeutral}>{spaceCopy.createSpace}</Text>
  </Pressable>
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
