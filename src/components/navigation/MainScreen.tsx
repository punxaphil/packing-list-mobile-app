import { useCallback, useState } from "react";
import { View } from "react-native";
import { CategoriesScreen } from "~/components/categories/CategoriesScreen.tsx";
import { ItemsScreen } from "~/components/home/ItemsScreen.tsx";
import { ListsScreen } from "~/components/home/ListsScreen.tsx";
import { homeStyles } from "~/components/home/styles.ts";
import { useSelectedList } from "~/components/home/useSelectedList.ts";
import { PackingListSummary } from "~/components/home/types.ts";
import { MembersScreen } from "~/components/members/MembersScreen.tsx";
import { FooterNav, Tab } from "./FooterNav.tsx";

type MainScreenProps = {
  userId: string;
  email: string;
  lists: PackingListSummary[];
  hasLists: boolean;
  listsLoading: boolean;
  onProfile: () => void;
};

export const MainScreen = ({ userId, email, lists, hasLists, listsLoading, onProfile }: MainScreenProps) => {
  const [tab, setTab] = useState<Tab>("items");
  const [visitCount, setVisitCount] = useState({ lists: 0, categories: 0, members: 0 });
  const selection = useSelectedList(lists, hasLists);

  const handleTabSelect = (newTab: Tab) => {
    setTab(newTab);
    if (newTab === "lists" || newTab === "categories" || newTab === "members") {
      setVisitCount((prev) => ({ ...prev, [newTab]: prev[newTab] + 1 }));
    }
  };

  const handleListSelect = useCallback(
    (id: string) => {
      selection.select(id);
      setTab("items");
    },
    [selection.select]
  );

  const hidden = { flex: 1, display: "none" } as const;
  const visible = { flex: 1, display: "flex" } as const;

  return (
    <View style={homeStyles.container}>
      <View style={tab === "items" ? visible : hidden}>
        <ItemsScreen userId={userId} email={email} lists={lists} hasLists={hasLists} listsLoading={listsLoading} selection={selection} onProfile={onProfile} />
      </View>
      <View style={tab === "lists" ? visible : hidden}>
        <ListsScreen key={visitCount.lists} email={email} lists={lists} hasLists={hasLists} listsLoading={listsLoading} selection={selection} onListSelect={handleListSelect} onProfile={onProfile} />
      </View>
      <View style={tab === "categories" ? visible : hidden}>
        <CategoriesScreen key={visitCount.categories} userId={userId} email={email} onProfile={onProfile} />
      </View>
      <View style={tab === "members" ? visible : hidden}>
        <MembersScreen key={visitCount.members} userId={userId} email={email} onProfile={onProfile} />
      </View>
      <FooterNav active={tab} onSelect={handleTabSelect} />
    </View>
  );
};
