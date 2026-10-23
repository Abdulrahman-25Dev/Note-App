import React from "react";
import { View, StyleSheet, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "../Constants/Colors";
import {
  getBodyFont,
  getDisplayFont,
  getTextDirection,
  Spacing,
} from "../Constants/Layout";
import { Typography } from "../Constants/Typography";
import { useThemeStore } from "../store/useThemeStore";

interface SplashProps {
  onFinish?: () => void;
}

export default function Splash({ onFinish }: SplashProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("ar");
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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
        <Text
          style={[
            styles.title,
            Typography.displayLarge,
            {
              color: theme.primary,
              fontFamily: getDisplayFont(isRTL),
              textAlign: getTextDirection(isRTL),
            },
          ]}
        >
          ريشة
        </Text>

        {/* اللمسة الجمالية الجديدة: العبارة الترحيبية */}
        <Text
          style={[
            styles.subtitle,
            Typography.bodyLarge,
            {
              color: theme.secondary,
              fontFamily: getBodyFont(isRTL),
              textAlign: getTextDirection(isRTL),
            },
          ]}
        >
          دوّن أفكارك بنعومة
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
});
