import { create } from 'zustand';
import { supabase } from '../supabase'; // تأكد من أن هذا المسار يؤدي لملف سوبابيس الخاص بك
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));

// هذه الخطوة مهمة جداً: تجعل التطبيق "يسمع" أي تغيير في حالة تسجيل الدخول
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});