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
    {props.hasLists ? (
      <ListsAndItems
        lists={props.lists}
        selection={props.selection}
        categoriesState={props.categoriesState}
        itemsState={props.itemsState}
      />
    ) : (
      <EmptyList />
    )}
    <SignOutButton onPress={props.onSignOut} />
  </View>
);

const ListsAndItems = ({
  lists,
  selection,
  categoriesState,
  itemsState,
}: Pick<
  HomeLayoutProps,
  "lists" | "selection" | "categoriesState" | "itemsState"
>) => (
  <>
    <ListSection lists={lists} selection={selection} />
    <ItemsSection
      selection={selection}
      categoriesState={categoriesState}
      itemsState={itemsState}
    />
  </>
);
