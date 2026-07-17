import '../i18n/i18n'
import { Slot, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nManager } from 'react-native';
import Splash from "./Splash";

// لإجبار التطبيق ما ينعكس أبداً
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);
export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showSplash) return;
    const check = async () => {
      const done = await AsyncStorage.getItem("onboarding");
      if (!done) {
        router.replace("./Onboarding");
      } else {
        router.replace("/");
      };
    };
    check();
  }, [showSplash]);

  return(
  <SafeAreaProvider>
      {showSplash ? <Splash /> : <Slot />}
  </SafeAreaProvider>
  );
}
