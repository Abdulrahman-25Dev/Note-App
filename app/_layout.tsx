import "../i18n/i18n";
import { Slot, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { AppState, I18nManager } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Splash from "./Splash";
import CustomAlert from "../components/CustomAlert";
import { flushPendingOps } from "../store/pendingQueue";

// لإجبار التطبيق ما ينعكس أبداً
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);
export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const lastOnlineState = useRef<boolean | null>(null);

  useEffect(() => {
    const isOnline = (state: NetInfoState) =>
      state.isConnected === true && state.isInternetReachable !== false;

    const checkConnectionAndFlush = async () => {
      try {
        const state = await NetInfo.fetch();
        const online = isOnline(state);
        lastOnlineState.current = online;
        if (online) void flushPendingOps();
      } catch (error) {
        console.log("Could not check network state.", error);
      }
    };

    void checkConnectionAndFlush();

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const online = isOnline(state);
      const wasOffline = lastOnlineState.current === false;
      lastOnlineState.current = online;

      if (online && wasOffline) void flushPendingOps();
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") void checkConnectionAndFlush();
      },
    );

    return () => {
      unsubscribeNetInfo();
      appStateSubscription.remove();
    };
  }, []);

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
      }
    };
    check();
  }, [showSplash]);

  return (
    <SafeAreaProvider>
      {showSplash ? <Splash /> : <Slot />}
      <CustomAlert />
    </SafeAreaProvider>
  );
}
