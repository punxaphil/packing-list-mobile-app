import { Image as RNImage, Pressable, StyleSheet, Text, View } from "react-native";
import { useImages } from "~/hooks/useImages.ts";
import { pickAndResizeImage } from "~/services/imageUtils.ts";
import { getProfileImage } from "~/services/utils.ts";
import { writeDb } from "~/services/database.ts";
import { Image } from "~/types/Image.ts";
import { confirmSignOut } from "../home/SignOutButton.tsx";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

type ProfileScreenProps = {
  email: string;
  userId: string;
  onSignOut: () => void;
  onBack: () => void;
};

const COPY = {
  title: "Profile",
  signOut: "Sign Out",
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

const PhotoButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable style={styles.photoButton} onPress={onPress}>
    <Text style={styles.photoButtonText}>{label}</Text>
  </Pressable>
);

const RemoveButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.removeButton} onPress={onPress}>
    <Text style={styles.removeButtonText}>{COPY.removePhoto}</Text>
  </Pressable>
);

export const ProfileScreen = ({ email, userId, onSignOut, onBack }: ProfileScreenProps) => {
  const { images } = useImages(userId);
  const profileImage = getProfileImage(images);
  const handlers = useImageHandlers(profileImage);
  return (
    <View style={styles.container}>
      <Header onBack={onBack} />
      <View style={styles.content}>
        <Avatar email={email} imageUrl={profileImage?.url} onPress={handlers.pick} />
        <Text style={styles.email}>{email}</Text>
        <View style={styles.photoActions}>
          <PhotoButton label={profileImage ? COPY.changePhoto : COPY.addPhoto} onPress={handlers.pick} />
          {profileImage && <RemoveButton onPress={handlers.remove} />}
        </View>
        <SignOutButton email={email} onSignOut={onSignOut} />
      </View>
    </View>
  );
};

const useImageHandlers = (profileImage: Image | undefined) => {
  const pick = async () => {
    const url = await pickAndResizeImage();
    if (!url) return;
    if (profileImage) {
      await writeDb.updateImage(profileImage.id, url);
    } else {
      await writeDb.addImage("profile", "", url);
    }
  };
  const remove = async () => {
    if (profileImage) await writeDb.deleteImage(profileImage.id);
  };
  return { pick, remove };
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { minWidth: 60 },
  backText: { color: colors.primary, fontWeight: "600", fontSize: 16 },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  placeholder: { minWidth: 60 },
  content: { flex: 1, alignItems: "center", paddingTop: spacing.lg * 2, gap: spacing.lg },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { color: "#ffffff", fontSize: 48, fontWeight: "700" },
  email: { fontSize: 18, color: colors.text, fontWeight: "500" },
  photoActions: { flexDirection: "row", gap: spacing.sm },
  photoButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius, backgroundColor: colors.primary },
  photoButtonText: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
  removeButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius, borderWidth: 1, borderColor: colors.border },
  removeButtonText: { fontSize: 14, fontWeight: "600", color: colors.muted },
  signOutButton: { marginTop: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  signOutText: { fontSize: 16, fontWeight: "600", color: colors.text },
});
