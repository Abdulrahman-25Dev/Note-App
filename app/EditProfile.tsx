import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker"; // استيراد مكتبة اختيار الصور
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  fetchProfileData,
  updateProfileData,
  uploadAvatar,
} from "../profileService";
import { useAlertStore } from "../store/useAlertStore";
import { useAuthStore } from "../store/useAuthStore";
import { supabase } from "../supabase";

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // رابط الصورة من Supabase
  const [localImageUri, setLocalImageUri] = useState<string | null>(null); // رابط الصورة المحلية المختارة
  const { t } = useTranslation();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { mainColor } = useThemeStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const profile = await fetchProfileData(user.id);
        if (profile) {
          setUsername(profile.username || "");
          setAvatarUrl(profile.avatar_url); // جلب الرابط الحالي من القاعدة
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadUpdatedProfile = async () => {
        try {
          const cachedData = await AsyncStorage.getItem("@user_profile_data");
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            if (parsed.username) setUsername(parsed.username);
            if (parsed.avatar_url) setAvatarUrl(parsed.avatar_url);
          }
        } catch (e) {
          console.error("خطأ قراءة الكاش:", e);
        }
      };

      loadUpdatedProfile();
    }, []),
  );
  // دالة فتح معرض الصور
  const handlePickImage = async () => {
    // طلب أذونات الوصول
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showAlert({ title: t("sorry"), message: t("permissionNeeded") });
        return;
      }
    }

    // فتح المعرض
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // السماح بقص الصورة
      aspect: [1, 1], // جعلها مربعة
      quality: 0.5, // ضغط الصورة لتقليل الحجم
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri); // تخزين المسار المحلي لعرضه فوراً
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1. تحديد بيانات المستخدم مباشرة من الـ Store
      const currentSession = useAuthStore.getState().session;
      const userId = currentSession?.user?.id;
      const currentEmail =
        useAuthStore.getState().profile?.email ||
        currentSession?.user?.email ||
        "";

      if (!userId) return;

      // ⚡ 2. تجهيز الصورة والتأكد من أنها ليست null
      const displayAvatar = localImageUri || avatarUrl || "";

      // 🎯 3. التحديث المباشر للـ Store + الضمان المحلي للـ Cache (الكود الذي سألت عنه)
      const currentProfile = useAuthStore.getState().profile;

      useAuthStore.setState({
        profile: {
          ...(currentProfile || { email: currentEmail }),
          username: username,
          avatar_url: displayAvatar,
        },
      });

      // 📣 4. إظهار تنبيه النجاح للمستخدم
      showAlert({ title: t("success"), message: t("profileUpdated") });

      // 🔙 5. العودة لشاشة الإعدادات
      router.back();

      // 🔄 6. المزامنة في الخلفية (عند توفر الإنترنت)
      (async () => {
        try {
          let finalAvatarUrl = avatarUrl || "";

          // رفع الصورة لو اختار المستخدم صورة جديدة
          if (localImageUri) {
            const uploadedUrl = await uploadAvatar(userId, localImageUri);
            finalAvatarUrl = `${uploadedUrl}?t=${Date.now()}`;
          }

          // تحديث قاعدة البيانات في Supabase
          await updateProfileData(userId, username, finalAvatarUrl);

          // تحديث الـ Store بالرابط النهائي بعد الرفع
          const updatedProfile = useAuthStore.getState().profile;
          if (updatedProfile) {
            useAuthStore.setState({
              profile: {
                ...updatedProfile,
                username: username,
                avatar_url: finalAvatarUrl,
              },
            });
          }
        } catch (asyncErr) {
          console.log("Offline mode: background sync deferred");
        }
      })();
    } catch (error) {
      console.error(error);
      showAlert({ title: t("error"), message: t("saveError") });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;

  // تحديد مصدر الصورة للعرض (الأولوية للمحلية، ثم للرابط القادم من Supabase، ثم Placeholder)
  const imageSource = localImageUri
    ? { uri: localImageUri }
    : avatarUrl
      ? { uri: avatarUrl }
      : require("../assets/images/user.png");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward" size={28} color={mainColor} />
        </TouchableOpacity>
        {/* جزء الصورة */}
        <TouchableOpacity
          style={[styles.avatarContainer]}
          onPress={handlePickImage}
        >
          <Image
            source={imageSource}
            style={[styles.avatar, { borderColor: mainColor }]}
          />
          <Text style={[styles.changePhotoText, { color: mainColor }]}>
            {t("changePhoto")}
          </Text>
        </TouchableOpacity>

        {/* جزء الاسم */}
        <Text style={styles.label}>{t("username")}</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder={t("enterYourName")}
          placeholderTextColor="#666"
        />

        {/* زر الحفظ */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: mainColor }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t("saveChanges")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  content: { padding: 20 },
  avatarContainer: { alignItems: "center", marginVertical: 30 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333",
    borderWidth: 2,
  },
  changePhotoText: {
    color: "#007AFF",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  label: { color: "#fff", fontSize: 16, marginBottom: 10, fontWeight: "600" },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30, // 👈 مراعاة مسافة الـ Status Bar
    right: 16, // 👈 جهة اليمين لتناسب اللغة العربية
    zIndex: 10, // 👈 يضمن أن الزر فوق كل الطبقات وقابل للضغط
    padding: 8,
    borderRadius: 12,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default EditProfile;
