import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Colors } from "../Constants/Colors";
import {
  getBodyFont,
  getDisplayFont,
  getRowDirection,
  Radius,
  Spacing,
} from "../Constants/Layout";
import { useThemeStore } from "../store/useThemeStore";

const slides = [
  {
    id: 1,
    title: "كل فكرة تستحق أن تُكتب...",
    subtext:
      "ابدأ بتدوين ملاحظاتك بطريقة بسيطة وجميلة تناسب إبداعك وهويتك الفنية.",
    image: require("../assets/images/iconOnboarding.png"), // الأيقونة الأسطورية لـ "ريشة"
  },
  {
    id: 2,
    title: "أمان وخصوصية تامة",
    subtext:
      "ملاحظاتك وأفكارك الخاصة مشفرة تماماً ومحمية، لا أحد يمكنه الاطلاع عليها غيرك.",
    image: require("../assets/images/security.png"), // أو استخدم صورة/أيقونة درع أو قفل متوفرة عندك
  },
  {
    id: 3,
    title: "ملاحظاتك آمنة في السحاب",
    subtext:
      "مزامنة لحظية وفورية لحماية أفكارك والوصول إليها من أي جهاز بفضل قوة وسرعة Supabase.",
    image: require("../assets/images/cloud.png"), // أيقونة السحابة الذكية
  },
];

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const mainColor = useThemeStore((state) => state.mainColor);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const buttonTextColor = getContrastingTextColor(mainColor);

  // قيم الأنيميشن للشفافية والحركة
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // دالة تشغيل الأنيميشن عند الانتقال
  const animateTransition = (nextIndex: number) => {
    // 1. إخفاء الشاشة الحالية
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. تغيير المحتوى في الـ State وهي مخفية
      setCurrentIndex(nextIndex);

      // تجهيز الشاشة الجديدة في موضع البداية (من اليمين)
      slideAnim.setValue(50);

      // 3. إظهار الشاشة الجديدة بنعومة
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      animateTransition(currentIndex + 1);
    } else {
      // حفظ حالة الإتمام والذهاب لصفحة تسجيل الدخول
      await AsyncStorage.setItem("onboarding", "true");
      router.replace("../Auth/Login");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("onboarding", "true");
    router.replace("../Auth/Login");
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* الخلفية المتدرجة المظلمة الفخمة */}
      <LinearGradient
        colors={[theme.background, theme.surface]}
        style={styles.background}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
      />

      {/* زر التخطي (يختفي تلقائياً في الشاشة الأخيرة للتركيز الكامل على البدء) */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={[
            styles.skipButton,
            isRTL ? styles.skipButtonRTL : styles.skipButtonLTR,
          ]}
          onPress={handleSkip}
        >
          <Text
            style={[
              styles.skipText,
              { color: theme.tertiary, fontFamily: getBodyFont(isRTL) },
            ]}
          >
            تخطي
          </Text>
        </TouchableOpacity>
      )}

      {/* المحتوى المتحرك والمدعوم بالـ Animated */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Image
          source={currentSlide.image}
          style={styles.image}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.welcome,
            {
              color: theme.primary,
              fontFamily: getDisplayFont(isRTL),
              textAlign: "center",
            },
          ]}
        >
          {currentSlide.title}
        </Text>
        <Text
          style={[
            styles.subtext,
            {
              color: theme.secondary,
              fontFamily: getBodyFont(isRTL),
              textAlign: "center",
            },
          ]}
        >
          {currentSlide.subtext}
        </Text>
      </Animated.View>

      {/* الجزء السفلي الثابت (مؤشرات الصفحات والزر) */}
      <View style={styles.footer}>
        {/* نقاط التتبع (Page Indicators) - تتمدد تلقائياً لـ 3 نقاط */}
        <View
          style={[
            styles.indicatorContainer,
            { flexDirection: getRowDirection(isRTL) },
          ]}
        >
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index
                  ? styles.activeIndicator
                  : styles.inactiveIndicator,
                {
                  backgroundColor:
                    currentIndex === index ? mainColor : theme.borders,
                },
              ]}
            />
          ))}
        </View>

        <Button
          mode="contained"
          style={styles.button}
          buttonColor={mainColor}
          textColor={buttonTextColor}
          labelStyle={styles.buttonText}
          onPress={handleNext}
        >
          {currentIndex === slides.length - 1 ? "ابدأ الآن" : "التالي"}
        </Button>
      </View>
    </View>
  );
};

export default Onboarding;

function getContrastingTextColor(hexColor: string) {
  const normalizedColor = hexColor.replace("#", "");
  const red = parseInt(normalizedColor.slice(0, 2), 16);
  const green = parseInt(normalizedColor.slice(2, 4), 16);
  const blue = parseInt(normalizedColor.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipButtonRTL: {
    left: Spacing.xxl,
  },
  skipButtonLTR: {
    right: Spacing.xxl,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: Radius.xl,
    marginBottom: Spacing.xxxl,
  },
  welcome: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  subtext: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 25,
    paddingHorizontal: Spacing.md,
  },
  footer: {
    position: "absolute",
    bottom: Spacing.huge,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
  },
  indicatorContainer: {
    flexDirection: "row",
    marginBottom: Spacing.xxxl,
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    height: 8,
    borderRadius: Radius.round,
    marginHorizontal: Spacing.xs,
  },
  activeIndicator: {
    width: 24,
  },
  inactiveIndicator: {
    width: 8,
  },
  button: {
    borderRadius: Radius.round,
    elevation: 4,
    width: "100%",
    maxWidth: 300,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
