import { Feather, Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SharedModal from "../../components/sharedModal";
import { Colors } from "../../Constants/Colors";
import {
  getBodyFont,
  getTitleFont,
  Radius,
  Spacing,
} from "../../Constants/Layout";
import {
  getCachedAvatar,
  getCachedProfileData,
  LAST_USER_ID_KEY,
  refreshProfileData,
  saveAvatarCache,
} from "../../profileService";
import { useAlertStore } from "../../store/useAlertStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotesStore } from "../../store/useNotesStore";
import { useThemeStore } from "../../store/useThemeStore";
import { supabase } from "../../supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ColorPicker, {
  Panel1,
  HueSlider,
  Preview,
} from "reanimated-color-picker";

const FALLBACK_PICKER_COLOR = "#00B4D8";

const normalizePickerColor = (color: unknown): string => {
  if (typeof color !== "string") return FALLBACK_PICKER_COLOR;
  const trimmedColor = color.trim();
  const hexColor = trimmedColor.startsWith("#")
    ? trimmedColor
    : `#${trimmedColor}`;
  return /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(hexColor)
    ? hexColor
    : FALLBACK_PICKER_COLOR;
};

export default function Settings() {
  const { width: windowWidth } = useWindowDimensions();
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);
  const verifySession = useAuthStore((state) => state.verifySession);
  const { t, i18n } = useTranslation();
  const { isDarkMode, themeMode, setThemeMode, setMainColor, setCustomColor } =
    useThemeStore();
  const mainColor = useThemeStore((state) => state.mainColor);
  const colorKey = useThemeStore((state) => state.colorKey);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const isRTL = i18n.language === "ar";

  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(() =>
    normalizePickerColor(mainColor),
  );
  const selectedColorRef = useRef(normalizePickerColor(mainColor));
  const [cachedAvatarUri, setCachedAvatarUri] = useState<string | null>(null);
  const [failedAvatarUri, setFailedAvatarUri] = useState<string | null>(null);
  const [hasPreviousLogin, setHasPreviousLogin] = useState(false);
  const isScreenMounted = useRef(true);

  useEffect(() => {
    isScreenMounted.current = true;
    return () => {
      isScreenMounted.current = false;
    };
  }, []);
  // Modals

  useEffect(() => {
    console.log("حالة الجلسة الحالية:", session);
  }, [session]);

  const getContrastingColor = (hexColor: string) => {
    try {
      const hex = hexColor.replace("#", "");
      const fullHex =
        hex.length === 3
          ? hex
              .split("")
              .map((c) => c + c)
              .join("")
          : hex;
      const bigint = parseInt(fullHex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? "#000000" : "#FFFFFF";
    } catch {
      return "#FFFFFF";
    }
  };

  // في ملف Settings.tsx
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadProfileCacheThenRefresh = async () => {
        try {
          const currentSession = session;
          const previousUserId = await AsyncStorage.getItem(LAST_USER_ID_KEY);
          if (!isMounted) return;
          setHasPreviousLogin(!currentSession?.user && !!previousUserId);
          const userId = currentSession?.user.id ?? previousUserId;
          if (!userId) return;

          const [cachedData, cachedAvatar] = await Promise.all([
            getCachedProfileData(userId),
            getCachedAvatar(userId),
          ]);

          if (cachedAvatar) setCachedAvatarUri(cachedAvatar);
          if (cachedData) {
            useAuthStore.getState().setProfile({
              username: cachedData.username || "مستخدم",
              avatar_url: cachedData.avatar_url || "",
              email:
                currentSession?.user.email ||
                useAuthStore.getState().profile?.email ||
                "",
            });
          }

          if (currentSession?.user) {
            const status = await verifySession();
            if (!isMounted || status === "offline" || status === "invalid")
              return;

            const freshData = await refreshProfileData(userId);
            if (!isMounted || !freshData) return;

            useAuthStore.getState().setProfile({
              username: freshData.username || "مستخدم",
              avatar_url: freshData.avatar_url || "",
              email: currentSession.user.email || "",
            });

            if (freshData.avatar_url) {
              const savedAvatar = await saveAvatarCache(
                userId,
                freshData.avatar_url,
              );
              if (isMounted && savedAvatar) {
                setCachedAvatarUri(savedAvatar);
                setFailedAvatarUri(null);
              }
            }
          }
        } catch (error) {
          console.log("تعذر تحديث بيانات الملف الشخصي بالخلفية.", error);
        }
      };

      void loadProfileCacheThenRefresh();

      return () => {
        isMounted = false;
      };
    }, [session, verifySession]),
  );

  const showAlert = useAlertStore((s) => s.showAlert);

  const handleProtectedNavigation = async (targetRoute: any) => {
    try {
      const state = await NetInfo.fetch();
      if (state.isConnected && state.isInternetReachable !== false) {
        router.push(targetRoute);
      } else {
        showAlert({
          title: t("offline"),
          message: t("offlineAccessError"),
        });
      }
    } catch {}
  };

  const handleDeleteAccount = async () => {
    // 1. فحص الاتصال بالإنترنت مع التعامل مع أي أخطاء متوقعة
    try {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected) {
        showAlert({
          title: t("offline"),
          message: t("needInternetDeleteAccount"),
        });
        return;
      }
    } catch (netError) {
      console.log("NetInfo Check Failed:", netError);
      showAlert({
        title: t("networkCheckFailedTitle"),
        message: t("networkCheckFailedMessage"),
      });
      return;
    }

    // 2. تأكيد الحذف في حال وجود اتصال واستجابة سليمة
    showAlert({
      title: t("deleteAccountConfirmTitle"),
      message: t("deleteAccountConfirmMessage"),
      buttons: [
        { text: t("CAN"), style: "cancel" },
        {
          text: t("DEL"),
          style: "destructive",
          onPress: async () => {
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (user) {
                await supabase.from("notes").delete().eq("user_id", user.id);
                await supabase.rpc("delete_user");
              }

              await AsyncStorage.removeItem(LAST_USER_ID_KEY);
              useAuthStore.getState().clearAuth();
              useNotesStore.setState({ notes: [] });
              await supabase.auth.signOut();

              showAlert({
                title: t("success"),
                message: t("deleteAccountSuccess"),
              });
              router.replace("/Auth/Login");
            } catch (error: any) {
              showAlert({
                title: t("error"),
                message: error.message || t("deleteAccountError"),
              });
            }
          },
        },
      ],
    });
  };

  const remoteAvatarUri =
    profile?.avatar_url && profile.avatar_url.trim() !== ""
      ? profile.avatar_url
      : null;
  const displayedAvatarUri =
    [cachedAvatarUri, remoteAvatarUri].find(
      (uri) => uri && uri !== failedAvatarUri,
    ) || null;
  const avatarSource = displayedAvatarUri
    ? { uri: displayedAvatarUri }
    : require("../../assets/images/user.png");
  const shouldPromptLogin =
    sessionStatus === "invalid" || (hasPreviousLogin && !session);

  const colorsOptions = [
    { id: "teal", hex: "#00B4D8", name: "أزرق مخضر" },
    { id: "green", hex: "#10B981", name: "أخضر" },
    { id: "yellow", hex: "#F59E0B", name: "أصفر" },
    { id: "rose", hex: "#F43F5E", name: "وردي" },
  ];
  const currentColorName =
    colorKey === "custom"
      ? t("customColor")
      : t(`color${colorKey.charAt(0).toUpperCase()}${colorKey.slice(1)}`);
  const renderAppearanceRow = (
    title: string,
    value: string,
    onPress: () => void,
    isLast = false,
  ) => (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.appearanceRow,
        {
          flexDirection: isRTL ? "row-reverse" : "row",
          borderBottomColor: theme.bordersLight,
          borderBottomWidth: isLast ? 0 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.appearanceRowTitle,
          { color: theme.primary, fontFamily: getBodyFont(isRTL) },
        ]}
      >
        {title}
      </Text>
      <View
        style={[
          styles.appearanceRowValueContainer,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <Text
          style={[
            styles.appearanceRowValue,
            { color: theme.tertiary, fontFamily: getBodyFont(isRTL) },
          ]}
        >
          {value}
        </Text>
        <Ionicons
          name={isRTL ? "chevron-back" : "chevron-forward"}
          size={20}
          color={theme.tertiary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {t("settings")}
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[styles.content, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.profileImage,
                {
                  backgroundColor: theme.background,
                  flexDirection: isRTL ? "row-reverse" : "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingHorizontal: Spacing.xl,
                  marginTop: Spacing.xl,
                  gap: Spacing.md,
                },
              ]}
            >
              <Image
                source={avatarSource}
                style={[styles.Image, { borderColor: mainColor }]}
                cachePolicy="disk"
                onLoad={() => {
                  const userId = session?.user.id;
                  if (
                    !userId ||
                    !remoteAvatarUri ||
                    displayedAvatarUri !== remoteAvatarUri
                  )
                    return;
                  void saveAvatarCache(userId, remoteAvatarUri).then(
                    (savedUri) => {
                      if (isScreenMounted.current && savedUri) {
                        setCachedAvatarUri(savedUri);
                        setFailedAvatarUri(null);
                      }
                    },
                  );
                }}
                onError={() => {
                  if (displayedAvatarUri)
                    setFailedAvatarUri(displayedAvatarUri);
                }}
              />
              <View style={[styles.profileInfo, { flexShrink: 1 }]}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: theme.primary,
                    fontFamily: getTitleFont(isRTL),
                    textAlign: isRTL ? "right" : "left",
                    writingDirection: isRTL ? "rtl" : "ltr",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {profile?.username ||
                    session?.user?.user_metadata?.full_name ||
                    "مستخدم ريشة"}
                </Text>
                <Text
                  style={{
                    color: theme.secondary,
                    fontSize: 14,
                    fontFamily: getBodyFont(isRTL),
                    textAlign: isRTL ? "right" : "left",
                    writingDirection: isRTL ? "rtl" : "ltr",
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {/* ⚡ القراءة من profile.email أولاً تضمن ظهور الإيميل أوفلاين ولحظياً بدون flicker */}
                  {profile?.email || session?.user?.email || "غير مسجل"}
                </Text>
                {shouldPromptLogin && (
                  <TouchableOpacity
                    onPress={() => router.push("/Auth/Login")}
                    accessibilityRole="button"
                    accessibilityLabel="تسجيل الدخول"
                    hitSlop={6}
                    style={[
                      styles.profileSessionStatus,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Ionicons
                      name="log-in-outline"
                      size={13}
                      color={mainColor}
                    />
                    <Text
                      style={[
                        styles.profileSessionStatusAction,
                        { color: mainColor },
                      ]}
                    >
                      دخول
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.appearanceSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.primary,
                    fontFamily: getTitleFont(isRTL),
                    fontSize: 16,
                    marginBottom: Spacing.sm,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {t("appearance")}
              </Text>
              <View
                style={[
                  styles.optionsContainer,
                  {
                    borderColor: theme.bordersLight,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                {renderAppearanceRow(
                  t("theme"),
                  t(
                    `themeMode${themeMode.charAt(0).toUpperCase()}${themeMode.slice(1)}`,
                  ),
                  () =>
                    showAlert({
                      title: t("theme"),
                      message: "",
                      buttons: [
                        {
                          text: t("themeModeLight"),
                          onPress: () => setThemeMode("light"),
                        },
                        {
                          text: t("themeModeDark"),
                          onPress: () => setThemeMode("dark"),
                        },
                        {
                          text: t("themeModeSystem"),
                          onPress: () => setThemeMode("system"),
                        },
                      ],
                    }),
                )}
                {renderAppearanceRow(t("appColor"), currentColorName, () =>
                  showAlert({
                    title: t("appColor"),
                    message: "",
                    buttons: [
                      ...colorsOptions.map((color) => ({
                        text: t(
                          `color${color.id.charAt(0).toUpperCase()}${color.id.slice(1)}`,
                        ),
                        onPress: () => setMainColor(color.id as any),
                      })),
                      {
                        text: t("customColor"),
                        onPress: () => {
                          const currentColor = normalizePickerColor(mainColor);
                          selectedColorRef.current = currentColor;
                          setSelectedColor(currentColor);
                          setColorPickerVisible(true);
                        },
                      },
                    ],
                  }),
                )}
                {renderAppearanceRow(
                  t("language"),
                  t(
                    i18n.language === "ar"
                      ? "languageArabic"
                      : "languageEnglish",
                  ),
                  () =>
                    showAlert({
                      title: t("language"),
                      message: "",
                      buttons: [
                        {
                          text: t("languageArabic"),
                          onPress: () => {
                            useThemeStore.getState().setLanguage("ar");
                            i18n.changeLanguage("ar");
                          },
                        },
                        {
                          text: t("languageEnglish"),
                          onPress: () => {
                            useThemeStore.getState().setLanguage("en");
                            i18n.changeLanguage("en");
                          },
                        },
                      ],
                    }),
                  true,
                )}
              </View>
            </View>
            <View style={styles.dataManagementSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.primary,
                    fontFamily: getTitleFont(isRTL),
                    fontSize: 16,
                    marginBottom: Spacing.sm,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {t("AccountManagement")}
              </Text>
              <View
                style={[
                  styles.optionsContainer2,
                  {
                    borderColor: theme.bordersLight,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: theme.primary,
                        fontFamily: getBodyFont(isRTL),
                        textAlign: isRTL ? "right" : "left",
                      },
                    ]}
                  >
                    {t("editProfile")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleProtectedNavigation("/EditProfile")}
                    style={[
                      styles.DeleteBtn,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.borders,
                      },
                    ]}
                  >
                    <Ionicons
                      name="create-outline"
                      size={21}
                      color={mainColor}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.Line, { backgroundColor: theme.bordersLight }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: theme.primary,
                        fontFamily: getBodyFont(isRTL),
                        textAlign: isRTL ? "right" : "left",
                      },
                    ]}
                  >
                    {t("changePassword")}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleProtectedNavigation("../ChangePassword")
                    }
                    style={[
                      styles.DeleteBtn,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.borders,
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={21}
                      color={mainColor}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.Line, { backgroundColor: theme.bordersLight }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: theme.primary,
                        fontFamily: getBodyFont(isRTL),
                        textAlign: isRTL ? "right" : "left",
                      },
                    ]}
                  >
                    {t("deleteAccount")}
                  </Text>
                  <TouchableOpacity
                    onPress={handleDeleteAccount}
                    style={[
                      styles.DeleteBtn,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.destructive,
                      },
                    ]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={21}
                      color={theme.destructive}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.Line, { backgroundColor: theme.bordersLight }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: theme.primary,
                        fontFamily: getBodyFont(isRTL),
                        textAlign: isRTL ? "right" : "left",
                      },
                    ]}
                  >
                    {t("Logout")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      showAlert({
                        title: t("Logout"),
                        message: t("sureLogout"),
                        buttons: [
                          { text: t("CAN"), style: "cancel" },
                          {
                            text: t("Logout"),
                            style: "destructive",
                            onPress: async () => {
                              // Immediately clear local notes and auth
                              try {
                                useNotesStore.setState({ notes: [] });
                              } catch (e) {
                                console.log("Failed to clear notes store:", e);
                              }

                              try {
                                await AsyncStorage.removeItem(LAST_USER_ID_KEY);
                                useAuthStore.getState().clearAuth();
                              } catch (e) {
                                console.log("Failed to clear auth store:", e);
                              }

                              try {
                                router.replace("/Auth/Login");
                              } catch (e) {
                                console.log("Navigation to Login failed:", e);
                              }

                              void supabase.auth
                                .signOut({ scope: "local" })
                                .catch((e) => {
                                  console.log("supabase.signOut() failed:", e);
                                });
                            },
                          },
                        ],
                      });
                    }}
                    style={[
                      styles.DeleteBtn,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.destructive,
                      },
                    ]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={21}
                      color={theme.destructive}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <SharedModal
              visible={colorPickerVisible}
              onRequestClose={() => setColorPickerVisible(false)}
              onClose={() => setColorPickerVisible(false)}
            >
              <View
                style={[
                  styles.colorPickerModal,
                  {
                    width: Math.min(windowWidth - Spacing.xl * 2, 440),
                  },
                  { backgroundColor: theme.card },
                ]}
              >
                <Text style={[styles.titleModal, { color: theme.primary }]}>
                  {" "}
                  {t("chooseColor")}{" "}
                </Text>
                <ColorPicker
                  value={normalizePickerColor(selectedColor)}
                  sliderThickness={28}
                  onChangeJS={(colors: any) => {
                    if (typeof colors?.hex === "string") {
                      selectedColorRef.current = normalizePickerColor(
                        colors.hex,
                      );
                    }
                  }}
                  onCompleteJS={(colors: any) => {
                    if (typeof colors?.hex === "string") {
                      const finalColor = normalizePickerColor(colors.hex);
                      selectedColorRef.current = finalColor;
                      setSelectedColor(finalColor);
                    }
                  }}
                  style={styles.colorPicker}
                >
                  <Panel1 style={styles.panel} thumbSize={28} />
                  <HueSlider style={styles.hueSlider} thumbSize={24} />
                  <Preview
                    style={styles.preview}
                    textStyle={styles.previewText}
                    colorFormat="hex"
                  />
                </ColorPicker>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.LogoutBtn, { backgroundColor: mainColor }]}
                    onPress={() => {
                      setCustomColor(
                        normalizePickerColor(selectedColorRef.current),
                      );
                      setColorPickerVisible(false);
                    }}
                  >
                    <Text
                      style={{
                        color: getContrastingColor(mainColor),
                        fontWeight: "bold",
                      }}
                    >
                      {t("save")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.CancelBtn,
                      { backgroundColor: theme.borders },
                    ]}
                    onPress={() => setColorPickerVisible(false)}
                  >
                    <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                      {t("CAN")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SharedModal>

            <View style={styles.AboutAppSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.primary,
                    fontFamily: getTitleFont(isRTL),
                    fontSize: 16,
                    marginBottom: Spacing.sm,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {t("appInfoSupport")}
              </Text>
              <View
                style={[
                  styles.optionsContainer2,
                  {
                    borderColor: theme.bordersLight,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <Pressable
                  onPress={() => router.push("/about")}
                  style={[
                    styles.options,
                    {
                      flexDirection: isRTL ? "row-reverse" : "row",
                      borderRadius: Radius.xxl,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: theme.primary,
                        fontFamily: getBodyFont(isRTL),
                        textAlign: isRTL ? "right" : "left",
                      },
                    ]}
                  >
                    {t("aboutApp")}
                  </Text>
                  <View
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.borders,
                      },
                    ]}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={21}
                      color={mainColor}
                    />
                  </View>
                </Pressable>
                <View
                  style={[styles.Line, { backgroundColor: theme.bordersLight }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: theme.primary,
                        fontFamily: getBodyFont(isRTL),
                        textAlign: isRTL ? "right" : "left",
                      },
                    ]}
                  >
                    {t("buyDeveloperCoffee")}
                  </Text>
                  <View
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor: theme.background,
                        borderColor: theme.borders,
                      },
                    ]}
                  >
                    <Feather name="coffee" size={21} color={mainColor} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSessionStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
    paddingHorizontal: 6,
    maxWidth: "100%",
  },
  profileSessionStatusText: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    lineHeight: 14,
  },
  profileSessionStatusAction: {
    fontSize: 10,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    right: 0,
    left: 0,
    top: 20,
  },
  Line: {
    height: 1,
  },
  profileImage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  Image: {
    width: 70,
    height: 70,
    flexShrink: 0,
    backgroundColor: "#fff",
    borderRadius: Radius.round,
    borderWidth: 2,
  },
  profileInfo: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    marginLeft: 10,
    marginTop: 0,
    gap: Spacing.xs,
  },
  appearanceSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: 20,
  },
  dataManagementSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: 20,
  },
  AboutAppSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: 20,
  },
  deleteAllButton: {
    position: "absolute",
    right: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: Spacing.sm,
    textAlign: "right",
  },
  optionsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xxl,
    borderWidth: 1,
  },
  optionsContainer2: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xxl,
    borderWidth: 1,
  },
  options: {
    width: "100%",
    minHeight: 52,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  colorsRow: {
    flexDirection: "row",
    gap: 8,
  },
  colorCircle: {
    width: 25,
    height: 25,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  languageRow: {
    flexDirection: "row",
    gap: 20,
  },
  appearanceRow: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  appearanceRowTitle: {
    fontSize: 16,
  },
  appearanceRowValueContainer: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  appearanceRowValue: {
    fontSize: 14,
  },
  Lang: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  ResetBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  DeleteBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 20,
  },
  titleModal: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  textModal: {
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  LogoutBtn: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  CancelBtn: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    borderRadius: 5,
    marginHorizontal: 10,
    fontSize: 16,
    padding: 10,
  },
  DELBtn: {
    fontSize: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  refreshBtn: {
    fontSize: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    marginTop: 5,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  ResBtn: {
    fontSize: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    marginTop: 5,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  colorPickerModal: {
    width: "90%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  colorPicker: {
    width: "100%",
    minHeight: 250,
    marginTop: 10,
  },
  panel: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    marginBottom: 12,
  },
  hueSlider: {
    width: "100%",
    height: 28,
    borderRadius: Radius.round,
    marginTop: Spacing.sm,
    marginBottom: 12,
  },
  preview: {
    width: "100%",
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  previewText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  customCircle: {
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    // kept for backward compatibility if used elsewhere
  },
  customCheckIcon: {
    // kept for backward compatibility if used elsewhere
  },
  About: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12, // مسافة عمودية مريحة
    paddingHorizontal: 24, // مسافة أفقية تعطي الزر عرض مناسب
    borderRadius: 12, // حواف دائرية ناعمة وعصرية (بدل 5 القاسية)
    marginHorizontal: 20, // هوامش أفقية أوسع عشان ما يمتد لأطراف الشاشة
    borderWidth: 1.5, // خط الحدود
  },
});
