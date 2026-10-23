import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs, router } from "expo-router";
import { Fragment } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { getBodyFont } from "../../Constants/Layout";
import { Colors } from "../../Constants/Colors";
import { useThemeStore } from "../../store/useThemeStore";

const tabIcons = {
  index: "document-text",
  favorites: "heart",
  TrashPin: "trash",
  settings: "settings",
} as const;

const tabLabels = {
  index: "myNotes",
  favorites: "favorites",
  TrashPin: "deleted",
  settings: "settings",
} as const;

function getContrastingColor(hexColor: string) {
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
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDarkMode, mainColor } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isRTL = i18n.language === "ar";

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borders,
          height: styles.tabBar.height + insets.bottom + 8,
          paddingHorizontal: 12,
          paddingBottom: insets.bottom + 8,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? mainColor : theme.tertiary;
        const iconName = tabIcons[route.name as keyof typeof tabIcons];
        const labelKey = tabLabels[route.name as keyof typeof tabLabels];
        const { options } = descriptors[route.key];

        if (!iconName || !labelKey) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Fragment key={route.key}>
            {index === 2 && <View style={styles.fabSpace} />}
            <Pressable
              accessibilityRole="tab"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabButton}
            >
              <Ionicons name={iconName} size={22} color={color} />
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color,
                    fontFamily: getBodyFont(isRTL),
                  },
                ]}
              >
                {t(labelKey)}
              </Text>
            </Pressable>
          </Fragment>
        );
      })}
      <View style={styles.fabPosition} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("add")}
          onPress={() => router.push("/Notes/Add")}
          style={[styles.fab, { backgroundColor: mainColor }]}
        >
          <Ionicons
            name="add"
            size={32}
            color={getContrastingColor(mainColor)}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="TrashPin" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    position: "relative",
  },
  tabButton: {
    flex: 1,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  fabSpace: {
    width: 88,
  },
  fabPosition: {
    position: "absolute",
    top: -25,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 10,
  },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
