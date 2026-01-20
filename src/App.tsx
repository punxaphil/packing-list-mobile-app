import React, { PropsWithChildren, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import "./services/database.ts";
import { Login, useCurrentUser } from "./components/auth/Auth.tsx";
import { HOME_COPY, homeStyles } from "./components/home/styles.ts";
import { PackingListSummary } from "./components/home/types.ts";
import { usePackItemCounts, PackItemCountRecord } from "./hooks/usePackItemCounts.ts";
import { MainScreen } from "./components/navigation/MainScreen.tsx";
import { ProfileScreen } from "./components/profile/ProfileScreen.tsx";
import { usePackingLists } from "./hooks/usePackingLists.ts";
import { NamedEntity } from "./types/NamedEntity.ts";

type Screen = "main" | "profile";

const PRIMARY_COLOR = "#2563eb";
const formatTimestamp = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
const timestampStyles = StyleSheet.create({ footer: { alignItems: "center", paddingVertical: 4 }, text: { fontSize: 10, color: "#9ca3af" } });
const DevTimestamp = () => __DEV__ ? <View style={timestampStyles.footer}><Text style={timestampStyles.text}>{formatTimestamp()}</Text></View> : null;

const Layout = ({ children }: PropsWithChildren) => (
  <GestureHandlerRootView style={homeStyles.container}>
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]} style={homeStyles.container}>
        <StatusBar style="auto" />
        <View style={homeStyles.content}>{children}</View>
        <DevTimestamp />
      </SafeAreaView>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const LoadingView = () => (
  <View style={homeStyles.loading}>
    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
    <Text style={homeStyles.loadingText}>{HOME_COPY.loading}</Text>
  </View>
);

const withLayout = (node: React.ReactNode) => <Layout>{node}</Layout>;

const signOut = () => getAuth().signOut().catch(console.error);

const mergeListCounts = (lists: NamedEntity[], counts: PackItemCountRecord): PackingListSummary[] =>
  lists.map((list) => ({ ...list, itemCount: counts[list.id]?.total ?? 0, packedCount: counts[list.id]?.packed ?? 0 }));

type ViewParams = {
  loggingIn: boolean;
  userId: string;
  email: string;
  lists: PackingListSummary[];
  hasLists: boolean;
  screen: Screen;
  onNavigate: (screen: Screen) => void;
};

function buildView(params: ViewParams) {
  if (params.loggingIn) return <LoadingView />;
  if (!params.userId) return <Login />;
  if (params.screen === "profile") {
    return <ProfileScreen email={params.email} userId={params.userId} onSignOut={signOut} onBack={() => params.onNavigate("main")} />;
  }
  return <MainScreen userId={params.userId} email={params.email} lists={params.lists} hasLists={params.hasLists} onProfile={() => params.onNavigate("profile")} />;
}

export default function App() {
  const { userId, email, loggingIn } = useCurrentUser();
  const { packingLists, hasLists } = usePackingLists(userId);
  const { counts } = usePackItemCounts(userId);
  const [screen, setScreen] = useState<Screen>("main");
  const lists = mergeListCounts(packingLists, counts);
  const view = buildView({ loggingIn, userId, email, lists, hasLists, screen, onNavigate: setScreen });
  return withLayout(view);
}
