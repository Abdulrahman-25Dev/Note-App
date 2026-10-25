import React from "react";
import { StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Colors } from "../Constants/Colors";
import { getBodyFont, getDisplayFont, Spacing } from "../Constants/Layout";
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
    <LinearGradient
      colors={[theme.background, theme.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
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
            {
              color: theme.primary,
              fontFamily: getDisplayFont(isRTL),
            },
          ]}
        >
          ريشة
        </Text>

        {/* اللمسة الجمالية الجديدة: العبارة الترحيبية */}
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.secondary,
              fontFamily: getBodyFont(isRTL),
            },
          ]}
        >
          دوّن أفكارك بنعومة
        </Text>
      </View>
    </LinearGradient>
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
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "300",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
