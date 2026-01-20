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
  onProfile: () => void;
};

export const MainScreen = ({ userId, email, lists, hasLists, onProfile }: MainScreenProps) => {
  const [tab, setTab] = useState<Tab>("items");
  const [visited, setVisited] = useState<Set<Tab>>(new Set(["items"]));
  const selection = useSelectedList(lists, hasLists);

  const handleTabSelect = (newTab: Tab) => {
    setTab(newTab);
    setVisited((prev) => new Set(prev).add(newTab));
  };

  const handleListSelect = useCallback(
    (id: string) => {
      selection.select(id);
      setTab("items");
    },
    [selection.select]
  );

  return (
    <View style={homeStyles.container}>
      <View style={{ flex: 1, display: tab === "items" ? "flex" : "none" }}>
        <ItemsScreen userId={userId} email={email} hasLists={hasLists} selection={selection} onProfile={onProfile} />
      </View>
      {visited.has("lists") && (
        <View style={{ flex: 1, display: tab === "lists" ? "flex" : "none" }}>
          <ListsScreen email={email} lists={lists} hasLists={hasLists} selection={selection} onListSelect={handleListSelect} onProfile={onProfile} />
        </View>
      )}
      {visited.has("categories") && (
        <View style={{ flex: 1, display: tab === "categories" ? "flex" : "none" }}>
          <CategoriesScreen userId={userId} email={email} onProfile={onProfile} />
        </View>
      )}
      {visited.has("members") && (
        <View style={{ flex: 1, display: tab === "members" ? "flex" : "none" }}>
          <MembersScreen userId={userId} email={email} onProfile={onProfile} />
        </View>
      )}
      <FooterNav active={tab} onSelect={handleTabSelect} />
    </View>
  );
};
