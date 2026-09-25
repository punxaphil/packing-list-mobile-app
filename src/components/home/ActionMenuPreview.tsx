import { Text, useWindowDimensions, View } from "react-native";
import { actionMenuStyles as styles } from "./actionMenuStyles.ts";
import { homeSpacing } from "./theme.ts";

const LINE_HEIGHT = homeSpacing.lg;
const ACTIONS_HEIGHT = 2 * (2 * homeSpacing.md + LINE_HEIGHT + 1);
const PREVIEW_PADDING = 2 * homeSpacing.sm;

type PreviewItem = { id: string; name: string };

export const getPreviewLines = (items: PreviewItem[], lineCount: number): PreviewItem[] => {
  if (lineCount < 1) return [];
  if (items.length <= lineCount) return items;
  return [...items.slice(0, lineCount - 1), { id: "overflow", name: "..." }];
};

export const ActionMenuPreview = ({ items, headerHeight }: { items: PreviewItem[]; headerHeight: number }) => {
  const { height } = useWindowDimensions();
  const availableHeight = height - 2 * homeSpacing.lg - headerHeight - ACTIONS_HEIGHT - PREVIEW_PADDING;
  const lines = getPreviewLines(items, Math.floor(availableHeight / LINE_HEIGHT));
  if (!lines.length) return null;
  return (
    <View style={styles.preview}>
      {lines.map((line) => (
        <Text key={line.id} style={styles.previewText} numberOfLines={1}>
          {line.name}
        </Text>
      ))}
    </View>
  );
};
