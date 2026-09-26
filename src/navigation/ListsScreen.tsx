import { ListSection } from "~/components/home/ListSection";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile, switchToItemsTab } from "./navigation";
import { ScreenFrame } from "./ScreenFrame.tsx";

function ListsContent() {
  const { email, lists, listsLoading, selection } = useApp();

  const handleListSelect = (id: string) => {
    selection.select(id);
    switchToItemsTab();
  };

  if (listsLoading) return null;

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
