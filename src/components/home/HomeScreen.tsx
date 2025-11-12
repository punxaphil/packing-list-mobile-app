import { usePackingItems } from "~/hooks/usePackingItems.ts";
import { HomeLayout } from "./HomeLayout.tsx";
import { HomeLoading } from "./HomeLoading.tsx";
import { useSelectedList } from "./useSelectedList.ts";
import { HomeScreenProps } from "./types.ts";

export const HomeScreen = (props: HomeScreenProps) => {
  const { email, lists, loading, hasLists, userId, onSignOut } = props;
  const selection = useSelectedList(lists, hasLists);
  const itemsState = usePackingItems(userId, selection.selectedId);
  if (loading) return <HomeLoading />;
  return (
    <HomeLayout
      {...{ email, hasLists, lists, selection, itemsState, onSignOut }}
    />
  );
};
