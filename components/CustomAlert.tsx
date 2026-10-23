import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import SharedModal from "./sharedModal";
import { useAlertStore } from "../store/useAlertStore";
import { useThemeStore } from "../store/useThemeStore";
import { Colors } from "../Constants/Colors";
import { useTranslation } from "react-i18next";
import { FontFamily, Typography } from "../Constants/Typography";
import { Radius, Spacing } from "../Constants/Layout";

export default function CustomAlert() {
  const { visible, title, message, buttons, hideAlert } = useAlertStore();
  const { isDarkMode, mainColor } = useThemeStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("ar");
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const getButtonColor = (style?: "default" | "cancel" | "destructive") => {
    switch (style) {
      case "destructive":
        return theme.destructive;
      case "cancel":
        return theme.secondary;
      default:
        return mainColor;
    }
  };

  return (
    <SharedModal visible={visible} onClose={hideAlert}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borders,
          },
        ]}
      >
        {title && (
          <Text
            style={[
              styles.title,
              isRTL ? Typography.arabicTitle : Typography.displaySmall,
              {
                color: theme.primary,
                fontFamily: isRTL
                  ? FontFamily.arabicBold
                  : FontFamily.displayMedium,
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
              isRTL ? Typography.arabicBody : Typography.bodyMedium,
              {
                color: theme.secondary,
                fontFamily: isRTL
                  ? FontFamily.arabicRegular
                  : FontFamily.bodyRegular,
              },
            ]}
          >
            {message}
          </Text>
        )}
        <View style={styles.buttonsContainer}>
          {(buttons.length > 0 ? buttons : [{ text: t("ok") }]).map(
            (button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  { backgroundColor: getButtonColor(button.style) },
                ]}
                onPress={() => {
                  button.onPress?.();
                  hideAlert();
                }}
              >
                <Text style={[styles.buttonText, Typography.button]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>
    </SharedModal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    width: "85%",
    alignItems: "center",
  },
  title: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  message: {
    marginBottom: Spacing.lg,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 8,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: Colors.light.card,
  },
});
