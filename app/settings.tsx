import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useSegments } from "expo-router";
import { useRef, useState, useEffect } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Switch } from "react-native-paper";
import { useThemeStore } from "../store/useThemeStore";
import { Colors } from "../Constants/Colors";
import { useTranslation } from "react-i18next";
import SharedModal from "../components/sharedModal";
import { useAuthStore } from "../store/useAuthStore";

export default function Settings() {
  const session = useAuthStore((state) => state.session);
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleDarkMode, setMainColor } = useThemeStore();
  const mainColor = useThemeStore((state) => state.mainColor);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const isRTL = i18n.language === "ar";

  const { width } = Dimensions.get("window");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const segments = useSegments();
  const currentTab = segments[1] || "settings";

  // Modals
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    console.log("حالة الجلسة الحالية:", session);
  }, [session]);

  // دالة لفتح وإغلاق الـ drawer
  const toggleDrawer = () => {
    const toValue = drawerOpen ? 0 : 1;
    setDrawerOpen(!drawerOpen);
    Animated.timing(animatedValue, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isRTL ? [width, 0] : [-width, 0],
  });

  const colorsOptions = [
    { id: "teal", hex: "#00B4D8", name: "أزرق مخضر" },
    { id: "purple", hex: "#8B5CF6", name: "أرجواني" },
    { id: "green", hex: "#10B981", name: "أخضر" },
    { id: "yellow", hex: "#F59E0B", name: "أصفر" },
    { id: "rose", hex: "#F43F5E", name: "وردي" },
  ];

  const Drawer = () => {
    const isActive = (tab: string) => currentTab === tab;
    return (
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
            backgroundColor: theme.card,
            right: isRTL ? 0 : undefined,
            left: isRTL ? undefined : 0,
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleDrawer}>
            <Ionicons name="close" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.drawerTitle, { color: theme.primary }]}>
            {t("title")}
          </Text>
        </View>

        <View style={styles.drawerContent}>
          <TouchableOpacity
            style={[
              styles.menuItem,
              { flexDirection: isRTL ? "row-reverse" : "row" },
              isActive("index") && styles.activeMenuItem,
            ]}
            onPress={() => {
              toggleDrawer();
              router.push("/");
            }}
          >
            <Ionicons name="document-text" size={24} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.primary }]}>
              {t("myNotes")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { flexDirection: isRTL ? "row-reverse" : "row" },
              isActive("TrashPin") && styles.activeMenuItem,
            ]}
            onPress={() => {
              toggleDrawer();
              router.push("./TrashPin" as any);
            }}
          >
            <Ionicons name="trash" size={24} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.primary }]}>
              {t("trash")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { flexDirection: isRTL ? "row-reverse" : "row" },
              isActive("favorites") && styles.activeMenuItem,
            ]}
            onPress={() => {
              toggleDrawer();
              router.push("./favorites" as any);
            }}
          >
            <Ionicons name="heart" size={24} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.primary }]}>
              {t("favorites")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { flexDirection: isRTL ? "row-reverse" : "row" },
              isActive("settings") && styles.activeMenuItem,
              { backgroundColor: mainColor + "20" },
            ]}
            onPress={() => {
              toggleDrawer();
              router.push("./settings");
            }}
          >
            <Ionicons name="settings" size={24} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.primary }]}>
              {t("settings")}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {t("settings")}
          </Text>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[styles.content, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.profileImage,
                { backgroundColor: theme.background },
              ]}
            >
              <Image
                source={{
                  uri:
                    session?.user?.user_metadata.avatar_url ||
                    "https://ui-avatars.com/api/?name=" +
                      (session?.user?.user_metadata.full_name || "User"),
                }}
                style={[styles.Image, { borderColor: mainColor }]}
              />
              <View style={[styles.profileInfo, {flexShrink:1}]}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: theme.primary,
                  }}
                >
                  {session?.user?.user_metadata?.full_name || "مستخدم ريشة"}
                </Text>
                <Text style={{ color: theme.secondary }} ellipsizeMode="tail">
                  {session?.user?.email || "غير مسجل"}
                </Text>
              </View>
            </View>

            <View style={styles.appearanceSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.secondary,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {t("appearance")}
              </Text>
              <View
                style={[
                  styles.optionsContainer,
                  { borderColor: theme.borders, backgroundColor: theme.card },
                ]}
              >
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borders,
                      borderRadius: 30,
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.primary }]}>
                    {t("theme")}
                  </Text>
                  <Switch
                    style={styles.switch}
                    trackColor={{ false: "#767577", true: mainColor }}
                    thumbColor={isDarkMode ? theme.primary : "#f4f3f4"}
                    value={isDarkMode}
                    onValueChange={toggleDarkMode} // عند الضغط، يغير الوضع الليلي في الـ store
                  />
                </View>
                <View
                  style={[styles.Line, { backgroundColor: theme.borders }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                    { backgroundColor: theme.card, borderColor: theme.borders },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.primary }]}>
                    {t("appColor")}
                  </Text>
                  <View
                    style={[
                      styles.colorsRow,
                      { flexDirection: isRTL ? "row" : "row-reverse" },
                    ]}
                  >
                    {colorsOptions.map((color) => {
                      const isSelected = mainColor === color.hex;
                      return (
                        <TouchableOpacity
                          key={color.id}
                          style={[
                            styles.colorCircle,
                            { backgroundColor: color.hex },
                            ,
                          ]}
                          onPress={() => setMainColor(color.id as any)}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={24}
                              color={theme.primary}
                              style={{ position: "absolute", top: 0, right: 0 }}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <View
                  style={[styles.Line, { backgroundColor: theme.borders }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                    { backgroundColor: theme.card, borderColor: theme.borders },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.primary }]}>
                    {t("language")}
                  </Text>
                  <View style={styles.languageRow}>
                    <TouchableOpacity
                      style={[
                        styles.Lang,
                        i18n.language === "ar"
                          ? { borderColor: mainColor }
                          : { borderColor: theme.borders },
                      ]}
                      onPress={() => {
                        useThemeStore.getState().setLanguage("ar");
                        i18n.changeLanguage("ar");
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.primary, fontWeight: "bold" },
                        ]}
                      >
                        ع
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.Lang,
                        i18n.language === "en"
                          ? { borderColor: mainColor }
                          : { borderColor: theme.borders },
                      ]}
                      onPress={() => {
                        useThemeStore.getState().setLanguage("en");
                        i18n.changeLanguage("en");
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.primary, fontWeight: "bold" },
                        ]}
                      >
                        En
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.dataManagementSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.secondary,
                    marginRight: 20,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {t("AccountManagement")}
              </Text>
              <View
                style={[
                  styles.optionsContainer2,
                  { borderColor: theme.borders, backgroundColor: theme.card },
                ]}
              >
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.primary }]}>
                    {t("editProfile")}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.DeleteBtn,
                      { backgroundColor: theme.card, borderColor: mainColor },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={24}
                      color={mainColor}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.Line, { backgroundColor: theme.borders }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.primary }]}>
                    {t("changePassword")}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.DeleteBtn,
                      { backgroundColor: theme.card, borderColor: mainColor },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={24}
                      color={mainColor}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.Line, { backgroundColor: theme.borders }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.primary }]}>
                    {t("deleteAccount")}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.DeleteBtn,
                      { backgroundColor: "red", borderColor: theme.borders },
                    ]}
                  >
                    <Ionicons name="trash-outline" size={24} color={"white"} />
                  </TouchableOpacity>
                </View>
                <View
                  style={[styles.Line, { backgroundColor: theme.borders }]}
                />
                <View
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.primary }]}>
                    {t("Logout")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setLogoutModal(true)}
                    style={[
                      styles.DeleteBtn,
                      { backgroundColor: "red", borderColor: theme.borders },
                    ]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={24}
                      color={"white"}
                    />
                  </TouchableOpacity>
                  <SharedModal
                    visible={logoutModal}
                    onRequestClose={() => setLogoutModal(false)}
                    onClose={() => setLogoutModal(false)}
                  >
                    <View
                      style={[
                        styles.modalContainer,
                        { backgroundColor: theme.card },
                      ]}
                    >
                      <Text
                        style={[styles.titleModal, { color: theme.primary }]}
                      >
                        {t("Logout")}
                      </Text>
                      <Text
                        style={[styles.textModal, { color: theme.primary }]}
                      >
                        {t("sureLogout")}
                      </Text>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[styles.LogoutBtn, { backgroundColor: "red" }]}
                          onPress={() => {
                            router.replace("../Auth/Login");
                            setLogoutModal(false);
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "bold" }}>
                            {t("Logout")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.CancelBtn,
                            { backgroundColor: "#3B82F6" },
                          ]}
                          onPress={() => setLogoutModal(false)}
                        >
                          <Text style={{ color: "white", fontWeight: "bold" }}>
                            {t("CAN")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </SharedModal>
                </View>
              </View>
            </View>

            <View style={styles.AboutAppSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.secondary,
                    marginRight: 20,
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
              >
                {t("aboutApp")}
              </Text>
              <View
                style={[
                  styles.optionsContainer2,
                  { borderColor: theme.borders, backgroundColor: theme.card },
                ]}
              >
                <Pressable
                  onPress={() => router.push("./about")}
                  style={[
                    styles.options,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text style={[styles.optionText, { color: theme.primary }]}>
                    {t("aboutApp")}
                  </Text>
                  <Feather name="info" size={24} color={mainColor} />
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {drawerOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleDrawer} />
      )}
      <Drawer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 2,
    marginBottom: 10,
  },
  menuButton: {
    padding: 5,
    position: "absolute",
    right: 20,
    top: 20,
  },
  profileImage: {
    flexDirection: "row",
    marginBottom: 30,
  },
  Image: {
    width: 70,
    height: 70,
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 50,
    marginTop: 30,
    marginHorizontal: 20,
    borderWidth: 2,
  },
  profileInfo: {
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 10,
  },
  appearanceSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  dataManagementSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  AboutAppSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  deleteAllButton: {
    position: "absolute",
    right: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#999",
    textAlign: "right",
  },
  optionsContainer: {
    paddingHorizontal: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  optionsContainer2: {
    paddingHorizontal: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  options: {
    // 1. تحديد الحجم والتموضع
    width: "92%", // يطابق نفس عرض الكرت اللي فوقه بالتمام
    alignSelf: "center",

    // 2. المسافات الداخلية الفخمة (الـ Padding)
    paddingVertical: 16, // تعطي ارتفاع مريح للزر عند الضغط

    // 3. الخلفية والحواف (سر التناسق بصرياً مع مقادير)
    borderRadius: 16, // حواف دائرية ناعمة متطابقة مع الكرت العلوي

    // 4. ترتيب محاذاة العناصر داخل الزر
    alignItems: "center",
    justifyContent: "space-between",

    // 5. ظل خفيف لإعطاء لمسة فخامة
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    // إذا كان لديك fontFamily مخصص للخط العربي أضفه هنا
  },
  colorsRow: {
    flexDirection: "row",
    gap: 8,
  },
  colorCircle: {
    width: 25,
    height: 25,
    borderRadius: 50,
  },
  languageRow: {
    flexDirection: "row",
    gap: 20,
  },
  Lang: {
    padding: 10,
    borderRadius: 5,
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
  drawer: {
    flex: 1,
    position: "absolute",
    top: 0,
    right: 0,
    width: Dimensions.get("window").width * 0.75,
    height: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    paddingTop: 40,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 50,
    textAlign: "right",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  activeMenuItem: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  menuText: {
    fontSize: 18,
    marginRight: 15,
    color: "#333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  ResetBtn: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    marginTop: 5,
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 10,
  },
  DeleteBtn: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    marginTop: 5,
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 10,
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
