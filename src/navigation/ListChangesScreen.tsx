import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ListChangesScreen as ListChangesScreenComponent } from "~/components/home/ListChangesScreen";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { popScreen } from "./navigation";
import type { RootStackParamList } from "./RootNavigator";
import { ScreenFrame } from "./ScreenFrame.tsx";

function ListChangesContent({ packingListId }: { packingListId: string }) {
  const { spaceId } = useApp();
  return <ListChangesScreenComponent spaceId={spaceId} packingListId={packingListId} onBack={popScreen} />;
}

export function ListChangesScreen({ route }: NativeStackScreenProps<RootStackParamList, "ListChanges">) {
  const { userId, email } = getAppState();
  return (
    <ScreenFrame top>
      <AppProvider userId={userId} email={email}>
        <ListChangesContent packingListId={route.params.packingListId} />
      </AppProvider>
    </ScreenFrame>
  );
}
