import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// قم بتعديل هذا المسار ليتطابق مع ملف إعداد سوبابيس الخاص بك
import { supabase } from "../supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { enqueueAddNote, flushPendingOps } from "./pendingQueue";
import { useAuthStore } from "./useAuthStore";
type Note = {
  id: string; // معرف فريد UUID
  title: string;
  content: string;
  createdAt: string;
  favorite: boolean;
  pinned: boolean;
  deleted: boolean;
  user_id?: string;
};

type NotesState = {
  notes: Note[];
  fetchNotes: () => Promise<void>;
  addNote: (data: { title: string; content: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deletepermanentlyNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  updateNote: (
    id: string,
    data: { title: string; content: string },
  ) => Promise<void>;
  deleteAllNotes: () => Promise<void>;
  removeAllFavorites: () => Promise<void>;
  deleteAllDeleted: () => Promise<void>;
  restoreAllDeleted: () => Promise<void>;
};

// دالة ذكية لتوليد UUID متوافق مع قاعدة البيانات محلياً دون إنترنت
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      // جلب المذكرات من سوبابيس عند توفر الإنترنت
      fetchNotes: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session?.user) return;

          // 1️⃣ جلب الملاحظات الموجودة حالياً في ذاكرة الجهاز المحلية
          const localNotes = (get().notes || []).map((note) => ({
            ...note,
            pinned: note.pinned || false,
          }));

          // 2️⃣ جلب بيانات السيرفر
          const { data: serverNotes, error } = await supabase
            .from("notes")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (serverNotes) {
            const serverIds = new Set(serverNotes.map((n: any) => n.id));

            // 3️⃣ كشف الملاحظات التي تم إضافتها أوفلاين ولم تصل السيرفر بعد
            const offlineCreatedNotes = localNotes.filter(
              (n: any) => !serverIds.has(n.id),
            );

            // 4️⃣ رفع الملاحظات الجديدة أوفلاين إلى السيرفر في الخلفية
            if (offlineCreatedNotes.length > 0) {
              const notesToUpload = offlineCreatedNotes.map((n: any) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                user_id: session.user.id,
                favorite: n.favorite,
                pinned: n.pinned || false,
                deleted: n.deleted,
              }));

              await supabase.from("notes").upsert(notesToUpload);
            }

            // 5️⃣ الدمج الذكي:
            // الملاحظات المحلية لها الأولوية لتغطية التعديلات (Update/Favorite/Delete) التي حدثت أوفلاين
            const localNotesMap = new Map(
              localNotes.map((n: any) => [n.id, n]),
            );

            // تحويل بيانات السيرفر لتنسيق المتجر
            const formattedServerNotes = serverNotes.map((n: any) => ({
              id: n.id,
              title: n.title || "",
              content: n.content || "",
              createdAt: n.created_at,
              favorite: n.favorite || false,
              pinned: n.pinned || false,
              deleted: n.deleted || false,
              user_id: n.user_id,
            }));

            // ندمج: إذا كان التعديل موجود محلياً نأخذه، وإلا نعتمد بيانات السيرفر
            const mergedNotes = [
              ...offlineCreatedNotes, // الملاحظات الأوفلاين الجديدة أولاً
              ...formattedServerNotes.map(
                (sNote: any) => localNotesMap.get(sNote.id) || sNote,
              ),
            ].sort(
              (first: Note, second: Note) =>
                Number(second.pinned) - Number(first.pinned),
            );

            set({ notes: mergedNotes });
          }
        } catch {
          console.log(
            "Offline mode: Fetching notes from local storage instead.",
          );
        }
      },

      // إضافة مذكرة (محلياً فوراً، وسحابياً في حال توفر الشبكة)
      // إضافة مذكرة جديدة بدون أي رمشة أو تعليق في الواجهة
      addNote: async ({ title, content }) => {
        const localId = generateUUID(); // توليد معرّف فريد UUID محلياً واستخدامه كمعرّف رئيسي دائم
        const createdAt = new Date().toISOString();
        const userId = useAuthStore.getState().session?.user.id;

        const newNote: Note = {
          id: localId,
          title,
          content,
          createdAt,
          favorite: false,
          pinned: false,
          deleted: false,
          user_id: userId,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
        }));

        void enqueueAddNote(newNote)
          .then(() => flushPendingOps())
          .catch((error) => {
            console.log("Could not persist pending note operation.", error);
          });
      },

      // نقل المذكرة للمحذوفات
      deleteNote: async (id) => {
        // تحديث محلي فوري
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, deleted: true } : note,
          ),
        }));

        // محاولة التحديث في السحابة
        try {
          await supabase.from("notes").update({ deleted: true }).eq("id", id);
        } catch {
          console.log("Offline change: delete noted locally.");
        }
      },

      // استعادة المذكرة
      restoreNote: async (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, deleted: false } : note,
          ),
        }));

        try {
          await supabase.from("notes").update({ deleted: false }).eq("id", id);
        } catch {
          console.log("Offline change: restored note locally.");
        }
      },

      // حذف المذكرة نهائياً
      deletepermanentlyNote: async (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));

        try {
          await supabase.from("notes").delete().eq("id", id);
        } catch {
          console.log("Offline change: permanently deleted note locally.");
        }
      },

      // تبديل المفضلة
      toggleFavorite: async (id) => {
        const noteToUpdate = get().notes.find((n) => n.id === id);
        if (!noteToUpdate) return;

        const nextFavoriteState = !noteToUpdate.favorite;
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, favorite: nextFavoriteState } : note,
          ),
        }));

        try {
          await supabase
            .from("notes")
            .update({ favorite: nextFavoriteState })
            .eq("id", id);
        } catch {
          console.log("Offline change: toggled favorite locally.");
        }
      },

      togglePin: async (id) => {
        const noteToUpdate = get().notes.find((note) => note.id === id);
        if (!noteToUpdate) return;

        const nextPinnedState = !noteToUpdate.pinned;
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, pinned: nextPinnedState } : note,
          ),
        }));

        try {
          await supabase
            .from("notes")
            .update({ pinned: nextPinnedState })
            .eq("id", id);
        } catch {
          console.log("Offline change: toggled pin locally.");
        }
      },

      // تحديث المذكرة
      updateNote: async (id, { title, content }) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, title, content } : note,
          ),
        }));

        try {
          await supabase.from("notes").update({ title, content }).eq("id", id);
        } catch {
          console.log("Offline change: updated note locally.");
        }
      },

      // نقل جميع المذكرات للمحذوفات
      deleteAllNotes: async () => {
        set((state) => ({
          notes: state.notes.map((note) =>
            !note.deleted ? { ...note, deleted: true } : note,
          ),
        }));

        try {
          await supabase
            .from("notes")
            .update({ deleted: true })
            .eq("deleted", false);
        } catch {
          console.log("Offline change: deleted all notes locally.");
        }
      },

      // إزالة كل المفضلات
      removeAllFavorites: async () => {
        set((state) => ({
          notes: state.notes.map((note) =>
            !note.deleted && note.favorite
              ? { ...note, favorite: false }
              : note,
          ),
        }));

        try {
          await supabase
            .from("notes")
            .update({ favorite: false })
            .eq("deleted", false)
            .eq("favorite", true);
        } catch {
          console.log("Offline change: removed all favorites locally.");
        }
      },

      // تفريغ سلة المهملات نهائياً
      deleteAllDeleted: async () => {
        set((state) => ({
          notes: state.notes.filter((note) => !note.deleted),
        }));

        try {
          await supabase.from("notes").delete().eq("deleted", true);
        } catch {
          console.log("Offline change: emptied trash locally.");
        }
      },

      // استعادة كل المحذوفات
      restoreAllDeleted: async () => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.deleted ? { ...note, deleted: false } : note,
          ),
        }));

        try {
          await supabase
            .from("notes")
            .update({ deleted: false })
            .eq("deleted", true);
        } catch {
          console.log("Offline change: restored all deleted notes locally.");
        }
      },
    }),
    {
      name: "notes-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
