import { router } from "expo-router";
import { MembersScreen as MembersScreenComponent } from "~/components/members/MembersScreen.tsx";
import { useApp } from "~/providers/AppProvider.tsx";

export default function MembersTab() {
  const { userId, email } = useApp();
  return <MembersScreenComponent userId={userId} email={email} onProfile={() => router.push("/(tabs)/profile")} />;
}
