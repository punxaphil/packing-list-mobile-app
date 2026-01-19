import { Pressable, StyleSheet, Text, View } from "react-native";
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
};

const Avatar = ({ email }: { email: string }) => {
  const initial = email.trim()[0]?.toUpperCase() ?? "?";
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
};

const SignOutButton = ({ email, onSignOut }: { email: string; onSignOut: () => void }) => (
  <Pressable style={styles.signOutButton} onPress={() => confirmSignOut(email, onSignOut)}>
    <Text style={styles.signOutText}>{COPY.signOut}</Text>
  </Pressable>
);

export const ProfileScreen = ({ email, onSignOut, onBack }: ProfileScreenProps) => (
  <View style={styles.container}>
    <Header onBack={onBack} />
    <View style={styles.content}>
      <Avatar email={email} />
      <Text style={styles.email}>{email}</Text>
      <SignOutButton email={email} onSignOut={onSignOut} />
    </View>
  </View>
);

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
  avatarText: { color: "#ffffff", fontSize: 48, fontWeight: "700" },
  email: { fontSize: 18, color: colors.text, fontWeight: "500" },
  signOutButton: { marginTop: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  signOutText: { fontSize: 16, fontWeight: "600", color: colors.text },
});
