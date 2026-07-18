import { supabase } from "./supabase"; // مسار ملف إعداد Supabase الخاص بك

export const fetchProfileData = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateProfileData = async (
  userId: string,
  username: string,
  avatarUrl: string | null,
) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
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
