import { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Platform,
  Pressable,
  Image as RNImage,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ImageViewerModal } from "~/components/shared/ImageViewerModal.tsx";
import { useSpace } from "~/providers/SpaceContext.ts";
import { pickAndResizeImage, promptForEmojiValue } from "~/services/imageUtils.ts";
import { getEmojiValue, toEmojiValue } from "~/services/mediaValue.ts";
import { updateProfileImageUrl } from "~/services/spaceDatabase.ts";
import { commonCopy } from "../home/copy.ts";
import { confirmSignOut } from "../home/SignOutButton.tsx";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { Button } from "../shared/Button.tsx";
import { DeleteAccountButton } from "./DeleteAccountButton.tsx";
import { NameEditor } from "./NameEditor.tsx";
import { PreferencesSection } from "./PreferencesSection.tsx";
import { profileCopy } from "./profileCopy.ts";
import { SubscriptionSection } from "./SubscriptionSection.tsx";

type ProfileScreenProps = {
  email: string;
  onSignOut: () => void;
  onBack?: () => void;
  embeddedInSheet?: boolean;
};

const PICKER_OPEN_DELAY_MS = 250;
const MODAL_TRANSITION_DELAY_MS = 280;

type AvatarProps = { email: string; imageUrl?: string; onPress: () => void };

const Avatar = ({ email, imageUrl, onPress, loading }: AvatarProps & { loading: boolean }) => {
  const initial = email.trim()[0]?.toUpperCase() ?? "?";
  const emoji = getEmojiValue(imageUrl);
  return (
    <Pressable onPress={onPress} disabled={loading} style={styles.avatarButton}>
      {emoji ? (
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{emoji}</Text>
        </View>
      ) : imageUrl ? (
        <RNImage source={{ uri: imageUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}
      {loading && (
        <View style={styles.avatarLoading}>
          <ActivityIndicator size="small" color={homeColors.surface} />
        </View>
      )}
    </Pressable>
  );
};

const SignOutButton = ({ email, onSignOut }: { email: string; onSignOut: () => void }) => (
  <Button label={profileCopy.signOut} onPress={() => confirmSignOut(email, onSignOut)} variant="danger" flex />
);

export const ProfileScreen = ({ email, onSignOut, onBack, embeddedInSheet = false }: ProfileScreenProps) => {
  const { profile } = useSpace();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerText, setViewerText] = useState("");
  const imageUrl = profile?.imageUrl;
  const handlers = useImageHandlers(profile?.id);

  const handleAvatarPress = () => {
    if (imageUrl) {
      setViewerText(getEmojiValue(imageUrl) ?? "");
      setViewerVisible(true);
      return;
    }
    void handlers.pick();
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setViewerText("");
  };

  const replaceImage = async () => {
    closeViewer();
    await new Promise((resolve) => setTimeout(resolve, PICKER_OPEN_DELAY_MS));
    await handlers.pick();
  };

  const removeImage = async () => {
    if (await handlers.remove()) closeViewer();
  };

  const applyViewerText = async () => {
    if (await handlers.saveText(viewerText)) closeViewer();
  };

  return (
    <View style={[styles.container, embeddedInSheet && styles.sheetContainer]}>
      {!embeddedInSheet && onBack ? <Header onBack={onBack} /> : null}
      <View style={[styles.content, embeddedInSheet && styles.sheetContent]}>
        <Avatar email={email} imageUrl={imageUrl} onPress={handleAvatarPress} loading={handlers.loading} />
        <Text style={styles.email}>{email}</Text>
        <NameEditor />
        <PreferencesSection />
        <SubscriptionSection />
        <View style={styles.actionsRow}>
          <SignOutButton email={email} onSignOut={onSignOut} />
          <DeleteAccountButton onSignOut={onSignOut} />
        </View>
      </View>
      <ImageViewerModal
        visible={viewerVisible}
        imageUrl={imageUrl}
        placeholderLabel={email.trim()[0]?.toUpperCase() ?? "?"}
        title={profileCopy.imageTitle}
        connectedLabel={email}
        showRemove={Boolean(imageUrl)}
        loading={handlers.loading}
        textValue={viewerText}
        textSubmitDisabled={!viewerText.trim()}
        onTextChange={setViewerText}
        onTextSubmit={() => void applyViewerText()}
        onClose={closeViewer}
        onReplace={replaceImage}
        onRemove={removeImage}
      />
    </View>
  );
};

const useImageHandlers = (userId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const runWithLoading = async (work: () => Promise<boolean>) => {
    setLoading(true);
    try {
      return await work();
    } finally {
      setLoading(false);
    }
  };
  const saveImage = async (value: string | null) => {
    if (!userId) return false;
    await updateProfileImageUrl(userId, value);
    return true;
  };
  const pickPhoto = () =>
    runWithLoading(async () => {
      const url = await pickAndResizeImage();
      if (!url) return false;
      return saveImage(url);
    });
  const pickEmojiText = () =>
    runWithLoading(async () => {
      const value = await promptForEmojiValue();
      if (!value) return false;
      return saveImage(value);
    });
  const pick = async () => {
    if (!userId) return false;
    if (Platform.OS !== "ios") return pickPhoto();
    return new Promise<boolean>((resolve) => {
      const options = [profileCopy.choosePhoto, profileCopy.chooseEmoji, commonCopy.cancel];
      ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: options.length - 1 }, (index) => {
        if (index === 0) {
          void pickPhoto().then(resolve);
          return;
        }
        if (index === 1) {
          setTimeout(() => void pickEmojiText().then(resolve), MODAL_TRANSITION_DELAY_MS);
          return;
        }
        resolve(false);
      });
    });
  };
  const remove = async () => {
    if (!userId) return false;
    return runWithLoading(async () => {
      return saveImage(null);
    });
  };
  const saveText = (value: string) =>
    runWithLoading(async () => {
      const trimmed = value.trim();
      if (!trimmed) return false;
      return saveImage(toEmojiValue(trimmed));
    });
  return {
    pick,
    remove,
    saveText,
    loading,
  };
};

const Header = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.header}>
    <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
      <Text style={styles.backText}>← Back</Text>
    </Pressable>
    <Text style={styles.title}>{profileCopy.title}</Text>
    <View style={styles.placeholder} />
  </View>
);

const { colors, spacing } = {
  colors: homeColors,
  spacing: homeSpacing,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  sheetContainer: { flex: 0, backgroundColor: "transparent" },
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
  actionsRow: {
    width: "100%",
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  sheetContent: { flex: 0, paddingTop: spacing.md, paddingBottom: spacing.md },
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
  avatarEmoji: {
    fontSize: 52,
    lineHeight: 60,
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.primaryForeground,
    fontSize: 48,
    fontWeight: "700",
  },
  email: { fontSize: 18, color: colors.text, fontWeight: "500" },
});
