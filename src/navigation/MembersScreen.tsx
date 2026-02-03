import { useState } from "react";
import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "~/components/home/styles";
import { MembersScreen as MembersScreenComponent } from "~/components/members/MembersScreen";
import { useImages } from "~/hooks/useImages";
import { AppProvider } from "~/providers/AppProvider";
import { getProfileImage } from "~/services/utils";
import { getAppState } from "./appState";
import { pushProfile } from "./navigation";
import { useTopBar } from "./useTopBar.ts";

export function MembersScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  const { images } = useImages(userId);
  const profileImage = getProfileImage(images);
  const [sortByAlpha, setSortByAlpha] = useState(false);

  useTopBar({
    componentId,
    title: "Members",
    profileImageUrl: profileImage?.url,
    onProfile: () => pushProfile(componentId),
    showSort: true,
    sortByAlpha,
    onSort: () => setSortByAlpha((v) => !v),
  });

  return (
    <SafeAreaView edges={[]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <MembersScreenComponent userId={userId} sortByAlpha={sortByAlpha} />
      </AppProvider>
    </SafeAreaView>
  );
}
