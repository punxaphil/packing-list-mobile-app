import { useParams } from "react-router-dom";
import { ListChangesScreen as ListChangesScreenComponent } from "~/components/home/ListChangesScreen";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { popScreen } from "./navigation";
import { ScreenFrame } from "./ScreenFrame.tsx";

function ListChangesContent({ packingListId }: { packingListId: string }) {
  const { spaceId } = useApp();
  return <ListChangesScreenComponent spaceId={spaceId} packingListId={packingListId} onBack={popScreen} />;
}

export function ListChangesScreen() {
  const { packingListId } = useParams<{ packingListId: string }>();
  const { userId, email } = getAppState();
  if (!packingListId) return null;
  return (
    <ScreenFrame top>
      <AppProvider userId={userId} email={email}>
        <ListChangesContent packingListId={packingListId} />
      </AppProvider>
    </ScreenFrame>
  );
}
