import { ActivityIndicator, Text, View } from "react-native";
import { HOME_COPY, homeStyles } from "./styles.ts";

type HomeLoadingProps = {
  message?: string;
};

export function HomeLoading({ message }: HomeLoadingProps) {
  return (
    <View style={homeStyles.loading}>
      <ActivityIndicator size="large" />
      <Text style={homeStyles.loadingText}>
        {message ?? HOME_COPY.loading}
      </Text>
    </View>
  );
}
