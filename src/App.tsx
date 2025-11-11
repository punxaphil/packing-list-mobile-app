import React, { PropsWithChildren } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import "./services/database.ts";
import { Login, useCurrentUser } from "./components/auth/Auth.tsx";
import { HOME_COPY, homeStyles } from "./components/home/styles.ts";
import { usePackingLists } from "./hooks/usePackingLists.ts";
import { NamedEntity } from "./types/NamedEntity.ts";

type HomeProps = {
  email: string;
  lists: NamedEntity[];
  loading: boolean;
  hasLists: boolean;
};

type ListProps = { lists: NamedEntity[] };

const Layout = ({ children }: PropsWithChildren) => (
  <SafeAreaProvider>
    <SafeAreaView edges={["top", "bottom"]} style={homeStyles.container}>
      <StatusBar style="auto" />
      <View style={homeStyles.content}>{children}</View>
    </SafeAreaView>
  </SafeAreaProvider>
);

const LoadingView = () => (
  <View style={homeStyles.loading}>
    <ActivityIndicator size="large" color="#2563eb" />
    <Text style={homeStyles.loadingText}>{HOME_COPY.loading}</Text>
  </View>
);

const EmptyView = () => (
  <View style={homeStyles.empty}>
    <Text style={homeStyles.emptyText}>{HOME_COPY.empty}</Text>
  </View>
);

const PackingListSection = ({ lists }: ListProps) => (
  <View style={homeStyles.listContainer}>
    <Text style={homeStyles.sectionTitle}>Your Packing Lists</Text>
    {lists.map(({ id, name }) => (
      <Text key={id} style={homeStyles.listItem}>
        {`• ${name}`}
      </Text>
    ))}
  </View>
);

const HomeHeader = ({ email }: { email: string }) => (
  <Text style={homeStyles.subtitle}>
    Signed in as{" "}
    <Text style={homeStyles.highlight}>{email || "Unknown user"}</Text>
  </Text>
);

const SignOutButton = () => (
  <View style={homeStyles.button}>
    <Button
      title="Sign out"
      onPress={() => getAuth().signOut().catch(console.error)}
    />
  </View>
);

const Home = ({ email, lists, loading, hasLists }: HomeProps) =>
  loading ? (
    <LoadingView />
  ) : (
    <View style={homeStyles.home}>
      <Text style={homeStyles.title}>Welcome back</Text>
      <HomeHeader email={email} />
      {hasLists ? <PackingListSection lists={lists} /> : <EmptyView />}
      <SignOutButton />
    </View>
  );

const withLayout = (node: React.ReactNode) => <Layout>{node}</Layout>;

const renderHome = (props: HomeProps) => <Home {...props} />;

export default function App() {
  const { userId, email, loggingIn } = useCurrentUser();
  const { packingLists, loading, hasLists } = usePackingLists(userId);
  if (loggingIn) return withLayout(<LoadingView />);
  if (!userId) return withLayout(<Login />);
  return withLayout(renderHome({ email, lists: packingLists, loading, hasLists }));
}
