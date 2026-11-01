import { useColorScheme } from "react-native";
import { useThemeStore } from "../store/useThemeStore";

export function useAppTheme() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const systemColorScheme = useColorScheme();

  const isDarkMode =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  return { isDarkMode, themeMode, setThemeMode };
}
