import { Modal, View, StyleSheet } from "react-native";

export default function SharedModal({
  visible,
  onClose,
  onRequestClose,
  children,
}: any) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose || onClose}
    >
      <View style={styles.overlay}>{children}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,10,10,0.64)",
    justifyContent: "center",
    alignItems: "center",
  },
});
