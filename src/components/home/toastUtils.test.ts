import { Animated } from "react-native";
import { describe, expect, it, vi } from "vitest";
import { animateToast } from "./toastUtils.ts";

vi.mock("react-native", () => ({
  Animated: {
    Value: vi.fn(),
    timing: vi.fn(),
    delay: vi.fn(),
    sequence: vi.fn(),
  },
  StyleSheet: { create: vi.fn((styles: object) => styles) },
}));

describe("animateToast", () => {
  it("ignores a stopped toast and clears only after a completed animation", () => {
    const animation = { start: vi.fn(), stop: vi.fn() };
    vi.mocked(Animated.sequence).mockReturnValue(animation as unknown as Animated.CompositeAnimation);
    const onComplete = vi.fn();

    expect(animateToast(new Animated.Value(0), onComplete)).toBe(animation);
    expect(Animated.delay).toHaveBeenCalledWith(2000);
    const onAnimationEnd = animation.start.mock.calls[0][0] as (result: { finished: boolean }) => void;
    onAnimationEnd({ finished: false });
    expect(onComplete).not.toHaveBeenCalled();
    onAnimationEnd({ finished: true });
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("uses a custom display duration when provided", () => {
    vi.mocked(Animated.sequence).mockReturnValue({ start: vi.fn() } as unknown as Animated.CompositeAnimation);

    animateToast(new Animated.Value(0), vi.fn(), 5000);

    expect(Animated.delay).toHaveBeenCalledWith(5000);
  });
});
