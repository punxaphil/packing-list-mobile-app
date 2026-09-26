import squirrelAnimation from "../../../assets/squirrel_animation_slow.gif";

const sizes = { full: 80, compact: 28 } as const;

type SquirrelLoaderProps = { variant?: keyof typeof sizes };

export function SquirrelLoader({ variant = "full" }: SquirrelLoaderProps) {
  const size = sizes[variant];
  return (
    <img src={squirrelAnimation} alt="" style={{ width: size, height: size, flexShrink: 0, objectFit: "contain" }} />
  );
}
