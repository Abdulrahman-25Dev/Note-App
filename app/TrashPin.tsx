import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router, useSegments } from "expo-router";
import { useState, useRef } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { Colors } from "../Constants/Colors";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/i18n";
import SharedModal from "../components/sharedModal";
import { useNotesStore } from "../store/useNotesStore";

const TrashPin = () => {
  const deletepermanentlyNote = useNotesStore((s) => s.deletepermanentlyNote);
  const restoreNote = useNotesStore((s) => s.restoreNote);
  const deleteAllTrash = useNotesStore((s) => s.deleteAllDeleted);
  const restoreAllDeleted = useNotesStore((s) => s.restoreAllDeleted);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showRestoreAllModal, setShowRestoreAllModal] = useState(false);
  const isRTL = i18n.language === "ar";
  const { t } = useTranslation();
  const { width } = Dimensions.get("window");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const segments = useSegments();
  const currentTab = segments[1] || "TrashPin";

  // جلب الثيم
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const notes = useNotesStore((s) => s.notes);
  const trash = notes.filter((note) => note.deleted);

  const [search, setSearch] = useState<string>("");
  const filteredNotes = trash.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()),
  );
  const handleDeleteAllTrash = () => {
    deleteAllTrash();
    setShowDeleteAllModal(false);
    router.push("./TrashPin" as any);
  };

  const handleRestoreAllTrash = () => {
    restoreAllDeleted();
    setShowRestoreAllModal(false);
    router.push("./TrashPin" as any);
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
              { flexDirection: isRTL ? "row-reverse" : "row", gap: 10 },
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
              { flexDirection: isRTL ? "row-reverse" : "row", gap: 10 },
              isActive("TrashPin") && styles.activeMenuItem,
              { backgroundColor: mainColor + "20" },
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
  const mainColor = useThemeStore((state) => state.mainColor);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => setShowDeleteAllModal(true)}
              style={[
                styles.headerActionButton,
                { backgroundColor: theme.card },
              ]}
            >
              <Ionicons name="trash" size={22} color={"#DAA7A3"} />
            </Pressable>
            <Pressable
              onPress={() => setShowRestoreAllModal(true)}
              style={[
                styles.headerActionButton,
                { backgroundColor: theme.card },
              ]}
            >
              <Ionicons name="refresh" size={22} color={"#00B4D8"} />
            </Pressable>
          </View>

          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {t("trash")}
          </Text>

          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* HEADER END */}

        {/* CONTENT START */}

        <View style={[styles.showNotes, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.searchbar,
              { backgroundColor: theme.card, borderColor: mainColor },
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
              // placeholder="البحث عن ملاحظة ..."
              style={[styles.search, { color: theme.primary }]}
              textAlign="right"
              placeholderTextColor={theme.secondary}
            />
          </View>
          <SharedModal
            visible={showDeleteAllModal}
            onClose={() => setShowDeleteAllModal(false)}
            onRequestClose={() => setShowDeleteAllModal(false)}
          >
            <View
              style={[styles.modalContainer, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.titleModal, { color: theme.primary }]}>
                {t("DELALLTrash")}
              </Text>
              <Text style={[styles.textModal, { color: theme.primary }]}>
                {t("sureDELALLTrash")}
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalDeleteBtn,
                    { backgroundColor: "#DC2626" },
                  ]}
                  onPress={handleDeleteAllTrash}
                >
                  <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                    {t("DEL")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCancelBtn,
                    { backgroundColor: "#3B82F6" },
                  ]}
                  onPress={() => setShowDeleteAllModal(false)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {t("CAN")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SharedModal>

          <SharedModal
            visible={showRestoreAllModal}
            onClose={() => setShowRestoreAllModal(false)}
            onRequestClose={() => setShowRestoreAllModal(false)}
          >
            <View
              style={[styles.modalContainer, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.titleModal, { color: theme.primary }]}>
                {t("restoreAllTrash")}
              </Text>
              <Text style={[styles.textModal, { color: theme.primary }]}>
                {t("sureRestoreAllTrash")}
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalRestoreBtn,
                    { backgroundColor: "#10B981" },
                  ]}
                  onPress={handleRestoreAllTrash}
                >
                  <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                    {t("Restore")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCancelBtn,
                    { backgroundColor: "#3B82F6" },
                  ]}
                  onPress={() => setShowRestoreAllModal(false)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {t("CAN")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SharedModal>

          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.noteContainer}>
                <View
                  style={[
                    styles.note,
                    { backgroundColor: theme.card, borderColor: mainColor },
                  ]}
                >
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
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        { backgroundColor: theme.card },
                      ]}
                      onPress={() => setShowModal(true)}
                    >
                      <Ionicons name="trash" size={22} color="#EE8A8A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.restoreButton,
                        { backgroundColor: theme.card },
                      ]}
                      onPress={() => {
                        restoreNote(item.id);
                      }}
                    >
                      <Ionicons name="refresh" size={22} color="#00B4D8" />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* START MODAL FOR DELETE PERMANENTLY */}
                <Modal
                  visible={showModal}
                  animationType="fade"
                  transparent={true}
                  onRequestClose={() => setShowModal(false)}
                >
                  <View style={styles.overlay2}>
                    <View
                      style={[
                        styles.MessageContainer,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.borders,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.MessageTitle, { color: theme.primary }]}
                      >
                        {t("ofcorse?")}
                      </Text>
                      <Text
                        style={[styles.MessageText, { color: theme.primary }]}
                      >
                        {t("ofcorseText?")}
                      </Text>
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.DELBtn}
                          onPress={() => {
                            deletepermanentlyNote(item.id);
                            setShowModal(false);
                          }}
                        >
                          <Text style={styles.DELBtnText}>{t("DEL")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setShowModal(false)}
                          style={styles.CANBtn}
                        >
                          <Text style={styles.CANBtnText}>{t("CAN")}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>

                {/* END MODAL */}
              </View>
            )}
            ListEmptyComponent={() => {
              return (
                <View>
                  {search.length > 0 ? (
                    <Text style={[styles.noNotes, { color: theme.primary }]}>
                      {t("noTrashFound")}
                    </Text>
                  ) : (
                    <Text style={[styles.noNotes, { color: theme.primary }]}>
                      {t("noTrash")}
                    </Text>
                  )}
                </View>
              );
            }}
          />
        </View>
      </SafeAreaView>
      {drawerOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleDrawer} />
      )}
      <Drawer />
    </View>
  );
};

