import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";
import { supabase } from "./supabase"; // مسار ملف إعداد Supabase الخاص بك

const LEGACY_PROFILE_CACHE_KEY = "@user_profile_data";
export const LAST_USER_ID_KEY = "@last_user_id";
const PROFILE_CACHE_KEY = (userId: string) => `@user_profile_data_${userId}`;
const AVATAR_CACHE_KEY = (userId: string) => `@user_avatar_path_${userId}`;
const avatarDirectory = new Directory(Paths.document, "avatars");

export type CachedProfileData = {
  username?: string | null;
  avatar_url?: string | null;
  updated_at?: string;
};

export const migrateLegacyProfileCache = async (
  userId: string,
): Promise<CachedProfileData | null> => {
  const previousUserId = await AsyncStorage.getItem(LAST_USER_ID_KEY);
  if (previousUserId !== userId) return null;

  const legacyData = await AsyncStorage.getItem(LEGACY_PROFILE_CACHE_KEY);
  if (!legacyData) return null;

  const parsedData = JSON.parse(legacyData) as CachedProfileData;
  await AsyncStorage.setItem(
    PROFILE_CACHE_KEY(userId),
    JSON.stringify(parsedData),
  );
  await AsyncStorage.removeItem(LEGACY_PROFILE_CACHE_KEY);
  return parsedData;
};

export const getCachedProfileData = async (
  userId: string,
): Promise<CachedProfileData | null> => {
  try {
    const localData = await AsyncStorage.getItem(PROFILE_CACHE_KEY(userId));
    if (localData) return JSON.parse(localData) as CachedProfileData;

    return await migrateLegacyProfileCache(userId);
  } catch (error) {
    console.log("خطأ في قراءة الكاش المحلي:", error);
    return null;
  }
};

export const refreshProfileData = async (
  userId: string,
): Promise<CachedProfileData | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    await AsyncStorage.setItem(PROFILE_CACHE_KEY(userId), JSON.stringify(data));
    return data;
  } catch (error) {
    console.log("تعذر تحديث بيانات الملف الشخصي من السيرفر.", error);
    return null;
  }
};

export const fetchProfileData = async (userId: string) => {
  const cachedData = await getCachedProfileData(userId);
  if (cachedData) return cachedData;
  return refreshProfileData(userId);
};

export const getCachedAvatar = async (
  userId: string,
): Promise<string | null> => {
  try {
    const cachedUri = await AsyncStorage.getItem(AVATAR_CACHE_KEY(userId));
    if (!cachedUri) return null;

    const cachedFile = new File(cachedUri);
    return cachedFile.exists ? cachedFile.uri : null;
  } catch (error) {
    console.log("تعذر قراءة صورة الملف الشخصي المخزنة.", error);
    return null;
  }
};

export const saveAvatarCache = async (
  userId: string,
  sourceUri: string,
): Promise<string | null> => {
  try {
    avatarDirectory.create({ idempotent: true, intermediates: true });
    const destination = new File(avatarDirectory, `${userId}.jpg`);
    if (sourceUri === destination.uri && destination.exists) {
      await AsyncStorage.setItem(AVATAR_CACHE_KEY(userId), destination.uri);
      return destination.uri;
    }

    if (/^https?:\/\//i.test(sourceUri)) {
      await File.downloadFileAsync(sourceUri, destination, {
        idempotent: true,
      });
    } else {
      if (destination.exists) destination.delete();
      new File(sourceUri).copy(destination);
    }

    await AsyncStorage.setItem(AVATAR_CACHE_KEY(userId), destination.uri);
    return destination.uri;
  } catch (error) {
    console.log("تعذر حفظ صورة الملف الشخصي محلياً.", error);
    return null;
  }
};

export const saveCachedProfileData = async (
  userId: string,
  username: string,
  avatarUrl: string | null,
): Promise<CachedProfileData> => {
  const profileData: CachedProfileData = {
    username,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  };
  await AsyncStorage.setItem(
    PROFILE_CACHE_KEY(userId),
    JSON.stringify(profileData),
  );
  return profileData;
};

// تأكد من وجود export في البداية لتتمكن من استدعائها في الواجهات
export const updateProfileData = async (
  userId: string,
  newUsername: string,
  newAvatarUrl?: string | null,
) => {
  const cacheKey = PROFILE_CACHE_KEY(userId);

  // 1. تجهيز البيانات الجديدة
  const updatedData = {
    id: userId,
    username: newUsername,
    avatar_url: newAvatarUrl,
    updated_at: new Date().toISOString(),
  };

  try {
    // 2. تحديث الكاش المحلي فوراً (Offline-First)
    await AsyncStorage.setItem(cacheKey, JSON.stringify(updatedData));

    // 3. إرسال التحديث لـ Supabase
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        ...updatedData,
      })
      .select()
      .single();

    if (error) throw error;

    // نرجع البيانات الجديدة ليستخدمها الـ Component
    return { success: true, data: data || updatedData };
  } catch (error: any) {
    console.error("خطأ أثناء تحديث الملف الشخصي:", error.message);
    // حتى لو فشل النت، نرجع نجاح حفظ الكاش المحلي
    return { success: true, data: updatedData, offline: true };
  }
};

// دالة لرفع الصورة
export const uploadAvatar = async (userId: string, fileUri: string) => {
  const formData = new FormData();

  // استخراج اسم الملف وامتداده
  const fileExt = fileUri.split(".").pop()?.toLowerCase() ?? "png";
  // تأكد أن اسم الملف يتضمن الـ ID ليتطابق مع السياسة أعلاه
  const fileName = `${userId}/${Date.now()}.png`;

  // إنشاء كائن الملف للمتصفح/التطبيق
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: `image/${fileExt}`,
  } as any);

  // الرفع باستخدام FormData
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, formData, {
      upsert: true,
      contentType: `image/${fileExt}`, // تحديد النوع هنا مهم جداً
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  // في دالة uploadAvatar، عدل سطر الإرجاع:
  return `${publicUrlData.publicUrl}?t=${Date.now()}`;
};
