import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";
import { sheetButtonStyles } from "../shared/sheetButtonStyles.ts";
import { spaceCopy } from "./spaceCopy.ts";
import { spaceSheetStyles as styles } from "./spaceSheetStyles.ts";
import { homeColors } from "./theme.ts";

export const buildLabel = (name: string, isPersonal: boolean) =>
  isPersonal ? `${name} (${spaceCopy.personalSpace})` : name;

export const SpaceNameRow = ({ name, onRename }: { name: string; onRename: () => void }) => (
  <View style={styles.nameRow}>
    <Text style={styles.spaceName} numberOfLines={1}>
      {name}
    </Text>
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
  isSoleUser: boolean;
};

export const SpaceActions = ({ onInvite, onLeave, onDelete, isPersonal, isSoleUser }: SpaceActionsProps) => (
  <View style={styles.actions}>
    <Pressable style={[sheetButtonStyles.button, sheetButtonStyles.outlineNeutral]} onPress={onInvite}>
      <Text style={sheetButtonStyles.textNeutral}>{spaceCopy.inviteUser}</Text>
    </Pressable>
    {!isPersonal && (
      <View style={styles.buttonRow}>
        <Pressable
          style={[
            sheetButtonStyles.button,
            sheetButtonStyles.outlineNeutral,
            styles.actionButton,
            isSoleUser && styles.disabled,
          ]}
          onPress={onLeave}
          disabled={isSoleUser}
        >
          <Text style={[sheetButtonStyles.textNeutral, isSoleUser && styles.disabledText]}>{spaceCopy.leaveSpace}</Text>
        </Pressable>
        <Pressable
          style={[sheetButtonStyles.button, sheetButtonStyles.outlineDanger, styles.actionButton]}
          onPress={onDelete}
        >
          <Text style={sheetButtonStyles.textDanger}>{spaceCopy.deleteSpace}</Text>
        </Pressable>
      </View>
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
