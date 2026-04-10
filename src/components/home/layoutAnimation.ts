import { LayoutAnimation, Platform, UIManager } from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LAYOUT_DURATION = 300;

const layoutConfig = {
  duration: LAYOUT_DURATION,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
} as const;

export const animateLayout = () => {
  LayoutAnimation.configureNext(layoutConfig);
};

const listEntryAnimation = {
  duration: 520,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
    duration: 520,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
    duration: 520,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
    duration: 520,
  },
} as const;

export const animateListEntry = () => {
  LayoutAnimation.configureNext(listEntryAnimation);
};
