import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // استيراد مكتبة اختيار الصور
import { supabase } from '../supabase';
import { fetchProfileData, updateProfileData, uploadAvatar } from '../profileService'; // استيراد دالة الرفع الجديدة

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // رابط الصورة من Supabase
  const [localImageUri, setLocalImageUri] = useState<string | null>(null); // رابط الصورة المحلية المختارة
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await fetchProfileData(user.id);
        if (profile) {
          setUsername(profile.username || "");
          setAvatarUrl(profile.avatar_url); // جلب الرابط الحالي من القاعدة
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // دالة فتح معرض الصور
  const handlePickImage = async () => {
    // طلب أذونات الوصول
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('عذراً', 'نحتاج لأذونات الوصول لمعرض الصور لتغيير الصورة.');
        return;
      }
    }

    // فتح المعرض
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // السماح بقص الصورة
      aspect: [1, 1], // جعلها مربعة
      quality: 0.5, // ضغط الصورة لتقليل الحجم
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri); // تخزين المسار المحلي لعرضه فوراً
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let finalAvatarUrl = avatarUrl; // القيمة الافتراضية هي الرابط القديم

      // 1. إذا تم اختيار صورة جديدة محلياً، قم برفعها أولاً
      if (localImageUri) {
        try {
          finalAvatarUrl = await uploadAvatar(user.id, localImageUri);
        } catch (uploadError) {
          console.error("Upload Error:", uploadError);
          Alert.alert("خطأ", "فشل رفع الصورة، سيتم حفظ الاسم فقط.");
          // سنكمل العملية ونحفظ الاسم فقط في حال فشل الصورة
        }
      }

      // 2. تحديث بيانات البروفايل في قاعدة البيانات (الاسم + الرابط الجديد أو القديم)
      await updateProfileData(user.id, username, finalAvatarUrl);
      
      Alert.alert("نجاح", "تم تحديث البيانات بنجاح");
      // تحديث الحالة في الواجهة
      setAvatarUrl(finalAvatarUrl); 
      setLocalImageUri(null); // مسح المسار المحلي بعد الحفظ

    } catch (error) {
      console.error(error);
      Alert.alert("خطأ", "حدث خطأ أثناء محاولة حفظ البيانات.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#fff" style={{flex: 1}} />;

  // تحديد مصدر الصورة للعرض (الأولوية للمحلية، ثم للرابط القادم من Supabase، ثم Placeholder)
  const imageSource = localImageUri 
    ? { uri: localImageUri } 
    : (avatarUrl ? { uri: avatarUrl } : require('../assets/images/ai.png'));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* جزء الصورة */}
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
          <Image 
            source={imageSource} 
            style={styles.avatar} 
          />
          <Text style={styles.changePhotoText}>تغيير الصورة</Text>
        </TouchableOpacity>

        {/* جزء الاسم */}
        <Text style={styles.label}>اسم المستخدم</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="أدخل اسمك هنا"
          placeholderTextColor="#666"
        />

        {/* زر الحفظ */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>حفظ التغييرات</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 20 },
  avatarContainer: { alignItems: 'center', marginVertical: 30 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#333', borderWidth: 2, borderColor: '#333' },
  changePhotoText: { color: '#007AFF', marginTop: 10, fontSize: 14, fontWeight: '600' },
  label: { color: '#fff', fontSize: 16, marginBottom: 10, fontWeight: '600' },
  input: { 
    backgroundColor: '#1e1e1e', 
    color: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333'
  },
  saveButton: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 40 
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default EditProfile;