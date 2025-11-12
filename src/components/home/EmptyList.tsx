import { Text, View } from "react-native";
import { HOME_COPY, homeStyles } from "./styles.ts";

export const EmptyList = () => (
  <View style={homeStyles.empty}>
    <Text style={homeStyles.emptyText}>{HOME_COPY.empty}</Text>
  </View>
);
