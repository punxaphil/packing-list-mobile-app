import { router } from "expo-router";
import { ProfileScreen as ProfileScreenComponent } from "~/components/profile/ProfileScreen.tsx";
import { useApp } from "~/providers/AppProvider.tsx";

export default function ProfileTab() {
  const { userId, email, signOut } = useApp();
  return <ProfileScreenComponent userId={userId} email={email} onSignOut={signOut} onBack={() => router.back()} />;
}
