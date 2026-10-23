import { Ionicons } from "@expo/vector-icons";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import SharedModal from "./sharedModal";
import { useAlertStore } from "../store/useAlertStore";
import { useThemeStore } from "../store/useThemeStore";
import { Colors } from "../Constants/Colors";
import { useTranslation } from "react-i18next";
import {
  getBodyFont,
  getTitleFont,
  Radius,
  Spacing,
} from "../Constants/Layout";

export default function CustomAlert() {
  const { visible, title, message, buttons, hideAlert } = useAlertStore();
  const { isDarkMode, mainColor } = useThemeStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("ar");
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const alertButtons = buttons.length > 0 ? buttons : [{ text: t("ok") }];
  const hasDestructiveButton = alertButtons.some(
    (button) => button.style === "destructive",
  );
  const titleLowerCase = title.toLowerCase();
  const isSuccess =
    titleLowerCase.includes("نجاح") ||
    titleLowerCase.includes("تم") ||
    titleLowerCase.includes("success");
  const isCancelOnly =
    alertButtons.length === 1 && alertButtons[0].style === "cancel";

  const indicator = hasDestructiveButton
    ? { name: "alert-circle" as const, color: "#EF4444" }
    : isSuccess
      ? { name: "checkmark-circle" as const, color: "#10B981" }
      : isCancelOnly
        ? { name: "information-circle" as const, color: mainColor }
        : { name: "information-circle" as const, color: mainColor };

  const getContrastingColor = (hexColor: string) => {
    const hex = hexColor.replace("#", "");
    const fullHex =
      hex.length === 3
        ? hex
            .split("")
            .map((character) => character + character)
            .join("")
        : hex;
    const value = Number.parseInt(fullHex, 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  };

  const horizontalButtons = alertButtons.length <= 2;

  return (
    <SharedModal visible={visible} onClose={hideAlert}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borders,
          },
        ]}
      >
        <Ionicons
          name={indicator.name}
          size={48}
          color={indicator.color}
          style={styles.indicator}
        />
        {title && (
          <Text
            style={[
              styles.title,
              {
                color: theme.primary,
                fontFamily: getTitleFont(isRTL),
              },
            ]}
          >
            {title}
          </Text>
        )}
        {message && (
          <Text
            style={[
              styles.message,
              {
                color: theme.secondary,
                fontFamily: getBodyFont(isRTL),
              },
            ]}
          >
            {message}
          </Text>
        )}
        <View
          style={[
            styles.buttonsContainer,
            {
              flexDirection: horizontalButtons
                ? isRTL
                  ? "row-reverse"
                  : "row"
                : "column",
            },
          ]}
        >
          {alertButtons.map((button, index) => {
            const isDestructive = button.style === "destructive";
            const isCancel = button.style === "cancel";
            const buttonBackground = isDestructive
              ? "#EF4444"
              : isCancel
                ? "transparent"
                : mainColor;
            const buttonTextColor = isDestructive
              ? "#FFFFFF"
              : isCancel
                ? theme.primary
                : getContrastingColor(mainColor);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  horizontalButtons
                    ? styles.horizontalButton
                    : styles.stackedButton,
                  {
                    backgroundColor: buttonBackground,
                    borderColor: isCancel ? theme.borders : buttonBackground,
                  },
                  isCancel && styles.cancelButton,
                ]}
                onPress={() => {
                  button.onPress?.();
                  hideAlert();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: buttonTextColor,
                      fontFamily: getBodyFont(isRTL),
                    },
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SharedModal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    width: "85%",
    alignItems: "center",
    elevation: 10,
  },
  indicator: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    marginBottom: Spacing.xl,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.sm,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  horizontalButton: {
    flex: 1,
  },
  stackedButton: {
    width: "100%",
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: "bold",
  },
});
