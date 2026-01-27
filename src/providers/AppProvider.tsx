import { getAuth } from "firebase/auth";
import { createContext, PropsWithChildren, useContext } from "react";
import { PackingListSummary, SelectionState } from "~/components/home/types.ts";
import { useSelectedList } from "~/components/home/useSelectedList.ts";
import { PackItemCountRecord, usePackItemCounts } from "~/hooks/usePackItemCounts.ts";
import { usePackingLists } from "~/hooks/usePackingLists.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { TemplateProvider } from "./TemplateProvider.tsx";

type AppContextValue = {
  userId: string;
  email: string;
  lists: PackingListSummary[];
  hasLists: boolean;
  listsLoading: boolean;
  selection: SelectionState;
  signOut: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const mergeListCounts = (lists: NamedEntity[], counts: PackItemCountRecord): PackingListSummary[] =>
  lists.map((list) => ({ ...list, itemCount: counts[list.id]?.total ?? 0, packedCount: counts[list.id]?.packed ?? 0 }));

const signOut = () => getAuth().signOut().catch(console.error);

type AppProviderProps = PropsWithChildren<{ userId: string; email: string }>;

export function AppProvider({ userId, email, children }: AppProviderProps) {
  const { packingLists, hasLists, loading: listsLoading } = usePackingLists(userId);
  const { counts } = usePackItemCounts(userId);
  const lists = mergeListCounts(packingLists, counts);
  const selection = useSelectedList(lists, hasLists);

  const value: AppContextValue = { userId, email, lists, hasLists, listsLoading, selection, signOut };

  return (
    <AppContext.Provider value={value}>
      <TemplateProvider lists={lists}>{children}</TemplateProvider>
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
