import React from "react";
import { Colors } from "../Constants/Colors";
import { useThemeStore } from "../store/useThemeStore";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";
import { router } from "expo-router";
import { getBodyFont, getTitleFont } from "../Constants/Layout";

function AboutScreen() {
  const isRTL = i18n.language === "ar";
  const { t } = useTranslation();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const mainColor = useThemeStore((state) => state.mainColor);
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TouchableOpacity
        style={[
          styles.backButton,
          { [isRTL ? "right" : "left"]: 20, backgroundColor: theme.card },
        ]}
        onPress={() => router.navigate("/(tabs)/settings")}
        accessibilityRole="button"
        accessibilityLabel={t("back")}
      >
        <Ionicons
          name={isRTL ? "arrow-forward" : "arrow-back"}
          size={24}
          color={mainColor}
        />
      </TouchableOpacity>
      {/* Logo/Icon */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="feather"
            size={40}
            color={mainColor}
          />
        </View>
        <Text
          style={[
            styles.appName,
            { color: theme.primary, fontFamily: getTitleFont(isRTL) },
          ]}
        >
          {t("appName")}{" "}
        </Text>
        <Text
          style={[
            styles.version,
            { color: theme.secondary, fontFamily: getBodyFont(isRTL) },
          ]}
        >
          {t("version")}
        </Text>
      </View>

      {/* الوصف */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.primary,
              textAlign: isRTL ? "right" : "left",
              fontFamily: getTitleFont(isRTL),
            },
          ]}
        >
          {t("descriptionTitle")}
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: theme.secondary,
              textAlign: isRTL ? "right" : "left",
              fontFamily: getBodyFont(isRTL),
            },
          ]}
        >
          {t("description")}
        </Text>
      </View>

      {/* المميزات */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.primary,
              textAlign: isRTL ? "right" : "left",
              fontFamily: getTitleFont(isRTL),
            },
          ]}
        >
          {t("featuresTitle")}
        </Text>

        <View
          style={[
            styles.feature,
            {
              backgroundColor: theme.card,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons name="create-outline" size={24} color={mainColor} />
          <Text
            style={[
              styles.featureText,
              {
                color: theme.secondary,
                textAlign: isRTL ? "right" : "left",
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {t("feature1Edit")}
          </Text>
        </View>

        <View
          style={[
            styles.feature,
            {
              backgroundColor: theme.card,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons name="search-outline" size={24} color={mainColor} />
          <Text
            style={[
              styles.featureText,
              {
                color: theme.secondary,
                textAlign: isRTL ? "right" : "left",
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {t("feature2Search")}
          </Text>
        </View>

        <View
          style={[
            styles.feature,
            {
              backgroundColor: theme.card,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color={mainColor} />
          <Text
            style={[
              styles.featureText,
              {
                color: theme.secondary,
                textAlign: isRTL ? "right" : "left",
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {t("feature3Trash")}
          </Text>
        </View>

        <View
          style={[
            styles.feature,
            {
              backgroundColor: theme.card,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons name="moon-outline" size={24} color={mainColor} />
          <Text
            style={[
              styles.featureText,
              {
                color: theme.secondary,
                textAlign: isRTL ? "right" : "left",
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {t("feature4DarkMode")}
          </Text>
        </View>

        <View
          style={[
            styles.feature,
            {
              backgroundColor: theme.card,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <Ionicons name="language-outline" size={24} color={mainColor} />
          <Text
            style={[
              styles.featureText,
              {
                color: theme.secondary,
                textAlign: isRTL ? "right" : "left",
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {t("feature5Language")}
          </Text>
        </View>

        <View
          style={[
            styles.feature,
            {
              backgroundColor: theme.card,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          {/* اضافة الميزة هنا */}
          <Ionicons name="color-palette" size={24} color={mainColor} />
          <Text
            style={[
              styles.featureText,
              {
                color: theme.secondary,
                textAlign: isRTL ? "right" : "left",
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {t("feature6Theme")}{" "}
          </Text>
        </View>

        <View
          style={[
            styles.feature,
            {
              backgroundColor: theme.card,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          {/* اضافة الميزة هنا */}
          <Ionicons name="lock-closed-outline" size={24} color={mainColor} />
          <Text
            style={[
              styles.featureText,
              {
                color: theme.secondary,
                textAlign: isRTL ? "right" : "left",
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {t("feature7Lock")}
          </Text>
        </View>

        <View
          style={[
            styles.feature,
            {
              backgroundColor: theme.card,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          {/* اضافة الميزة هنا */}
          <Ionicons name="ellipsis-horizontal" size={24} color={mainColor} />
          <Text
            style={[
              styles.featureText,
              {
                color: theme.secondary,
                textAlign: isRTL ? "right" : "left",
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {t("feature8More")}
          </Text>
        </View>
      </View>

      {/* المطور */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.primary,
              textAlign: isRTL ? "right" : "left",
              fontFamily: getTitleFont(isRTL),
            },
          ]}
        >
          {t("developerTitle")}
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: theme.secondary,
              textAlign: isRTL ? "right" : "left",
              fontFamily: getBodyFont(isRTL),
            },
          ]}
        >
          {t("developer")}
        </Text>

        {/* روابط التواصل - اختياري */}
        <TouchableOpacity
          style={[
            styles.linkButton,
            {
              flexDirection: isRTL ? "row-reverse" : "row",
              backgroundColor: theme.surface,
              borderColor: theme.borders,
            },
          ]}
          onPress={() =>
            Linking.openURL("https://khamsat.com/user/abdulrahman_25dev")
          }
        >
          <Ionicons name="briefcase-outline" size={20} color={mainColor} />
          <Text
            style={[
              styles.linkText,
              { color: theme.primary, fontFamily: getBodyFont(isRTL) },
            ]}
          >
            {t("khamsat")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.linkButton,
            {
              flexDirection: isRTL ? "row-reverse" : "row",
              backgroundColor: theme.surface,
              borderColor: theme.borders,
            },
          ]}
          onPress={() =>
            Linking.openURL("https://github.com/Abdulrahman-25Dev")
          }
        >
          <Ionicons name="logo-github" size={20} color={mainColor} />
          <Text
            style={[
              styles.linkText,
              { color: theme.primary, fontFamily: getBodyFont(isRTL) },
            ]}
          >
            {t("My Github")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* الإصدار والحقوق */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Text
          style={[
            styles.footerText,
            { color: theme.secondary, fontFamily: getBodyFont(isRTL) },
          ]}
        >
          {t("Copyright")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "right",
  },
  description: {
    fontSize: 12,
    lineHeight: 24,
    textAlign: "right",
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    textAlign: "right",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 13,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
  },
  divider: {
    width: "100%",
    height: 2,
    backgroundColor: "transparent",
  },
  backButton: {
    position: "absolute",
    top: 60,
    zIndex: 10,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AboutScreen;
