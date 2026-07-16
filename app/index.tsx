import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useSegments } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../i18n/i18n";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import relativeTime from "dayjs/plugin/relativeTime";
import * as Clipboard from "expo-clipboard";
import { useThemeStore } from "../store/useThemeStore";
import { Colors } from "../Constants/Colors";
import { useTranslation } from "react-i18next";
import SharedModal from "../components/sharedModal";
import { useNotesStore } from "../store/useNotesStore";

export default function Index() {
  useEffect(() => {
    const arabic = i18n.language === "ar";
    dayjs.locale(arabic ? "ar" : "en");
    dayjs.extend(relativeTime);
  }, []);
  const isRTL = i18n.language === "ar";

  const fetchNotes = useNotesStore((state) => state.fetchNotes);

// تعديل الـ useEffect لاستدعاء جلب البيانات من السحاب فور تحميل الصفحة
useEffect(() => {
  const arabic = i18n.language === "ar";
  dayjs.locale(arabic ? "ar" : "en");
  dayjs.extend(relativeTime);
  
  // استدعاء جلب المذكرات من سوبابيس فوراً
  fetchNotes();
}, []);

  // جلب الثيم من الـ store
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const mainColor = useThemeStore((state) => state.mainColor);

  const { width } = Dimensions.get("window");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const segments = useSegments();
  const currentTab = segments[1] || "index";

  const allNotes = useNotesStore((state) => state.notes);
  const notes = allNotes.filter((note) => !note.deleted);
  const [search, setSearch] = useState<string>("");
  // حالة الملاحظات المفضلة لتحديث الأيقونة

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()),
  );
  const toggleFavorite = useNotesStore((s) => s.toggleFavorite);
  // const delteAllNotes = useNotesStore((s) => s.deleteAllNotes);

  const handleFavorite = (id: string) => {
    toggleFavorite(id);
  };
  const Add = () => {
    router.push("/Notes/Add");
  };

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

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("تم النسخ", " تم نسخ المحتوى الى الحافظة", [{ text: "حسنا" }]);
  };

  const { t } = useTranslation();
  const deleteAllNotes = useNotesStore((state) => state.deleteAllNotes);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllNotes = () => {
    deleteAllNotes();
    setShowDeleteModal(false);
    router.push("/");
  };

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
        <View style={[styles.drawerHeader]}>
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
              { flexDirection: isRTL ? "row-reverse" : "row", gap: 10 },
              isActive("index") && styles.activeMenuItem,
              { backgroundColor: mainColor + "20" },
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
              { flexDirection: isRTL ? "row-reverse" : "row", gap: 10 },
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
              { flexDirection: isRTL ? "row-reverse" : "row", gap: 10 },
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
              { flexDirection: isRTL ? "row-reverse" : "row", gap: 10 },
              isActive("settings") && styles.activeMenuItem,
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
          <Pressable
            onPress={() => setShowDeleteModal(true)}
            style={[styles.headerActionButton, { backgroundColor: theme.card }]}
          >
            <Ionicons name="trash" size={22} color={"#DAA7A3"} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {t("myNotes")}{" "}
          </Text>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        {/* ======= END HEADER ===== */}

        {/*======= SHOW NOTES =======*/}
        <View style={[styles.showNotes, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.searchbar,
              {
                backgroundColor: theme.card,
                borderColor: mainColor,
                borderWidth: 0.5,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={mainColor}
              style={{ marginLeft: 8 }}
            />
            <TextInput
              value={search}
              onChangeText={(text) => setSearch(text)}
              placeholder={t("search")}
              style={[styles.search, { color: theme.primary }]}
              textAlign="right"
              placeholderTextColor={theme.secondary}
            />
          </View>
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.noteContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.note,
                    {
                      backgroundColor: theme.card,
                      elevation: 5,
                      borderColor: mainColor,
                    },
                  ]}
                  onPress={() => {
                    router.push(`/Notes/${item.id}`);
                  }}
                  onLongPress={() =>
                    handleCopy(`${item.title}\n${item.content}`)
                  }
                >
                  <TouchableOpacity
                    onPress={() => handleFavorite(item.id)}
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: 10,
                      zIndex: 1,
                    }}
                  >
                    <Ionicons
                      name={item.favorite ? "heart" : "heart-outline"}
                      size={24}
                      color={mainColor}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[styles.noteTitle, { color: theme.primary }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.noteContent, { color: theme.secondary }]}
                    numberOfLines={1}
                  >
                    {item.content}
                  </Text>
                  <Text style={[styles.noteDate, { color: theme.secondary }]}>
                    {dayjs(item.createdAt).fromNow()}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => {
              return (
                <View>
                  {search.length > 0 ? (
                    <Text style={[styles.noNotes, { color: theme.primary }]}>
                      {t("noFoundNotes")}
                    </Text>
                  ) : (
                    <Text style={[styles.noNotes, { color: theme.primary }]}>
                      {t("noNotes")}
                    </Text>
                  )}
                </View>
              );
            }}
          />
          <TouchableOpacity
            style={[styles.Add, { backgroundColor: mainColor }]}
            onPress={Add}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
        <SharedModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.titleModal, { color: theme.primary }]}>
              {t("DELALLNotes")}
            </Text>
            <Text style={[styles.textModal, { color: theme.primary }]}>
              {t("sureDELAllNotes")}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalDeleteBtn, { backgroundColor: "#DC2626" }]}
                onPress={handleDeleteAllNotes}
              >
                <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                  {t("DEL")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: "#3B82F6" }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {t("CAN")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SharedModal>
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
    position: "relative",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  delete: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  Add: {
    position: "absolute",
    bottom: 30,
    left: 30,
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 15,
    elevation: 5,
  },
  AddText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  searchbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 15,
    elevation: 2,
  },
  search: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
    paddingHorizontal: 10,
  },
  showNotes: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EEF2FF",
  },
  noteContainer: {
    flex: 1,
    margin: 5,
  },
  note: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 15,
    padding: 15,
    backgroundColor: "#fff",
    elevation: 2,
    height: 150,
    justifyContent: "space-between",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "right",
  },
  noteContent: {
    fontSize: 12,
    textAlign: "right",
    color: "gray",
  },
  noteDate: {
    fontSize: 12,
    textAlign: "right",
    color: "#666",
    marginTop: 10,
  },
  noNotes: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#333",
  },
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    padding: 20,
    width: "85%",
  },
  titleModal: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  textModal: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 12,
  },
  modalDeleteBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  menuButton: {
    marginRight: 5,
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
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
  menuText: {
    fontSize: 18,
    marginRight: 15,
    color: "#333",
  },
  activeMenuItem: {
    backgroundColor: "#",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});
