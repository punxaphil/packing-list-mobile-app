import type { NavigationComponentProps } from "react-native-navigation";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoriesScreen as CategoriesScreenComponent } from "~/components/categories/CategoriesScreen";
import { homeStyles } from "~/components/home/styles";
import { AppProvider } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile } from "./navigation";

export function CategoriesScreen({ componentId }: NavigationComponentProps) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <CategoriesScreenComponent userId={userId} email={email} onProfile={() => pushProfile(componentId)} />
      </AppProvider>
    </SafeAreaView>
  );
}
