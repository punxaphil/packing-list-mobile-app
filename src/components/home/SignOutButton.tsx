import { Button, View } from "react-native";
import { HOME_COPY, homeStyles } from "./styles.ts";

type SignOutButtonProps = { onPress: () => void };

export const SignOutButton = ({ onPress }: SignOutButtonProps) => (
  <View style={homeStyles.button}>
    <Button title={HOME_COPY.signOut} onPress={onPress} />
  </View>
);
