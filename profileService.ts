import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase"; // مسار ملف إعداد Supabase الخاص بك

export const fetchProfileData = async (userId: string) => {
  const cacheKey = `@user_profile_data_${userId}`;

  // 1. قراءة الكاش أولاً وإرجاعه فوراً
  try {
    const localData = await AsyncStorage.getItem(cacheKey);
    if (localData) {
      const cachedData = JSON.parse(localData);
      // نجلب البيانات الجديدة في الخلفية بدون await، عشان ما نأخر العرض
      refreshCacheInBackground(cacheKey, userId);
      return cachedData;
    }
  } catch (e) {
    console.log("خطأ في قراءة الكاش المحلي:", e);
  }

  // 2. أول مرة (ما في كاش)، ننتظر الجلب من السيرفر
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.log("تعذر الاتصال بالسيرفر (أوفلاين).");
  }

  return null;
};

// دالة مساعدة: تحديث الكاش في الخلفية (ما ننتظرها)
const refreshCacheInBackground = async (cacheKey: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    }
  } catch (_) {
    // فشل الاتصال - عادي، عندنا الكاش القديم
  }
};

// تأكد من وجود export في البداية لتتمكن من استدعائها في الواجهات
export const updateProfileData = async (
  userId: string,
  newUsername: string,
  newAvatarUrl?: string | null,
) => {
  const PROFILE_CACHE_KEY = "@user_profile_data";

  // 1. تجهيز البيانات الجديدة
  const updatedData = {
    username: newUsername,
    avatar_url: newAvatarUrl,
    updated_at: new Date().toISOString(),
  };

  try {
    // 2. تحديث الكاش المحلي فوراً (Offline-First)
    await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updatedData));

    // 3. إرسال التحديث لـ Supabase
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
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
