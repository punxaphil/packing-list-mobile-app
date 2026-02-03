import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyList } from "~/components/home/EmptyList";
import { ListSection } from "~/components/home/ListSection";
import { homeStyles } from "~/components/home/styles";
import { homeColors } from "~/components/home/theme";
import { useImages } from "~/hooks/useImages";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getProfileImage } from "~/services/utils";
import { getAppState } from "./appState";
import { pushProfile, switchToItemsTab } from "./navigation";
import { useTopBar } from "./useTopBar.ts";

function ListsContent({ componentId }: { componentId: string }) {
  const { userId, lists, hasLists, listsLoading, selection } = useApp();
  const { images } = useImages(userId);
  const profileImage = getProfileImage(images);
  const [showArchived, setShowArchived] = useState(false);
  const hasArchived = lists.some((list) => list.archived);

  useTopBar({
    componentId,
    title: "Lists",
    profileImageUrl: profileImage?.url,
    onProfile: () => pushProfile(componentId),
    showArchived: hasArchived,
    archivedActive: showArchived,
    onArchived: () => setShowArchived((v) => !v),
  });

  const handleListSelect = (id: string) => {
    selection.select(id);
    switchToItemsTab();
  };

  if (listsLoading) {
    return (
      <View style={homeStyles.loading}>
        <ActivityIndicator size="large" color={homeColors.primary} />
      </View>
    );
  }

  if (!hasLists) return <EmptyList />;

  return (
    <ListSection lists={lists} selection={selection} onListSelect={handleListSelect} showArchived={showArchived} />
  );
}

export function ListsScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={[]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ListsContent componentId={componentId} />
      </AppProvider>
    </SafeAreaView>
  );
}
