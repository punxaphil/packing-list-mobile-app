import { useState } from "react";
import { Pressable, Image as RNImage, StyleSheet, Text, View } from "react-native";
import { ImageViewerModal } from "~/components/shared/ImageViewerModal.tsx";
import { SquirrelLoader } from "~/components/shared/SquirrelLoader.tsx";
import { useSpace } from "~/providers/SpaceContext.ts";
import { pickAndResizeImage } from "~/services/imageUtils.ts";
import { updateProfileImageUrl } from "~/services/spaceDatabase.ts";
import { confirmSignOut } from "../home/SignOutButton.tsx";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { sheetButtonStyles } from "../shared/sheetButtonStyles.ts";

type ProfileScreenProps = {
  email: string;
  onSignOut: () => void;
  onBack?: () => void;
  embeddedInSheet?: boolean;
};

const COPY = {
  title: "Profile",
  imageTitle: "Profile image",
  signOut: "Sign Out",
  changePhoto: "Change Photo",
  addPhoto: "Add Photo",
  removePhoto: "Remove",
};

const PICKER_OPEN_DELAY_MS = 250;

type AvatarProps = { email: string; imageUrl?: string; onPress: () => void };

const Avatar = ({ email, imageUrl, onPress, loading }: AvatarProps & { loading: boolean }) => {
  const initial = email.trim()[0]?.toUpperCase() ?? "?";
  return (
    <Pressable onPress={onPress} disabled={loading} style={styles.avatarButton}>
      {imageUrl ? (
        <RNImage source={{ uri: imageUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}
      {loading && (
        <View style={styles.avatarLoading}>
          <SquirrelLoader variant="compact" />
        </View>
      )}
    </Pressable>
  );
};

const SignOutButton = ({ email, onSignOut }: { email: string; onSignOut: () => void }) => (
  <Pressable
    style={[
      sheetButtonStyles.button,
      sheetButtonStyles.centered,
      sheetButtonStyles.outlineDanger,
      styles.signOutButton,
    ]}
    onPress={() => confirmSignOut(email, onSignOut)}
  >
    <Text style={sheetButtonStyles.textDanger}>{COPY.signOut}</Text>
  </Pressable>
);

export const ProfileScreen = ({ email, onSignOut, onBack, embeddedInSheet = false }: ProfileScreenProps) => {
  const { profile } = useSpace();
  const [viewerVisible, setViewerVisible] = useState(false);
  const imageUrl = profile?.imageUrl;
  const handlers = useImageHandlers(profile?.id);

  const handleAvatarPress = () => {
    if (imageUrl) {
      setViewerVisible(true);
      return;
    }
    void handlers.pick();
  };

  const closeViewer = () => setViewerVisible(false);

  const replaceImage = async () => {
    closeViewer();
    await new Promise((resolve) => setTimeout(resolve, PICKER_OPEN_DELAY_MS));
    await handlers.pick();
  };

  const removeImage = async () => {
    closeViewer();
    await handlers.remove();
  };

  return (
    <View style={[styles.container, embeddedInSheet && styles.sheetContainer]}>
      {!embeddedInSheet && onBack ? <Header onBack={onBack} /> : null}
      <View style={[styles.content, embeddedInSheet && styles.sheetContent]}>
        <Avatar email={email} imageUrl={imageUrl} onPress={handleAvatarPress} loading={handlers.loading} />
        <Text style={styles.email}>{email}</Text>
        <SignOutButton email={email} onSignOut={onSignOut} />
      </View>
      <ImageViewerModal
        visible={viewerVisible}
        imageUrl={imageUrl}
        placeholderLabel={email.trim()[0]?.toUpperCase() ?? "?"}
        title={COPY.imageTitle}
        connectedLabel={email}
        replaceLabel={imageUrl ? COPY.changePhoto : COPY.addPhoto}
        removeLabel={COPY.removePhoto}
        showRemove={Boolean(imageUrl)}
        onClose={closeViewer}
        onReplace={replaceImage}
        onRemove={removeImage}
      />
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

const { colors, spacing } = {
  colors: homeColors,
  spacing: homeSpacing,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  sheetContainer: { backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { minWidth: 60 },
  backText: { color: colors.muted, fontWeight: "600", fontSize: 16 },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  placeholder: { minWidth: 60 },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.lg * 2,
    gap: spacing.lg,
  },
  sheetContent: { paddingTop: spacing.md, paddingBottom: spacing.md },
  avatarButton: { borderRadius: 50 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.primaryForeground, fontSize: 48, fontWeight: "700" },
  email: { fontSize: 18, color: colors.text, fontWeight: "500" },
  signOutButton: { minWidth: 164 },
});
