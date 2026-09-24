import { SpaceSheetContent } from "./SpaceSheetContent.tsx";
import { useSpaceSheet } from "./useSpaceSheet.ts";

export const SpaceSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <SpaceSheetContent visible={visible} onClose={onClose} sheet={useSpaceSheet(onClose)} />
);
