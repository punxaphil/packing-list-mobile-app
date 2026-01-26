import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { ListSection } from "~/components/home/ListSection.tsx";
import { EmptyList } from "~/components/home/EmptyList.tsx";
import { homeColors } from "~/components/home/theme.ts";
import { homeStyles } from "~/components/home/styles.ts";
import { useApp } from "~/providers/AppProvider.tsx";

export default function ListsTab() {
  const { email, lists, hasLists, listsLoading, selection } = useApp();

  const handleListSelect = (id: string) => {
    selection.select(id);
    router.replace("/(tabs)/");
  };

  if (listsLoading) {
    return (
      <View style={homeStyles.home}>
        <View style={homeStyles.loading}>
          <ActivityIndicator size="large" color={homeColors.primary} />
        </View>
      </View>
    );
  }

  if (!hasLists) return <EmptyList />;

  return (
    <View style={homeStyles.home}>
      <ListSection lists={lists} selection={selection} email={email} onProfile={() => router.push("/(tabs)/profile")} onListSelect={handleListSelect} />
    </View>
  );
}
