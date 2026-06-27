import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// import { StatusBar } from 'expo-status-bar';
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

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { id } = useLocalSearchParams();
  const noteId = Array.isArray(id) ? id[0] : id;
  const notes = useNotesStore((state) => state.notes);
  const [showModal, setShowModal] = useState(false);

  const delNote = useNotesStore((state) => state.deleteNote);

  const note = notes.find((n) => n.id === id);

  const deleteNote = async () => {
    delNote(noteId);
    router.back();
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={styles.delete}
            onPress={() => setShowModal(true)}
          >
            <Ionicons
              name="trash"
              size={24}
              color="#fff"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.deleteText}>{t("del")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.edit}
            onPress={() => router.push(`/Notes/Edit/${id}`)}
          >
            <Ionicons
              name="pencil"
              size={24}
              color="#fff"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.editText}>{t("edit")}</Text>
          </TouchableOpacity>
        </View>
        {/* START MODAL */}
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
        {/* ==== END MODAL ==== */}
        <View>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text
              style={{ fontSize: 14, fontWeight: "bold", color: theme.primary }}
            >
              {t("back")}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={theme.primary}
              style={{ paddingLeft: 5 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.content, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.primary }]}>
          {note?.title}
        </Text>
        <View style={styles.line} />
        <Text style={[styles.date, { color: theme.primary }]}>
          {dayjs(note?.createdAt).format("DD MMMM YYYY - hh:mm A")}
        </Text>
        <ScrollView>
          <Text style={[styles.contentText, { color: theme.primary }]}>
            {note?.content}
          </Text>
        </ScrollView>
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
  delete: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DC2720",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  edit: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  back: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: "#eee",
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
