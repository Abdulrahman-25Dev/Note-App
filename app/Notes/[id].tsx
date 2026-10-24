import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Share,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { useThemeStore } from "../../store/useThemeStore";
import relativeTime from "dayjs/plugin/relativeTime";
import { Colors } from "../../Constants/Colors";
import { getTitleFont, Radius, Spacing } from "../../Constants/Layout";
import { useTranslation } from "react-i18next";
import { useNotesStore } from "../../store/useNotesStore";

dayjs.extend(relativeTime);
dayjs.locale("ar");

const Details = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { isDarkMode, mainColor } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { id, from } = useLocalSearchParams<{
    id: string | string[];
    from?: string | string[];
  }>();
  const noteId = Array.isArray(id) ? id[0] : id;
  const cameFrom = Array.isArray(from) ? from[0] : from;
  const notes = useNotesStore((state) => state.notes);
  const [showModal, setShowModal] = useState(false);

  const delNote = useNotesStore((state) => state.deleteNote);
  const deletepermanentlyNote = useNotesStore(
    (state) => state.deletepermanentlyNote,
  );
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const updateNote = useNotesStore((state) => state.updateNote);

  const note = notes.find((n) => n.id === noteId);

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  const titleRef = useRef(title);
  const contentRef = useRef(content);
  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  useEffect(() => {
    return () => {
      updateNote(noteId, {
        title: titleRef.current,
        content: contentRef.current,
      });
    };
  }, [noteId, updateNote]);

  const shareNote = async () => {
    await Share.share({
      message: `*${note?.title}*\n\n${note?.content}`,
      title: note?.title || "",
    });
  };

  const returnToSource = () => {
    if (cameFrom === "favorites") {
      router.replace("/(tabs)/favorites");
    } else if (cameFrom === "trash") {
      router.replace("/(tabs)/TrashPin");
    } else {
      router.back();
    }
  };

  const deleteNote = () => {
    if (cameFrom === "trash") {
      deletepermanentlyNote(noteId);
    } else {
      delNote(noteId);
    }
    returnToSource();
  };

  const removeFromFavorites = () => {
    toggleFavorite(noteId);
    returnToSource();
  };

  const restoreDeletedNote = () => {
    restoreNote(noteId);
    returnToSource();
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <View style={styles.headerLeft}>
            {cameFrom === "favorites" ? (
              <TouchableOpacity
                style={[styles.delete, { backgroundColor: theme.card }]}
                onPress={removeFromFavorites}
              >
                <Ionicons
                  name="heart-dislike"
                  size={22}
                  color={theme.destructive}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.delete, { backgroundColor: theme.card }]}
                onPress={() => setShowModal(true)}
              >
                <Ionicons name="trash" size={22} color={theme.destructive} />
              </TouchableOpacity>
            )}
            {cameFrom === "trash" && (
              <TouchableOpacity
                style={[styles.delete, { backgroundColor: theme.card }]}
                onPress={restoreDeletedNote}
              >
                <Ionicons name="refresh" size={22} color="#00B4D8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.share, { backgroundColor: theme.card }]}
              onPress={shareNote}
            >
              <Ionicons name="share-outline" size={22} color={mainColor} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={returnToSource} style={styles.back}>
            <Ionicons name="arrow-forward" size={28} color={mainColor} />
          </TouchableOpacity>
        </View>

        <View style={[styles.body, { backgroundColor: theme.background }]}>
          <TextInput
            style={[
              styles.title,
              {
                color: theme.primary,
                fontFamily: getTitleFont(isRTL),
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={theme.secondary}
            placeholder="..."
          />
          <View style={styles.line} />
          <Text style={[styles.date, { color: theme.secondary }]}>
            {dayjs(note?.createdAt).format("DD MMMM YYYY - hh:mm A")}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={[styles.contentText, { color: theme.primary }]}
              value={content}
              onChangeText={setContent}
              placeholderTextColor={theme.secondary}
              placeholder="..."
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal
        statusBarTranslucent
        style={styles.modal}
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {
          setShowModal(!showModal);
        }}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.centeredView,
              {
                backgroundColor: theme.background,
                borderColor: theme.borders,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              {t("Are you sure?")}
            </Text>
            <Text style={[styles.modalText, { color: theme.primary }]}>
              {t("Do you want to delete this note?")}
            </Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.delButton} onPress={deleteNote}>
                <Text style={styles.delText}>{t("DEL")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>{t("CAN")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 19,
    paddingVertical: 22,
  },
  headerLeft: {
    flexDirection: "row",
    gap: 12,
  },
  back: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  delete: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Radius.md,
    width: 44,
    height: 44,
  },
  share: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Radius.md,
    width: 44,
    height: 44,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  line: {
    height: 1,
    backgroundColor: "gray",
    marginVertical: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: Spacing.lg,
    padding: 0,
  },
  date: {
    fontSize: 14,
    marginBottom: Spacing.md,
    textAlign: "right",
  },
  contentText: {
    fontSize: 16,
    padding: 0,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "40%",
    width: "40%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "heavy",
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 15,
  },
  delButton: {
    backgroundColor: "#DC2720",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  delText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
});
