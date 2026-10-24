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
// import { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useThemeStore } from "../../store/useThemeStore";
import { Colors } from "../../Constants/Colors";
import { useTranslation } from "react-i18next";
import SharedModal from "../../components/sharedModal";
import { useNotesStore } from "../../store/useNotesStore";
import { getBodyFont, Radius, Spacing } from "../../Constants/Layout";

// مكون صفحة المفضلة، مبني بنفس طريقة سلة المحذوفات
const Favorites = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  // جلب الثيم
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const mainColor = useThemeStore((state) => state.mainColor);

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

  // حالة الملاحظات المفضلة  // حالة البحث
  const [search, setSearch] = useState<string>("");
  const [showClearFavoritesModal, setShowClearFavoritesModal] = useState(false);

  // تحميل الملاحظات المفضلة عند فتح الصفحة
  const allNotes = useNotesStore((state) => state.notes);
  const favorites = allNotes.filter((note) => note.favorite);
  const cardAnimations = useRef(new Map<string, Animated.Value>());
  const animatedNoteIds = useRef(new Set<string>());

  favorites.forEach((note) => {
    if (!cardAnimations.current.has(note.id)) {
      cardAnimations.current.set(note.id, new Animated.Value(0));
    }
  });

  useEffect(() => {
    favorites.forEach((note, index) => {
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
  }, [favorites]);

  // فلترة الملاحظات بناءً على البحث
  const filteredNotes = favorites.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleFavorite = useNotesStore((s) => s.toggleFavorite);
  const removeAllFavorites = useNotesStore((s) => s.removeAllFavorites);

  const handleClearFavorites = () => {
    removeAllFavorites();
    setShowClearFavoritesModal(false);
    router.push("/(tabs)/favorites");
  };

  // الواجهة الرئيسية للصفحة
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => setShowClearFavoritesModal(true)}
            style={[
              styles.headerActionButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borders,
              },
            ]}
          >
            <Ionicons name="heart-dislike" size={22} color={theme.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            {t("favorites")}
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
                placeholder="ابحث في المفضلة..."
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
                      { borderColor: mainColor, backgroundColor: theme.card },
                    ]}
                  >
                    <Pressable
                      onPress={() =>
                        router.push(`/Notes/${item.id}?from=favorites`)
                      }
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
                    </Pressable>
                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        style={[
                          styles.removeButton,
                          { backgroundColor: mainColor },
                        ]}
                        onPress={() => toggleFavorite(item.id)}
                      >
                        <Ionicons
                          name="heart-dislike"
                          size={20}
                          color={getContrastingColor(mainColor)}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View>
                <Text style={[styles.noNotes, { color: theme.primary }]}>
                  {search.length > 0 ? t("noFavoritesFound") : t("noFavorites")}
                </Text>
              </View>
            )}
          />
        </View>
        <SharedModal
          visible={showClearFavoritesModal}
          onClose={() => setShowClearFavoritesModal(false)}
          onRequestClose={() => setShowClearFavoritesModal(false)}
        >
          <View
            style={[styles.modalContainer, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.titleModal, { color: theme.primary }]}>
              {t("RMEALLFavorites")}
            </Text>
            <Text style={[styles.textModal, { color: theme.primary }]}>
              {t("sureRMEALLFavorites")}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.DELBtn, { backgroundColor: theme.destructive }]}
                onPress={handleClearFavorites}
              >
                <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                  {t("DEL")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.CancelBtn,
                  {
                    backgroundColor: "transparent",
                    borderColor: theme.borders,
                  },
                ]}
                onPress={() => setShowClearFavoritesModal(false)}
              >
                <Text style={{ color: theme.primary, fontWeight: "bold" }}>
                  {t("CAN")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SharedModal>
      </SafeAreaView>
    </View>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.round,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  showNotes: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#EEF2FF",
  },
  searchbarWrapper: {
    paddingTop: 4,
  },
  searchbar: {
    width: "100%",
    height: 48,
    alignItems: "center",
    borderRadius: Radius.round,
    borderWidth: 1,
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
    backgroundColor: "#fff",
    elevation: 2,
    height: 150,
    justifyContent: "space-between",
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
  noteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  removeButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
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
  DELBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  CancelBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});
