import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
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
import { useTranslation } from "react-i18next";
import { useNotesStore } from "../../store/useNotesStore";

dayjs.extend(relativeTime);
dayjs.locale("ar");

const Details = () => {
  const { t } = useTranslation();

  const { isDarkMode, mainColor } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { id } = useLocalSearchParams();
  const noteId = Array.isArray(id) ? id[0] : id;
  const notes = useNotesStore((state) => state.notes);
  const [showModal, setShowModal] = useState(false);

  const delNote = useNotesStore((state) => state.deleteNote);
  const updateNote = useNotesStore((state) => state.updateNote);

  const note = notes.find((n) => n.id === id);

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
      updateNote(noteId, { title: titleRef.current, content: contentRef.current });
    };
  }, []);

  const deleteNote = () => {
    delNote(noteId);
    router.back();
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.background }]}>

        <TouchableOpacity
          style={[styles.delete, { backgroundColor: theme.card }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons
            name="trash"
            size={24}
            color="#DAA7A4"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons
            name="arrow-forward"
            size={24}
            color={mainColor}
          />
        </TouchableOpacity>
      </View>

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

      <View style={styles.body}>
        <TextInput
          style={[styles.title, { color: theme.primary }]}
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={theme.secondary}
          placeholder="..."
        />
        <View style={styles.line} />
        <Text style={[styles.date, { color: theme.primary }]}>
          {dayjs(note?.createdAt).format("DD MMMM YYYY - hh:mm A")}
        </Text>
        <TextInput
          style={[styles.contentText, { color: theme.primary }]}
          value={content}
          onChangeText={setContent}
          placeholderTextColor={theme.secondary}
          placeholder="..."
          multiline
          textAlignVertical="top"
        />
      </View>
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
  back: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  delete: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
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
    marginVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "right",
    padding: 0,
  },
  date: {
    fontSize: 14,
    color: "gray",
    marginBottom: 10,
    textAlign: "right",
  },
  contentText: {
    fontSize: 16,
    textAlign: "right",
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
