import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "../supabase";

interface UserProfile {
  username: string;
  avatar_url: string;
  email: string;
}

export type SessionStatus = "unknown" | "valid" | "offline" | "invalid";

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  sessionStatus: SessionStatus;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSessionStatus: (status: SessionStatus) => void;
  verifySession: () => Promise<SessionStatus>;
  clearAuth: () => void;
}

const isNetworkFailure = (error: unknown): boolean => {
  if (error instanceof TypeError) return true;
  if (!error || typeof error !== "object") return false;

  const candidate = error as { name?: string; status?: number };
  return candidate.name === "AuthRetryableFetchError" || candidate.status === 0;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get): AuthState => ({
      session: null,
      profile: null,
      sessionStatus: "unknown",

      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setSessionStatus: (sessionStatus) => set({ sessionStatus }),

      verifySession: async (): Promise<SessionStatus> => {
        const { session } = get();
        if (!session) return get().sessionStatus;
        const expectedUserId = session.user.id;

        try {
          const { data, error } = await supabase.auth.getUser();

          if (get().session?.user.id !== expectedUserId) {
            return get().sessionStatus;
          }

          if (!error && data.user) {
            if (data.user.id !== expectedUserId) {
              console.warn(
                "Auth user does not match the locally stored session user.",
              );
              set({ sessionStatus: "invalid" });
              return "invalid";
            }

            set({ sessionStatus: "valid" });
            return "valid";
          }

          if (error?.status === 401) {
            set({ sessionStatus: "invalid" });
            return "invalid";
          }

          if (error && isNetworkFailure(error)) {
            set({ sessionStatus: "offline" });
            return "offline";
          }

          return get().sessionStatus;
        } catch (error) {
          if (get().session?.user.id !== expectedUserId) {
            return get().sessionStatus;
          }

          if (isNetworkFailure(error)) {
            set({ sessionStatus: "offline" });
            return "offline";
          }
          return get().sessionStatus;
        }
      },

      clearAuth: () =>
        set({ session: null, profile: null, sessionStatus: "unknown" }),
    }),
    {
      name: "auth-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setSessionStatus("unknown");
      },
    },
  ),
);

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") return;
  if (!session?.user) return;

  const { setSession, setSessionStatus } = useAuthStore.getState();
  setSession(session);

  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    setSessionStatus("valid");
  }
});
