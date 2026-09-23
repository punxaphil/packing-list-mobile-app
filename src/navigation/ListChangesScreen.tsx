import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ListChangesScreen as ListChangesScreenComponent } from "~/components/home/ListChangesScreen";
import { homeStyles } from "~/components/home/styles";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { popScreen } from "./navigation";
import type { RootStackParamList } from "./RootNavigator";

function ListChangesContent({ packingListId }: { packingListId: string }) {
  const { spaceId } = useApp();
  return <ListChangesScreenComponent spaceId={spaceId} packingListId={packingListId} onBack={popScreen} />;
}

export function ListChangesScreen({ route }: NativeStackScreenProps<RootStackParamList, "ListChanges">) {
  const { userId, email } = getAppState();
  return (
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ListChangesContent packingListId={route.params.packingListId} />
      </AppProvider>
    </SafeAreaView>
  );
}
