import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function SharedModal({
  visible,
  onClose,
  onRequestClose,
  children,
}: any) {
  const entrance = useRef(new Animated.Value(0)).current;
  const closeModal = onRequestClose || onClose;

  useEffect(() => {
    if (!visible) {
      entrance.setValue(0);
      return;
    }

    const animation = Animated.timing(entrance, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [entrance, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.backdrop,
          { opacity: entrance },
        ]}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={styles.overlay} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={() => undefined}>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: entrance,
                  transform: [
                    {
                      scale: entrance.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(10, 10, 10, 0.64)",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
});
