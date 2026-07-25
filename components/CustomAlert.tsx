import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import SharedModal from "./sharedModal";
import { useAlertStore } from "../store/useAlertStore";
import { useThemeStore } from "../store/useThemeStore";
import { Colors } from "../Constants/Colors";
import { useTranslation } from "react-i18next";

export default function CustomAlert() {
  const { visible, title, message, buttons, hideAlert } = useAlertStore();
  const { isDarkMode, mainColor } = useThemeStore();
  const { t } = useTranslation();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const getButtonColor = (style?: "default" | "cancel" | "destructive") => {
    switch (style) {
      case "destructive":
        return "#DC2626";
      case "cancel":
        return "#6B7280";
      default:
        return mainColor;
    }
  };

  return (
    <SharedModal visible={visible} onClose={hideAlert}>
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        {title && (
          <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
        )}
        {message && (
          <Text style={[styles.message, { color: theme.secondary }]}>
            {message}
          </Text>
        )}
        <View style={styles.buttonsContainer}>
          {(buttons.length > 0 ? buttons : [{ text: t("ok") }]).map((button, index) => (
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
              <Text style={styles.buttonText}>{button.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SharedModal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
