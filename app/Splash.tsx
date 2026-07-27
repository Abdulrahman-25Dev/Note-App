import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";

interface SplashProps {
  onFinish?: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  return (
    <View style={styles.container}>
      {/* أنيميشن الريشة كما هو */}
      <LottieView
        source={require("../assets/animations/feather.json")}
        autoPlay
        loop={false}
        speed={1}
        onAnimationFinish={onFinish}
        style={styles.animation}
      />
      
      {/* حاوية النصوص لتوسيط مثالي */}
      <View style={styles.textContainer}>
        {/* الاسم الأساسي */}
        <Text style={styles.title}>ريشة</Text>
        
        {/* اللمسة الجمالية الجديدة: العبارة الترحيبية */}
        <Text style={styles.subtitle}>دوّن أفكارك بنعومة</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // خلفية داكنة فخمة
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 280,
    height: 280,
  },
  textContainer: {
    marginTop: -20, // لتقريب النص قليلاً من الريشة
    alignItems: "center",
  },
  title: {
    color: "#F2F2F2", // أبيض فاتح جداً
    fontSize: 40, // تكبير قليل لاعطاء فخامة
    fontWeight: "bold",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  subtitle: {
    color: "#AAAAAA", // لون رمادي خافت وهادئ
    fontSize: 16,
    fontWeight: "300", // خط أنحف
    marginTop: 8, // مسافة بسيطة تحت العنوان
    letterSpacing: 0.5,
  },
});