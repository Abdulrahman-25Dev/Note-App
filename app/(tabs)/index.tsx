import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../../i18n/i18n";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import relativeTime from "dayjs/plugin/relativeTime";
import * as Clipboard from "expo-clipboard";
import { useThemeStore } from "../../store/useThemeStore";
import { Colors } from "../../Constants/Colors";
import { useTranslation } from "react-i18next";
import SharedModal from "../../components/sharedModal";
import { useNotesStore } from "../../store/useNotesStore";
import { useAlertStore } from "../../store/useAlertStore";

export default function Index() {
  useEffect(() => {
    const arabic = i18n.language === "ar";
    dayjs.locale(arabic ? "ar" : "en");
    dayjs.extend(relativeTime);
  }, []);
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
  const showAlert = useAlertStore((s) => s.showAlert);

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    showAlert({ title: t("copied"), message: t("copiedMessage") });
  };

  const { t } = useTranslation();
  const deleteAllNotes = useNotesStore((state) => state.deleteAllNotes);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllNotes = () => {
    deleteAllNotes();
    setShowDeleteModal(false);
    router.push("/");
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
        </View>

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
                  onPress={() => router.push(`/Notes/${item.id}`)}
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
            ListEmptyComponent={() => (
              <View>
                <Text style={[styles.noNotes, { color: theme.primary }]}>
                  {search.length > 0 ? t("noFoundNotes") : t("noNotes")}
                </Text>
              </View>
            )}
          />
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
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
});
