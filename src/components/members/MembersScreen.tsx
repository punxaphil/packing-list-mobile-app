import { StyleSheet, Text, View } from "react-native";
import { HomeHeader } from "../home/HomeHeader.tsx";
import { homeCardStyle, homeColors, homeSpacing } from "../home/theme.ts";

type MembersScreenProps = {
  userId: string;
  email: string;
  onProfile: () => void;
};

export const MembersScreen = ({ email, onProfile }: MembersScreenProps) => (
  <View style={styles.container}>
    <View style={styles.panel}>
      <HomeHeader title="Members" email={email} onProfile={onProfile} />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Members feature coming soon</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  panel: { ...homeCardStyle, flex: 1, gap: homeSpacing.md },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholder: { fontSize: 16, color: homeColors.muted, fontWeight: "500" },
});
