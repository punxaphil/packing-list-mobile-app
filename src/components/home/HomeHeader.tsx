import { Text, View } from "react-native";
import { HOME_COPY, homeStyles } from "./styles.ts";

type HomeHeaderProps = {
  email: string;
};

export const HomeHeader = ({ email }: HomeHeaderProps) => (
  <View style={homeStyles.header}>
    <Text style={homeStyles.title}>{HOME_COPY.welcome}</Text>
    <Text style={homeStyles.subtitle}>
      {HOME_COPY.signedInAs}{" "}
      <Text style={homeStyles.highlight}>{email || HOME_COPY.unknownUser}</Text>
    </Text>
  </View>
);
