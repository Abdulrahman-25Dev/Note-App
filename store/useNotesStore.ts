import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string; 
  favorite: boolean;
  deleted: boolean;
};

type NotesState = {
  notes: Note[];
  addNote: (data: { title: string; content: string }) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  deletepermanentlyNote: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateNote: (id: string, data: { title: string; content: string }) => void;
  deleteAllNotes: () => void;
  removeAllFavorites: () => void;
  deleteAllDeleted: () => void;
  restoreAllDeleted: () => void;
};

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],

      // دالة الإضافة (title + content)
      addNote: ({ title, content }) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              id: Date.now().toString(),
              title,
              content,
              createdAt: new Date().toISOString(),
              favorite: false,
              deleted: false,
            },
          ],
        })),

      // دالة الحذف
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, deleted: true } : note)),
        }));
      },
      // دالة استعادة
      restoreNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, deleted: false } : note)),
        }));
      },
      // دالة الحذف دائم
      deletepermanentlyNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      // دالة المفضلة 
      
      toggleFavorite: (id) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, favorite: !note.favorite } : note)),
        }));
      },
      // دالة التحديث
      
      updateNote: (id, { title, content }) => {
        set((state) => ({
          notes: state.notes.map((note) => (note.id === id ? { ...note, title, content } : note)),
        }));
      },
      // دالة حذف الكل
      
      deleteAllNotes: () => {
        set((state) => ({
          notes: state.notes.map((note) => !note.deleted ? { ...note, deleted: true } : note),
        }))
      },
      // دالة حذف كل المفضلات
      removeAllFavorites: () => {
        set((state) => ({
          notes: state.notes.map((note) => !note.deleted && note.favorite ? { ...note, favorite: false } : note),
        }))
      },
      // دالة حذف كل المحذوفات
      deleteAllDeleted: () => {
        set((state) => ({
          notes: state.notes.filter((note) => !note.deleted),
        }))
      },
      // دالة استعادة كل المحذوفات
      restoreAllDeleted: () => {
        set((state) => ({
          notes: state.notes.map((note) => note.deleted ? { ...note, deleted: false } : note),
        }))
      },
      
    }),
    {
      name: "notes-storage", // التخزين التلقائي
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
