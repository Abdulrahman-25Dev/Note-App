import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

// ميزة التخزين الآمن للجلسة (تلقائياً يحفظ تسجيل الدخول ولا يخرج المستخدم)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// ضع هنا القيم الخاصة بمشروعك التي حصلنا عليها
const SUPABASE_URL = "https://hnadbzlgnyxfbpaaljap.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Dl734ItIqDvAtCHgypV6cQ_QxMkCK_u";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
