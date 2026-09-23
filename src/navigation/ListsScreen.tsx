import { SafeAreaView } from "react-native-safe-area-context";
import { ListSection } from "~/components/home/ListSection";
import { homeStyles } from "~/components/home/styles";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile, switchToItemsTab } from "./navigation";

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
    <SafeAreaView edges={["top"]} style={homeStyles.home}>
      <AppProvider userId={userId} email={email}>
        <ListsContent />
      </AppProvider>
    </SafeAreaView>
  );
}
