import { getAuth } from "firebase/auth";
import { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { PackingListSummary, SelectionState } from "~/components/home/types.ts";
import { useSelectedList } from "~/components/home/useSelectedList.ts";
import { SubscriptionGate } from "~/components/subscription/SubscriptionGate.tsx";
import { PackItemCountRecord, usePackItemCounts } from "~/hooks/usePackItemCounts.ts";
import { usePackingLists } from "~/hooks/usePackingLists.ts";
import { useActiveSpaceId } from "~/hooks/useSpaces.ts";
import { showLoginRoot } from "~/navigation/navigation.ts";
import { clearSelectedId } from "~/navigation/selectionState.ts";
import { clearSpaceState } from "~/navigation/spaceState.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { InviteProvider } from "./InviteProvider.tsx";
import { SpaceProvider } from "./SpaceProvider.tsx";
import { SubscriptionProvider } from "./SubscriptionProvider.tsx";
import { TemplateProvider } from "./TemplateProvider.tsx";

type AppContextValue = {
  userId: string;
  email: string;
  spaceId: string;
  lists: PackingListSummary[];
  hasLists: boolean;
  listsLoading: boolean;
  selection: SelectionState;
  signOut: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const mergeListCounts = (lists: NamedEntity[], counts: PackItemCountRecord): PackingListSummary[] =>
  lists.map((list) => ({
    ...list,
    itemCount: counts[list.id]?.total ?? 0,
    packedCount: counts[list.id]?.packed ?? 0,
  }));

type AppProviderProps = PropsWithChildren<{ userId: string; email: string }>;

const useSignOutAction = () =>
  useCallback(() => {
    const run = async () => {
      showLoginRoot();
      try {
        await getAuth().signOut();
        clearSelectedId();
        await clearSpaceState();
      } catch (error) {
        console.error(error);
      }
    };
    run().catch(console.error);
  }, []);

function AppContent({ userId, email, children, signOut }: AppProviderProps & { signOut: () => void }) {
  const spaceId = useActiveSpaceId();
  const { packingLists, hasLists, loading: listsLoading } = usePackingLists(spaceId);
  const { counts } = usePackItemCounts(spaceId);
  const lists = mergeListCounts(packingLists, counts);
  const selection = useSelectedList(lists, hasLists);

  const value: AppContextValue = {
    userId,
    email,
    spaceId,
    lists,
    hasLists,
    listsLoading,
    selection,
    signOut,
  };

  return (
    <AppContext.Provider value={value}>
      <TemplateProvider lists={lists}>{children}</TemplateProvider>
    </AppContext.Provider>
  );
}

export function AppProvider({ userId, email, children }: AppProviderProps) {
  const signOut = useSignOutAction();

  return (
    <SubscriptionProvider userId={userId}>
      <SubscriptionGate email={email} onSignOut={signOut}>
        <SpaceProvider userId={userId} email={email}>
          <InviteProvider email={email}>
            <AppContent userId={userId} email={email} signOut={signOut}>
              {children}
            </AppContent>
          </InviteProvider>
        </SpaceProvider>
      </SubscriptionGate>
    </SubscriptionProvider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