export default TrashPin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 22,
    position: "relative",
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    marginRight: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  DELALL: {
    position: "absolute",
    left: 20,
    top: 22,
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
  menuText: {
    fontSize: 18,
    marginRight: 15,
    color: "#333",
  },
  activeMenuItem: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  showNotes: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EEF2FF",
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
    borderWidth: 1,
  },
  search: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
    paddingHorizontal: 10,
  },
  noteContainer: {
    flex: 1,
    margin: 5,
  },
  note: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#A7C7FF",
    borderRadius: 15,
    padding: 15,
    backgroundColor: "#fff",
    elevation: 2,
    height: 150,
    justifyContent: "space-between",
  },
  noteTouchable: {
    flex: 1,
  },
  noteActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  restoreText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 5,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    fontSize: 12,
    marginLeft: 5,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "right",
  },
  noteContent: {
    fontSize: 14,
    textAlign: "right",
    color: "gray",
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
  modalRestoreBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  overlay2: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  MessageContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
  },
  MessageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  MessageText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "heavy",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 20,
  },
  DELBtn: {
    backgroundColor: "red",
    padding: 15,
    justifyContent: "center",
    borderRadius: 10,
  },
  DELBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  CANBtn: {
    backgroundColor: "#3B82F6",
    padding: 15,
    justifyContent: "center",
    borderRadius: 10,
  },
  CANBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
