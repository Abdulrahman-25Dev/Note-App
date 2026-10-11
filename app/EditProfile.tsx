import { useThemeStore } from "@/store/useThemeStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker"; // استيراد مكتبة اختيار الصور
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getCachedAvatar,
  getCachedProfileData,
  LAST_USER_ID_KEY,
  refreshProfileData,
  saveAvatarCache,
  saveCachedProfileData,
  updateProfileData,
  uploadAvatar,
} from "../profileService";
import { useAlertStore } from "../store/useAlertStore";
import { useAuthStore } from "../store/useAuthStore";
import i18n from "@/i18n/i18n";

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // رابط الصورة من Supabase
  const [localImageUri, setLocalImageUri] = useState<string | null>(null); // رابط الصورة المحلية المختارة
  const { t } = useTranslation();
  const showAlert = useAlertStore((s) => s.showAlert);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { mainColor } = useThemeStore();
  const authProfile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);
  const verifySession = useAuthStore((state) => state.verifySession);
  const [cachedAvatarUri, setCachedAvatarUri] = useState<string | null>(null);
  const [failedAvatarUri, setFailedAvatarUri] = useState<string | null>(null);
  const isFocusedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      isFocusedRef.current = true;

      const loadCachedProfile = async () => {
        try {
          const currentSession = session;
          const userId =
            currentSession?.user.id ??
            (await AsyncStorage.getItem(LAST_USER_ID_KEY));
          if (!userId) return;

          const [profile, avatar] = await Promise.all([
            getCachedProfileData(userId),
            getCachedAvatar(userId),
          ]);

          if (!isFocused) return;
          if (profile) {
            setUsername(profile.username || "");
            setAvatarUrl(profile.avatar_url ?? null);
          } else {
            const storedProfile = useAuthStore.getState().profile;
            if (storedProfile) {
              setUsername(storedProfile.username);
              setAvatarUrl(storedProfile.avatar_url || null);
            }
          }
          if (avatar) setCachedAvatarUri(avatar);
          setLoading(false);

          if (!currentSession?.user) return;

          const status = await verifySession();
          if (!isFocused || status === "offline" || status === "invalid") return;

          const freshProfile = await refreshProfileData(userId);
          if (!isFocused || !freshProfile) return;

          setUsername(freshProfile.username || "");
          setAvatarUrl(freshProfile.avatar_url ?? null);
          useAuthStore.getState().setProfile({
            username: freshProfile.username || "مستخدم",
            avatar_url: freshProfile.avatar_url || "",
            email: currentSession.user.email || "",
          });

          if (freshProfile.avatar_url) {
            const savedAvatar = await saveAvatarCache(
              userId,
              freshProfile.avatar_url,
            );
            if (isFocused && savedAvatar) setCachedAvatarUri(savedAvatar);
          }
        } catch (error) {
          console.log("تعذر تحميل بيانات الملف الشخصي.", error);
        } finally {
          if (isFocused) setLoading(false);
        }
      };

      void loadCachedProfile();
      return () => {
        isFocused = false;
        isFocusedRef.current = false;
      };
    }, [session, verifySession]),
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
      if (!isFocusedRef.current) return;
      const selectedUri = result.assets[0].uri;
      setLocalImageUri(selectedUri);
      setFailedAvatarUri(null);
      const userId = session?.user.id;
      if (userId) {
        void saveAvatarCache(userId, selectedUri).then((savedUri) => {
          if (isFocusedRef.current && savedUri) setCachedAvatarUri(savedUri);
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const currentSession = useAuthStore.getState().session;
      const userId =
        currentSession?.user.id ?? (await AsyncStorage.getItem(LAST_USER_ID_KEY));
      const currentEmail =
        useAuthStore.getState().profile?.email ||
        currentSession?.user?.email ||
        "";

      if (!userId) return;

      const localAvatar = localImageUri
        ? await saveAvatarCache(userId, localImageUri)
        : null;
      const displayAvatar = localAvatar || cachedAvatarUri || avatarUrl || "";
      await saveCachedProfileData(userId, username, displayAvatar);

      const currentProfile = useAuthStore.getState().profile;

      useAuthStore.setState({
        profile: {
          ...(currentProfile || { email: currentEmail }),
          username: username,
          avatar_url: displayAvatar,
        },
      });

      showAlert({ title: t("success"), message: t("profileUpdated") });

      router.back();

      (async () => {
        try {
          let finalAvatarUrl = avatarUrl || "";

          if (localImageUri && currentSession?.user) {
            const uploadedUrl = await uploadAvatar(userId, localImageUri);
            finalAvatarUrl = `${uploadedUrl}?t=${Date.now()}`;
          }

          if (currentSession?.user) {
            await updateProfileData(userId, username, finalAvatarUrl);
          }

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

  const isRTL = i18n.language === "ar"; // التحقق من اتجاه اللغة

  if (loading)
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;

  const remoteAvatarUri = avatarUrl || authProfile?.avatar_url || null;
  const displayedAvatarUri =
    [localImageUri, cachedAvatarUri, remoteAvatarUri].find(
      (uri) => uri && uri !== failedAvatarUri,
    ) || null;
  const imageSource = displayedAvatarUri
    ? { uri: displayedAvatarUri }
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
            cachePolicy="disk"
            onLoad={() => {
              const userId = session?.user.id;
              if (
                !userId ||
                !remoteAvatarUri ||
                displayedAvatarUri !== remoteAvatarUri
              ) return;
              void saveAvatarCache(userId, remoteAvatarUri).then((savedUri) => {
                if (isFocusedRef.current && savedUri) {
                  setCachedAvatarUri(savedUri);
                  setFailedAvatarUri(null);
                }
              });
            }}
            onError={() => {
              if (displayedAvatarUri) setFailedAvatarUri(displayedAvatarUri);
            }}
          />
          <Text style={[styles.changePhotoText, { color: mainColor }]}>
            {t("changePhoto")}
          </Text>
        </TouchableOpacity>

        {/* جزء الاسم */}
        <Text style={[styles.label, isRTL && { textAlign: "right" }]}>{t("username")}</Text>
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
