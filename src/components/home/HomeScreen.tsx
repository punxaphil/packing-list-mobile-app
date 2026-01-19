import { useCategories } from "~/hooks/useCategories.ts";
import { PackItemCountRecord, usePackItemCounts } from "~/hooks/usePackItemCounts.ts";
import { usePackingItems } from "~/hooks/usePackingItems.ts";
import { HomeLayout } from "./HomeLayout.tsx";
import { HomeLoading } from "./HomeLoading.tsx";
import { useSelectedList } from "./useSelectedList.ts";
import { HomeScreenProps, PackingListSummary } from "./types.ts";

export const HomeScreen = (props: HomeScreenProps) => {
  const layoutProps = useLayoutProps(props);
  if (props.loading) return <HomeLoading />;
  return <HomeLayout {...layoutProps} />;
};

const useLayoutProps = (props: HomeScreenProps) => {
  const { counts } = usePackItemCounts(props.userId);
  const lists = mergeListCounts(props.lists, counts);
  const selection = useSelectedList(lists, props.hasLists);
  const categoriesState = useCategories(props.userId);
  const itemsState = usePackingItems(props.userId, selection.selectedId);
  return { email: props.email, hasLists: props.hasLists, lists, selection, categoriesState, itemsState, onSignOut: props.onSignOut, onProfile: props.onProfile };
};

const mergeListCounts = (lists: PackingListSummary[], counts: PackItemCountRecord) =>
  lists.map((list) => applyCounts(list, counts[list.id]));

const applyCounts = (list: PackingListSummary, entry?: { total: number; packed: number }): PackingListSummary => ({
  ...list,
  itemCount: entry?.total ?? 0,
  packedCount: entry?.packed ?? 0,
});
