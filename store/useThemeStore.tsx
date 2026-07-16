import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. تعريف أنواع الألوان المتاحة
export type ColorKey = 'teal' | 'purple' | 'green' | 'yellow' | 'rose';
// 2. تعريف الألوان الثابتة (نفس الدرجات التي اخترناها سابقاً)
export const themeColors: Record<ColorKey, string> = {
  teal: '#00B4D8',
  purple: '#8B5CF6',
  green: '#10B981',
  yellow: '#F59E0B',
  rose: '#F43F5E',

};

// 3. تعريف واجهة البيانات (Interface)
interface ThemeState {
  mainColor: string;      // يحفظ كود الـ Hex للون المختار
  colorKey: ColorKey;     // يحفظ اسم اللون (لتمهيد الاختيار في الإعدادات)
  isDarkMode: boolean;
  setMainColor: (key: ColorKey) => void;
  toggleDarkMode: () => void;
  Language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}


// 4. إنشاء الـ Store
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // القيم الافتراضية
      mainColor: themeColors.rose,
      colorKey: 'teal',
      isDarkMode: true,
      Language: 'ar',
      // تغيير اللغة
      setLanguage: (lang) => 
        set({ 
          Language: lang, 
        }),

      // تغيير لون الهوية
      setMainColor: (key) => 
        set({ 
          colorKey: key, 
          mainColor: themeColors[key],
        }),

      // تبديل الوضع الليلي
      toggleDarkMode: () => 
        set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'app-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);