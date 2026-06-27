import '../i18n/i18n'
import { Slot, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nManager } from 'react-native';

// لإجبار التطبيق ما ينعكس أبداً
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);
export default function RootLayout() {

  

  useEffect(() => {
    const check = async () => {
      const done = await AsyncStorage.getItem("onboarding");
      if (!done) {
        router.replace("./onboarding/step1");
      } else {
        router.replace("/");
      };
    };
    check();
  }, []);

  return(
  <SafeAreaProvider>
      <Slot />
  </SafeAreaProvider>
  );
}
