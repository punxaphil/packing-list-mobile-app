import { View } from "react-native";
import { HomeHeader } from "./HomeHeader.tsx";
import { ListSection } from "./ListSection.tsx";
import { ItemsSection } from "./ItemsSection.tsx";
import { SignOutButton } from "./SignOutButton.tsx";
import { EmptyList } from "./EmptyList.tsx";
import { homeStyles } from "./styles.ts";
import { HomeLayoutProps } from "./types.ts";

export const HomeLayout = (props: HomeLayoutProps) => (
  <View style={homeStyles.home}>
    <HomeHeader email={props.email} />
    <LayoutContent
      hasLists={props.hasLists}
      lists={props.lists}
      selection={props.selection}
      itemsState={props.itemsState}
    />
    <SignOutButton onPress={props.onSignOut} />
  </View>
);

const LayoutContent = ({
  hasLists,
  lists,
  selection,
  itemsState,
}: Pick<HomeLayoutProps, "hasLists" | "lists" | "selection" | "itemsState">) =>
  hasLists ? (
    <ListsAndItems
      lists={lists}
      selection={selection}
      itemsState={itemsState}
    />
  ) : (
    <EmptyList />
  );

const ListsAndItems = ({
  lists,
  selection,
  itemsState,
}: Pick<HomeLayoutProps, "lists" | "selection" | "itemsState">) => (
  <>
    <ListSection lists={lists} selection={selection} />
    <ItemsSection selection={selection} itemsState={itemsState} />
  </>
);
