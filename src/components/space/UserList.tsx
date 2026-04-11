import { Alert, Pressable, Image as RNImage, StyleSheet, Text, View } from "react-native";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { SPACE_MGMT_COPY } from "./spaceMgmtCopy.ts";

type UserListProps = {
  emails: string[];
  currentEmail: string;
  onRemove: (email: string) => void;
  imagesByEmail: Record<string, string>;
  isOwner: boolean;
};

export const UserList = ({ emails, currentEmail, onRemove, imagesByEmail, isOwner }: UserListProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{SPACE_MGMT_COPY.users}</Text>
    {emails.map((email) => (
      <UserRow
        key={email}
        email={email}
        isSelf={email.toLowerCase() === currentEmail.toLowerCase()}
        imageUrl={imagesByEmail[email.toLowerCase()]}
        onRemove={() => confirmRemove(email, onRemove)}
        canRemove={isOwner}
      />
    ))}
  </View>
);

type UserRowProps = { email: string; isSelf: boolean; imageUrl?: string; onRemove: () => void; canRemove: boolean };

const UserRow = ({ email, isSelf, imageUrl, onRemove, canRemove }: UserRowProps) => (
  <View style={styles.row}>
    <View style={styles.avatar}>
      {imageUrl ? (
        <RNImage source={{ uri: imageUrl }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarText}>{email[0]?.toUpperCase() ?? "?"}</Text>
      )}
    </View>
    <Text style={styles.email} numberOfLines={1}>
      {email}
      {isSelf ? " (you)" : ""}
    </Text>
    {canRemove && !isSelf && (
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text style={styles.removeText}>{SPACE_MGMT_COPY.remove}</Text>
      </Pressable>
    )}
  </View>
);

const confirmRemove = (email: string, onRemove: (email: string) => void) => {
  Alert.alert(SPACE_MGMT_COPY.confirmRemove, email, [
    { text: SPACE_MGMT_COPY.cancel, style: "cancel" },
    { text: SPACE_MGMT_COPY.confirm, style: "destructive", onPress: () => onRemove(email) },
  ]);
};

const styles = StyleSheet.create({
  section: { gap: homeSpacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: homeColors.text },
  row: { flexDirection: "row", alignItems: "center", gap: homeSpacing.sm, paddingVertical: homeSpacing.xs },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: homeColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: homeColors.primaryForeground, fontSize: 14, fontWeight: "700" },
  avatarImage: { width: 32, height: 32, borderRadius: 16 },
  email: { flex: 1, fontSize: 14, color: homeColors.text },
  removeText: { fontSize: 14, fontWeight: "600", color: homeColors.danger },
});
