import { ListSection } from "~/components/home/ListSection";
import { AppLoadingState } from "~/components/shared/AppLoadingState.tsx";
import { useSpaceSwitchLoader } from "~/hooks/useSpaceSwitchLoader.ts";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile, switchToItemsTab } from "./navigation";
import { ScreenFrame } from "./ScreenFrame.tsx";

function ListsContent() {
  const { email, lists, listsLoading, selection, spaceId } = useApp();
  const showLoader = useSpaceSwitchLoader(spaceId, listsLoading);

  const handleListSelect = (id: string) => {
    selection.select(id);
    switchToItemsTab();
  };

  if (listsLoading) return showLoader ? <AppLoadingState variant="screen" /> : null;

  return (
    <ListSection
      lists={lists}
      selection={selection}
      email={email}
      onProfile={pushProfile}
      onListSelect={handleListSelect}
    />
  );
}

export function ListsScreen() {
  const { userId, email } = getAppState();
  return (
    <ScreenFrame top>
      <AppProvider userId={userId} email={email}>
        <ListsContent />
      </AppProvider>
    </ScreenFrame>
  );
}
