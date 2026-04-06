import { Image, StyleSheet } from "react-native";

const squirrelAnimation = require("../../../assets/squirrel_animation_slow.gif");
const sizes = { full: 80, compact: 28 } as const;

type SquirrelLoaderProps = { variant?: keyof typeof sizes };

export function SquirrelLoader({ variant = "full" }: SquirrelLoaderProps) {
  const size = sizes[variant];
  return (
    <Image source={squirrelAnimation} style={[styles.image, { width: size, height: size }]} resizeMode="contain" />
  );
}

const styles = StyleSheet.create({ image: { flexShrink: 0 } });
