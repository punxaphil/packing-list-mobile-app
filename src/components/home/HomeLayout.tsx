import { View } from "react-native";
import { ListSection } from "./ListSection.tsx";
import { ItemsSection } from "./ItemsSection.tsx";
import { EmptyList } from "./EmptyList.tsx";
import { homeStyles } from "./styles.ts";
import { HomeLayoutProps } from "./types.ts";

export const HomeLayout = (props: HomeLayoutProps) => (
  <View style={homeStyles.home}>
    {renderContent(props)}
  </View>
);

const renderContent = (props: HomeLayoutProps) => {
  if (!props.hasLists) return <EmptyList />;
  return props.selection.hasSelection
    ? renderItems(props)
    : renderLists(props);
};

const renderItems = (props: HomeLayoutProps) => (
  <ItemsSection
    selection={props.selection}
    categoriesState={props.categoriesState}
    itemsState={props.itemsState}
    email={props.email}
    onProfile={props.onProfile}
  />
);

const renderLists = (props: HomeLayoutProps) => (
  <ListSection
    lists={props.lists}
    selection={props.selection}
    email={props.email}
    onProfile={props.onProfile}
  />
);
