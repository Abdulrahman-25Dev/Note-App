import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "../../store/useThemeStore";
import { Colors } from "../../Constants/Colors";
import { useTranslation } from "react-i18next";
import SharedModal from "../../components/sharedModal";
import { useNotesStore } from "../../store/useNotesStore";
import {
  getBodyFont,
  getTitleFont,
  Radius,
  Spacing,
} from "../../Constants/Layout";

const TrashPin = () => {
  const deletepermanentlyNote = useNotesStore((s) => s.deletepermanentlyNote);
  const restoreNote = useNotesStore((s) => s.restoreNote);
  const deleteAllTrash = useNotesStore((s) => s.deleteAllDeleted);
  const restoreAllDeleted = useNotesStore((s) => s.restoreAllDeleted);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showRestoreAllModal, setShowRestoreAllModal] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // جلب الثيم
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const notes = useNotesStore((s) => s.notes);
  const trash = notes.filter((note) => note.deleted);
  const cardAnimations = useRef(new Map<string, Animated.Value>());
  const animatedNoteIds = useRef(new Set<string>());

  trash.forEach((note) => {
    if (!cardAnimations.current.has(note.id)) {
      cardAnimations.current.set(note.id, new Animated.Value(0));
    }
  });

  useEffect(() => {
    trash.forEach((note, index) => {
      if (animatedNoteIds.current.has(note.id)) return;

      animatedNoteIds.current.add(note.id);
      const animation = cardAnimations.current.get(note.id);
      if (!animation) return;

      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  }, [trash]);

  const [search, setSearch] = useState<string>("");
  const filteredNotes = trash.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()),
  );
  const handleDeleteAllTrash = () => {
    deleteAllTrash();
    setShowDeleteAllModal(false);
    router.push("/(tabs)/TrashPin");
  };

  const handleRestoreAllTrash = () => {
    restoreAllDeleted();
    setShowRestoreAllModal(false);
    router.push("/(tabs)/TrashPin");
  };

  const closeNoteActions = () => {
    setSelectedNoteId(null);
    setConfirmPermanentDelete(false);
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
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borders,
                },
              ]}
            >
              <Ionicons name="trash" size={22} color={theme.destructive} />
            </Pressable>
            <Pressable
              onPress={() => setShowRestoreAllModal(true)}
              style={[
                styles.headerActionButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borders,
                },
              ]}
            >
              <Ionicons name="refresh" size={22} color={mainColor} />
            </Pressable>
          </View>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {t("trash")}
          </Text>
        </View>

        <View style={[styles.showNotes, { backgroundColor: theme.background }]}>
          <View style={styles.searchbarWrapper}>
            <View
              style={[
                styles.searchbar,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.borders,
                  flexDirection: isRTL ? "row-reverse" : "row",
                  paddingHorizontal: Spacing.md,
                  marginBottom: Spacing.lg,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={mainColor}
                style={{ marginHorizontal: Spacing.sm }}
              />
              <TextInput
                value={search}
                onChangeText={(text) => setSearch(text)}
                placeholder="ابحث في المحذوفات..."
                style={[
                  styles.search,
                  {
                    color: theme.primary,
                    fontFamily: getBodyFont(isRTL),
                    textAlign: isRTL ? "right" : "left",
                  },
                ]}
                placeholderTextColor={theme.tertiary}
              />
              {search.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="مسح البحث"
                  onPress={() => setSearch("")}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.tertiary}
                  />
                </Pressable>
              )}
            </View>
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
                    { backgroundColor: theme.destructive },
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
                    {
                      backgroundColor: "transparent",
                      borderColor: theme.borders,
                    },
                  ]}
                  onPress={() => setShowDeleteAllModal(false)}
                >
                  <Text style={{ color: theme.primary, fontWeight: "bold" }}>
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
                    {
                      backgroundColor: "transparent",
                      borderColor: theme.borders,
                    },
                  ]}
                  onPress={() => setShowRestoreAllModal(false)}
                >
                  <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                    {t("CAN")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SharedModal>
          <SharedModal
            visible={selectedNoteId !== null}
            onClose={closeNoteActions}
            onRequestClose={closeNoteActions}
          >
            <View
              style={[
                styles.noteActionModal,
                { backgroundColor: theme.surface, borderColor: theme.borders },
              ]}
            >
              {confirmPermanentDelete ? (
                <>
                  <Text style={[styles.titleModal, { color: theme.primary }]}>
                    {t("ofcorse?")}
                  </Text>
                  <Text style={[styles.textModal, { color: theme.primary }]}>
                    {t("ofcorseText?")}
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[
                        styles.modalDeleteBtn,
                        { backgroundColor: "#EF4444" },
                      ]}
                      onPress={() => {
                        if (selectedNoteId)
                          deletepermanentlyNote(selectedNoteId);
                        closeNoteActions();
                      }}
                    >
                      <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                        {t("deletePermanently")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalCancelBtn,
                        {
                          backgroundColor: "transparent",
                          borderColor: theme.borders,
                        },
                      ]}
                      onPress={closeNoteActions}
                    >
                      <Text
                        style={{ color: theme.primary, fontWeight: "bold" }}
                      >
                        {t("CAN")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => {
                      if (selectedNoteId) restoreNote(selectedNoteId);
                      closeNoteActions();
                    }}
                    style={[
                      styles.noteActionOption,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Ionicons name="refresh" size={21} color={mainColor} />
                    <Text
                      style={[
                        styles.noteActionText,
                        { color: mainColor, fontFamily: getBodyFont(isRTL) },
                      ]}
                    >
                      {t("Restore")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => setConfirmPermanentDelete(true)}
                    style={[
                      styles.noteActionOption,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Ionicons name="trash" size={21} color="#EF4444" />
                    <Text
                      style={[
                        styles.noteActionText,
                        { color: "#EF4444", fontFamily: getBodyFont(isRTL) },
                      ]}
                    >
                      {t("deletePermanently")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelBtn,
                      {
                        backgroundColor: "transparent",
                        borderColor: theme.borders,
                      },
                    ]}
                    onPress={closeNoteActions}
                  >
                    <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                      {t("CAN")}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </SharedModal>
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.noteContainer}>
                <Animated.View
                  style={{
                    opacity: cardAnimations.current.get(item.id)!,
                    transform: [
                      {
                        translateY: cardAnimations.current
                          .get(item.id)!
                          .interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                      },
                    ],
                  }}
                >
                  <View
                    style={[
                      styles.note,
                      {
                        backgroundColor: theme.surface,
                        borderColor: mainColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.noteHeader,
                        { flexDirection: isRTL ? "row-reverse" : "row" },
                      ]}
                    >
                      <Pressable
                        style={styles.noteHeaderTitle}
                        onPress={() =>
                          router.push(`/Notes/${item.id}?from=trash`)
                        }
                      >
                        <Text
                          style={[
                            styles.noteTitle,
                            {
                              color: theme.primary,
                              fontFamily: getTitleFont(isRTL),
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                      </Pressable>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={t("noteActions")}
                        onPress={() => {
                          setSelectedNoteId(item.id);
                          setConfirmPermanentDelete(false);
                        }}
                        style={styles.noteMenuButton}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={21}
                          color={theme.tertiary}
                        />
                      </TouchableOpacity>
                    </View>
                    <Pressable
                      style={styles.noteTouchable}
                      onPress={() =>
                        router.push(`/Notes/${item.id}?from=trash`)
                      }
                    >
                      <Text
                        style={[
                          styles.noteContent,
                          {
                            color: theme.secondary,
                            fontFamily: getBodyFont(isRTL),
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {item.content}
                      </Text>
                    </Pressable>
                  </View>
                </Animated.View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View>
                <Text style={[styles.noNotes, { color: theme.primary }]}>
                  {search.length > 0 ? t("noTrashFound") : t("noTrash")}
                </Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
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
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 10,
    position: "relative",
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.round,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
  showNotes: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#EEF2FF",
  },
  searchbar: {
    width: "100%",
    height: 48,
    alignItems: "center",
    borderRadius: Radius.round,
    borderWidth: 1,
  },
  searchbarWrapper: {
    paddingTop: 4,
  },
  search: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    paddingVertical: 0,
    textAlignVertical: "center",
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
    height: 150,
    justifyContent: "space-between",
  },
  noteTouchable: {
    flex: 1,
  },
  noteHeader: {
    minHeight: 32,
    alignItems: "center",
    gap: 6,
  },
  noteHeaderTitle: {
    flex: 1,
  },
  noteMenuButton: {
    width: 28,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
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
    borderWidth: 1,
  },
  modalRestoreBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  noteActionModal: {
    justifyContent: "center",
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    width: "85%",
    gap: 8,
  },
  noteActionOption: {
    minHeight: 48,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  noteActionText: {
    fontSize: 16,
  },
});
