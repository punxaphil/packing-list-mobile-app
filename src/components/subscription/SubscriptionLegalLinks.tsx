import { Linking, StyleSheet, Text, View } from "react-native";
import { homeColors, homeSpacing } from "../home/theme.ts";

const PRIVACY_URL = "https://kodsam.se/packsy-privacy.html";
const EULA_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

const COPY = {
  privacy: "Privacy Policy",
  eula: "Terms of Use",
  separator: "·",
};

const open = (url: string) => Linking.openURL(url);

export const SubscriptionLegalLinks = () => (
  <View style={styles.row}>
    <Text style={styles.link} onPress={() => void open(PRIVACY_URL)}>
      {COPY.privacy}
    </Text>
    <Text style={styles.separator}>{COPY.separator}</Text>
    <Text style={styles.link} onPress={() => void open(EULA_URL)}>
      {COPY.eula}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: homeSpacing.xs },
  link: { color: homeColors.primaryStrong, fontSize: 13 },
  separator: { color: homeColors.muted, fontSize: 13 },
});
