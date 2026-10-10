import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase";

export type PendingAddNote = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  favorite: boolean;
  deleted: boolean;
  user_id?: string;
};

const STORAGE_KEY = "notes-pending-adds";

let storageOperations = Promise.resolve();
let flushPromise: Promise<void> | null = null;

const withStorageLock = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = storageOperations.then(operation, operation);
  storageOperations = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

const readQueue = async (): Promise<PendingAddNote[]> => {
  const storedQueue = await AsyncStorage.getItem(STORAGE_KEY);
  if (!storedQueue) return [];

  const parsedQueue: unknown = JSON.parse(storedQueue);
  return Array.isArray(parsedQueue) ? (parsedQueue as PendingAddNote[]) : [];
};

export const enqueueAddNote = async (note: PendingAddNote): Promise<void> => {
  await withStorageLock(async () => {
    const queue = await readQueue();
    if (queue.some((queuedNote) => queuedNote.id === note.id)) return;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...queue, note]));
  });
};

export const flushPendingOps = (): Promise<void> => {
  if (flushPromise) return flushPromise;

  flushPromise = (async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) return;

      const queue = await withStorageLock(readQueue);

      for (const note of queue) {
        if (note.user_id && note.user_id !== session.user.id) continue;

        try {
          const { error } = await supabase.from("notes").upsert({
            id: note.id,
            title: note.title,
            content: note.content,
            created_at: note.createdAt,
            user_id: session.user.id,
            favorite: note.favorite,
            deleted: note.deleted,
          });

          if (error) continue;

          await withStorageLock(async () => {
            const latestQueue = await readQueue();
            const remainingQueue = latestQueue.filter(
              (queuedNote) => queuedNote.id !== note.id,
            );
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(remainingQueue),
            );
          });
        } catch (error) {
          console.log("Pending note sync will retry when online.", error);
        }
      }
    } catch (error) {
      console.log("Pending note queue could not be flushed.", error);
    }
  })().finally(() => {
    flushPromise = null;
  });

  return flushPromise;
};
