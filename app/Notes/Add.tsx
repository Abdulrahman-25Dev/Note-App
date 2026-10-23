// Add Notes screen
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../Constants/Colors";
import { getTitleFont, Spacing } from "../../Constants/Layout";
import { useNotesStore } from "../../store/useNotesStore";
import { useThemeStore } from "../../store/useThemeStore";

const Add = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const titleRef = useRef<TextInput>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const draftRef = useRef({ title: "", content: "" });
  const savedRef = useRef(false);
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
  }, []);
  const addNote = useNotesStore((s) => s.addNote);
  const saveDraft = useCallback(async () => {
    if (savedRef.current) return;
    const draft = draftRef.current;
    if (!draft.title.trim() && !draft.content.trim()) return;

    savedRef.current = true;
    await addNote(draft);
  }, [addNote]);

  useEffect(() => {
    return () => {
      void saveDraft();
    };
  }, [saveDraft]);

  const handleBack = async () => {
    await saveDraft();
    router.back();
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.header, { backgroundColor: "transparent" }]}>
          <TouchableOpacity style={styles.BackCon} onPress={handleBack}>
            <Ionicons name="arrow-forward" size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>
        {/* END HEADER */}

        {/* START BODY  */}
        <View style={[styles.Add, { backgroundColor: theme.background }]}>
          <TextInput
            ref={titleRef}
            value={title}
            onChangeText={(value) => {
              draftRef.current.title = value;
              setTitle(value);
            }}
            placeholderTextColor={"gray"}
            placeholder={t("title1")}
            style={[
              styles.inputTitle,
              {
                color: theme.primary,
                fontFamily: getTitleFont(isRTL),
                marginBottom: Spacing.lg,
              },
            ]}
          />
          <View style={[styles.line, { backgroundColor: theme.borders }]} />
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              value={content}
              onChangeText={(value) => {
                draftRef.current.content = value;
                setContent(value);
              }}
              placeholderTextColor={"gray"}
              placeholder={t("content")}
              multiline
              style={[styles.inputContent, { color: theme.primary }]}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Add;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  BackCon: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: Spacing.sm,
  },
  Add: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  inputTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  line: {
    height: 1,
    marginVertical: Spacing.md,
  },
  inputContent: {
    fontSize: 16,
    marginBottom: 10,
  },
});
