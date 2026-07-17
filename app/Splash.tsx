import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";

export default function Splash() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/animations/feather.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <Text style={styles.title}>ريشة</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 300,
    height: 300,
  },
  title: {
    color: "#f2f2f2",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: -20,
  },
});
