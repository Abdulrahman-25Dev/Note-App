import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../supabase';

interface UserProfile {
  username: string;
  avatar_url: string;
  email: string;
}

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      profile: null,

      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),

      // ⚡ عند الخروج يتم تصفير البيانات فوراً لمنع التسريب بين الحسابات
      clearAuth: () => set({ session: null, profile: null }),
    }),
    {
      name: 'auth-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// الاستماع لتغيرات الجلسة مع حماية من أخطاء عدم وجود إنترنت (Offline Safe)
supabase.auth.onAuthStateChange(async (_event, session) => {
  const { setSession, setProfile, clearAuth } = useAuthStore.getState();

  if (session?.user) {
    setSession(session);

    // محاولة تحديث البروفايل في الخلفية إذا وُجد إنترنت
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setProfile({
          username: profile.username || 'مستخدم',
          avatar_url: profile.avatar_url || '',
          email: session.user.email || '',
        });
      }
    } catch (e) {
      // في حالة الأوفلاين يستمر بالبيانات المحفوظة سلفاً في AsyncStorage بدون إظهار خطأ
      console.log('Offline mode: using stored profile');
    }
  } else {
    clearAuth();
  }
});