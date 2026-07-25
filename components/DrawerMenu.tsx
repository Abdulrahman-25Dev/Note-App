import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "../Constants/Colors";

interface DrawerMenuProps {
  drawerOpen: boolean;
  translateX: Animated.AnimatedInterpolation<number>;
  isRTL: boolean;
  theme: (typeof Colors)[keyof typeof Colors];
  mainColor: string;
  currentTab: string;
  toggleDrawer: () => void;
}

export default function DrawerMenu({
  drawerOpen,
  translateX,
  isRTL,
  theme,
  mainColor,
  currentTab,
  toggleDrawer,
}: DrawerMenuProps) {
  const { t } = useTranslation();

  const isActive = (tab: string) => currentTab === tab;

  const menuItems = [
    { tab: "index", icon: "document-text" as const, label: t("myNotes"), route: "/" },
    { tab: "TrashPin", icon: "trash" as const, label: t("trash"), route: "./TrashPin" as const },
    { tab: "favorites", icon: "heart" as const, label: t("favorites"), route: "./favorites" as const },
    { tab: "settings", icon: "settings" as const, label: t("settings"), route: "./settings" },
  ];

  const handleNavigate = (route: string) => {
    toggleDrawer();
    router.push(route as any);
  };

  return (
    <>
      {drawerOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleDrawer} />
      )}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            backgroundColor: theme.card,
            right: isRTL ? 0 : undefined,
            left: isRTL ? undefined : 0,
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleDrawer}>
            <Ionicons name="close" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.drawerTitle, { color: theme.primary }]}>
            {t("title")}
          </Text>
        </View>

        <View style={styles.drawerContent}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.tab}
              style={[
                styles.menuItem,
                { flexDirection: isRTL ? "row-reverse" : "row", gap: 10 },
                isActive(item.tab) && { backgroundColor: mainColor + "20" },
                isActive(item.tab) && styles.activeMenuItem,
              ]}
              onPress={() => handleNavigate(item.route)}
            >
              <Ionicons name={item.icon} size={24} color={theme.primary} />
              <Text style={[styles.menuText, { color: theme.primary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

const { width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    position: "absolute",
    top: 0,
    right: 0,
    width: screenWidth * 0.75,
    height: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    paddingTop: 40,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 50,
    textAlign: "right",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  menuItem: {
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuText: {
    fontSize: 18,
    marginRight: 15,
    color: "#333",
  },
  activeMenuItem: {
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});
