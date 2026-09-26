import { ItemsSection } from "~/components/home/ItemsSection";
import { NoSelectionPanel } from "~/components/home/NoSelectionPanel.tsx";
import { useCategories } from "~/hooks/useCategories";
import { useImages } from "~/hooks/useImages";
import { useMembers } from "~/hooks/useMembers";
import { usePackingItems } from "~/hooks/usePackingItems";
import { AppProvider, useApp } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushListChanges, pushProfile, switchToListsTab } from "./navigation";
import { ScreenFrame } from "./ScreenFrame.tsx";

function ItemsContent() {
  const { email, spaceId, lists, hasLists, listsLoading, selection } = useApp();
  const categoriesState = useCategories(spaceId);
  const membersState = useMembers(spaceId);
  const imagesState = useImages(spaceId);
  const itemsState = usePackingItems(spaceId, selection.selectedId);
  const loading = listsLoading || itemsState.loading;

  if (loading) return null;

  if (!hasLists || !selection.hasSelection) {
    return (
      <ScreenFrame>
        <NoSelectionPanel email={email} onProfile={pushProfile} onShowLists={switchToListsTab} />
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame>
      <ItemsSection
        selection={selection}
        categoriesState={categoriesState}
        itemsState={itemsState}
        membersState={membersState}
        imagesState={imagesState}
        lists={lists}
        email={email}
        onProfile={pushProfile}
        onShowChanges={() => pushListChanges(selection.selectedId)}
      />
    </ScreenFrame>
  );
}

export function ItemsScreen() {
  const { userId, email } = getAppState();
  return (
    <ScreenFrame top>
      <AppProvider userId={userId} email={email}>
        <ItemsContent />
      </AppProvider>
    </ScreenFrame>
  );
}
