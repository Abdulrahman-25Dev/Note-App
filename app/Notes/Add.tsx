// Add Notes screen 
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import {useState, useRef, useEffect} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '../../store/useThemeStore'
import { Colors } from '../../Constants/Colors'
import { useTranslation } from 'react-i18next';
import { useNotesStore } from '../../store/useNotesStore'

const Add = () => {
  const { t } = useTranslation();
  const titleRef = useRef<TextInput>(null)
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const { isDarkMode } = useThemeStore()
  const theme = isDarkMode ? Colors.dark : Colors.light

  useEffect(() => {
    setTimeout(() => {
      titleRef.current?.focus()
    }, 100);
  }, [])
  const addNote = useNotesStore((s) => s.addNote)
  const handleSave = async () => {
    if (!title || !content) {
      alert('Please fill all the fields')
      return
    }
    addNote({ title, content })
    router.back()
  }
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.header, {backgroundColor: theme.background}]}>
            <TouchableOpacity style={styles.SaveCon} onPress={handleSave}>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.Save}>{t('save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.BackCon} onPress={() => router.back()}>
              <Text style={[styles.Back, {color: theme.primary}]}>{t('back')}</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.primary}
                style={{paddingLeft: 5}}
               />
            </TouchableOpacity>
          </View>
          {/* END HEADER */}

          {/* START BODY  */}
          <View style={[styles.Add, {backgroundColor: theme.background}]}>
            <TextInput
              ref={titleRef}
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={'gray'}
              placeholder={t('title1')}
              style={[styles.inputTitle, {color: theme.primary}]}
            />
            <View style={styles.line} />
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholderTextColor={'gray'}
                placeholder={t('content')}
                multiline
                style={[styles.inputContent, {color: theme.primary}]}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    
    )
  }

export default Add

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
  SaveCon: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#28A745",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontWeight: "bold"
  },
  Save: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff"
  },
  BackCon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: "bold"
  },
  Back: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000"
  },
  Add: {
    flex: 1,
    padding: 20,
  },
  inputTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  line: {
    height: 1,
    backgroundColor: "gray",
    marginBottom: 10,
  },
  inputContent: {
    fontSize: 16,
    marginBottom: 10,
  },
})