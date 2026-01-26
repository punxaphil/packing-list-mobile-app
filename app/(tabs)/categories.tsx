import { router } from "expo-router";
import { CategoriesScreen as CategoriesScreenComponent } from "~/components/categories/CategoriesScreen.tsx";
import { useApp } from "~/providers/AppProvider.tsx";

export default function CategoriesTab() {
  const { userId, email } = useApp();
  return <CategoriesScreenComponent userId={userId} email={email} onProfile={() => router.push("/(tabs)/profile")} />;
}
