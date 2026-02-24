import { Modal, Pressable, Text, View } from "react-native";
import { spaceCopy } from "./spaceCopy.ts";
import { homeStyles } from "./styles.ts";

type Props = { visible: boolean; onClose: () => void };

export const InviteSentDialog = ({ visible, onClose }: Props) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <View style={homeStyles.modalBackdrop}>
      <View style={homeStyles.modalCard}>
        <View style={homeStyles.modalCardContent}>
          <Text style={homeStyles.modalTitle}>{spaceCopy.inviteSent}</Text>
          <View style={homeStyles.modalActions}>
            <Pressable onPress={onClose} accessibilityRole="button">
              <Text style={[homeStyles.modalAction, homeStyles.modalActionPrimary]}>{spaceCopy.inviteSentOk}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  </Modal>
);
