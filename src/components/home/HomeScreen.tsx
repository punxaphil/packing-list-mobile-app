import { useCategories } from "~/hooks/useCategories.ts";
import { usePackingItems } from "~/hooks/usePackingItems.ts";
import { HomeLayout } from "./HomeLayout.tsx";
import { HomeLoading } from "./HomeLoading.tsx";
import { useSelectedList } from "./useSelectedList.ts";
import { HomeScreenProps } from "./types.ts";

export const HomeScreen = ({
  email,
  lists,
  loading,
  hasLists,
  userId,
  onSignOut,
}: HomeScreenProps) => {
  const selection = useSelectedList(lists, hasLists);
  const categoriesState = useCategories(userId);
  const itemsState = usePackingItems(userId, selection.selectedId);
  const layoutProps = {
    email,
    hasLists,
    lists,
    selection,
    categoriesState,
    itemsState,
    onSignOut,
  };
  if (loading) return <HomeLoading />;
  return <HomeLayout {...layoutProps} />;
};
