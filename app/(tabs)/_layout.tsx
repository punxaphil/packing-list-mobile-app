import { Tabs } from "expo-router";
import { View, StyleSheet, Text, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeColors } from "~/components/home/theme.ts";
import { useApp } from "~/providers/AppProvider.tsx";
import { FloatingTabBar } from "~/components/navigation/FloatingTabBar.tsx";

const isSimulator = Platform.OS === "ios" && !!(Platform as unknown as { isPad: boolean; isTVOS: boolean; constants?: { isSimulator?: boolean } }).constants?.isSimulator;

const formatTimestamp = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const DevTimestamp = () => (__DEV__ && isSimulator ? <Text style={devStyles.text}>{formatTimestamp()}</Text> : null);

const devStyles = StyleSheet.create({
  text: { fontSize: 10, color: homeColors.muted, textAlign: "center", paddingVertical: 2, position: "absolute", bottom: 100, left: 0, right: 0 },
});

export default function TabsLayout() {
  const { selection } = useApp();
  const showItems = selection.hasSelection;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.content}>
        <Tabs tabBar={(props) => <FloatingTabBar {...props} showItems={showItems} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" options={{ href: showItems ? "/" : null }} />
          <Tabs.Screen name="lists" />
          <Tabs.Screen name="categories" />
          <Tabs.Screen name="members" />
          <Tabs.Screen name="profile" options={{ href: null }} />
        </Tabs>
        <DevTimestamp />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: homeColors.background },
  content: { flex: 1 },
});
