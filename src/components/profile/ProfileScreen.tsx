import { useState } from "react";
import { ActivityIndicator, Pressable, Image as RNImage, StyleSheet, Text, View } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { useSubscription } from "~/providers/SubscriptionContext.ts";
import { pickAndResizeImage } from "~/services/imageUtils.ts";
import { updateProfileImageUrl } from "~/services/spaceDatabase.ts";
import { confirmSignOut } from "../home/SignOutButton.tsx";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

type ProfileScreenProps = {
  email: string;
  onSignOut: () => void;
  onBack: () => void;
};

const COPY = {
  title: "Profile",
  signOut: "Sign Out",
  manageSubscription: "Manage Subscription",
  changePhoto: "Change Photo",
  addPhoto: "Add Photo",
  removePhoto: "Remove",
};

type AvatarProps = { email: string; imageUrl?: string; onPress: () => void };

const Avatar = ({ email, imageUrl, onPress }: AvatarProps) => {
  const initial = email.trim()[0]?.toUpperCase() ?? "?";
  return (
    <Pressable onPress={onPress}>
      {imageUrl ? (
        <RNImage source={{ uri: imageUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}
    </Pressable>
  );
};

const SignOutButton = ({ email, onSignOut }: { email: string; onSignOut: () => void }) => (
  <Pressable style={styles.signOutButton} onPress={() => confirmSignOut(email, onSignOut)}>
    <Text style={styles.signOutText}>{COPY.signOut}</Text>
  </Pressable>
);

const PhotoButton = ({ label, loading, onPress }: { label: string; loading?: boolean; onPress: () => void }) => {
  const [width, setWidth] = useState<number | undefined>(undefined);
  return (
    <Pressable
      style={[styles.photoButton, loading && width ? { width } : undefined]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={homeColors.surface} />
      ) : (
        <Text style={styles.photoButtonText}>{label}</Text>
      )}
    </Pressable>
  );
};

const RemoveButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.removeButton} onPress={onPress}>
    <Text style={styles.removeButtonText}>{COPY.removePhoto}</Text>
  </Pressable>
);

export const ProfileScreen = ({ email, onSignOut, onBack }: ProfileScreenProps) => {
  const { profile } = useSpace();
  const { presentCustomerCenter } = useSubscription();
  const imageUrl = profile?.imageUrl;
  const handlers = useImageHandlers(profile?.id);
  return (
    <View style={styles.container}>
      <Header onBack={onBack} />
      <View style={styles.content}>
        <Avatar email={email} imageUrl={imageUrl} onPress={handlers.pick} />
        <Text style={styles.email}>{email}</Text>
        <View style={styles.photoActions}>
          <PhotoButton
            label={imageUrl ? COPY.changePhoto : COPY.addPhoto}
            loading={handlers.loading}
            onPress={handlers.pick}
          />
          {imageUrl && <RemoveButton onPress={handlers.remove} />}
        </View>
        <Pressable style={styles.manageButton} onPress={() => void presentCustomerCenter()}>
          <Text style={styles.manageButtonText}>{COPY.manageSubscription}</Text>
        </Pressable>
        <SignOutButton email={email} onSignOut={onSignOut} />
      </View>
    </View>
  );
};

const useImageHandlers = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const pick = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = await pickAndResizeImage();
      if (!url) return;
      await updateProfileImageUrl(userId, url);
    } finally {
      setLoading(false);
    }
  };
  const remove = async () => {
    if (!userId) return;
    await updateProfileImageUrl(userId, null);
  };
  return { pick, remove, loading };
};

const Header = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.header}>
    <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
      <Text style={styles.backText}>← Back</Text>
    </Pressable>
    <Text style={styles.title}>{COPY.title}</Text>
    <View style={styles.placeholder} />
  </View>
);

const { colors, spacing, radius } = { colors: homeColors, spacing: homeSpacing, radius: homeRadius };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { minWidth: 60 },
  backText: { color: colors.primary, fontWeight: "600", fontSize: 16 },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  placeholder: { minWidth: 60 },
  content: { flex: 1, alignItems: "center", paddingTop: spacing.lg * 2, gap: spacing.lg },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { color: "#ffffff", fontSize: 48, fontWeight: "700" },
  email: { fontSize: 18, color: colors.text, fontWeight: "500" },
  photoActions: { flexDirection: "row", gap: spacing.sm },
  photoButton: {
    paddingHorizontal: spacing.md,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius,
    backgroundColor: colors.primary,
  },
  photoButtonText: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
  removeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeButtonText: { fontSize: 14, fontWeight: "600", color: colors.muted },
  manageButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius,
    backgroundColor: colors.primary,
  },
  manageButtonText: { fontSize: 16, fontWeight: "600", color: colors.buttonText },
  signOutButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  signOutText: { fontSize: 16, fontWeight: "600", color: colors.text },
});
