import { Text, View, StyleSheet, TouchableOpacity, FlatList, Animated, Dimensions, TextInput   } from 'react-native'
// import { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import { router, useSegments } from 'expo-router'
import { useState, useRef } from 'react'
import { useThemeStore } from "../store/useThemeStore";
import { Colors } from "../Constants/Colors";
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n'
import { useNotesStore } from '../store/useNotesStore'

 

// مكون صفحة المفضلة، مبني بنفس طريقة سلة المحذوفات
const Favorites = () => {

  const isRTL = i18n.language === 'ar';

  const { t } = useTranslation();
  // الحصول على عرض الشاشة للـ Drawer
  const { width } = Dimensions.get('window');
  // حالة فتح/إغلاق الـ Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  // مرجع للرسوم المتحركة
  const animatedValue = useRef(new Animated.Value(0)).current;
  // الحصول على المسار الحالي
  const segments = useSegments();
  const currentTab = segments[1] || 'favorites';

  // جلب الثيم
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

    const mainColor = useThemeStore((state) => state.mainColor);

  // حالة الملاحظات المفضلة  // حالة البحث
  const [search, setSearch] = useState<string>('');
 
  
    // تحميل الملاحظات المفضلة عند فتح الصفحة
    const allNotes = useNotesStore((state) => state.notes);
    const favorites = allNotes.filter((note) => note.favorite);
  // فلترة الملاحظات بناءً على البحث
  const filteredNotes = 
  favorites.filter((note) => 
    note.title.toLowerCase().includes(search.toLowerCase()) || note.content.toLowerCase().includes(search.toLowerCase()));

  const toggleFavorite = useNotesStore((s) => s.toggleFavorite);

  // دالة لفتح/إغلاق الـ Drawer
  const toggleDrawer = () => {
    const toValue = drawerOpen ? 0 : 1;
    setDrawerOpen(!drawerOpen);
    Animated.timing(animatedValue, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // تحويل القيمة المتحركة إلى إزاحة أفقية
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: isRTL ? [width, 0] : [-width, 0],
  });

  // مكون الـ Drawer
  const Drawer = () => {
    // دالة للتحقق من التبويب النشط
    const isActive = (tab: string) => currentTab === tab;
    return (
      <Animated.View style={[styles.drawer, { transform: [{ translateX }], backgroundColor: theme.card,
      right: isRTL ? 0 : undefined, left: isRTL ? undefined : 0 }]}>
        <View style={styles.drawerHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleDrawer}>
            <Ionicons name="close" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.drawerTitle,{ color: theme.primary }]}>{t('title')}</Text>
        </View>
        
        <View style={styles.drawerContent}>
          {/* عنصر القائمة للملاحظات */}
          <TouchableOpacity style={[styles.menuItem, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }, isActive('index') && styles.activeMenuItem]} onPress={() => { toggleDrawer(); router.push('/'); }}>
            <Ionicons name="document-text" size={24} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.primary }]}>{t('myNotes')}</Text>
          </TouchableOpacity>

          {/* عنصر القائمة لسلة المحذوفات */}
          <TouchableOpacity style={[styles.menuItem, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }, isActive('TrashPin') && styles.activeMenuItem]} onPress={() => { toggleDrawer(); router.push('./TrashPin' as any); }}>
            <Ionicons name="trash" size={24} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.primary }]}>{t('trash')}</Text>
          </TouchableOpacity>
          
          {/* عنصر القائمة للمفضلة */}
          <TouchableOpacity style={[styles.menuItem, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }, isActive('favorites') && styles.activeMenuItem, { backgroundColor: mainColor + '20' }]} onPress={() => { toggleDrawer(); router.push('./favorites' as any); }}>
            <Ionicons name="heart" size={24} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.primary }]}>{t('favorites')}</Text>
          </TouchableOpacity>

          {/* عنصر القائمة للإعدادات */}
          <TouchableOpacity style={[styles.menuItem, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 10 }, isActive('settings') && styles.activeMenuItem]} onPress={() => { toggleDrawer(); router.push('./settings'); }}>
            <Ionicons name="settings" size={24} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.primary }]}>{t('settings')}</Text>
          </TouchableOpacity>


        </View>
      </Animated.View>
    );
  };

  // الواجهة الرئيسية للصفحة
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* المنطقة الآمنة للشاشة */}
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color={theme.primary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.primary }]}>{t("favorites")}</Text>
        </View>

        {/* محتوى الصفحة */}
        <View style={[styles.showNotes, { backgroundColor: theme.background }]}>
          {/* شريط البحث */}
          <View style={[styles.searchbar, { backgroundColor: theme.card, borderColor: mainColor }]}>
            <Ionicons name="search" size={20} color={mainColor} style={{ marginLeft: 8 }} />
            <TextInput 
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder={t("search")}
            style={[styles.search, { color: theme.primary }]}
            textAlign="right"
            placeholderTextColor={theme.secondary}
            
            />
          </View>
          {/* قائمة الملاحظات */}
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <View style={styles.noteContainer}>
                  <View style={[styles.note, { borderColor: mainColor, backgroundColor: theme.card }]}>
                    {/* عنوان الملاحظة */}
                    <Text style={[styles.noteTitle, { color: theme.primary }]} numberOfLines={1}>{item.title}</Text>
                    {/* محتوى الملاحظة */}
                    <Text style={[styles.noteContent, { color: theme.secondary }]} numberOfLines={1}>{item.content}</Text>
                    {/* أزرار الإجراءات */}
                  <View style={styles.noteActions}>
                    {/* زر إزالة من المفضلة */}
                    <TouchableOpacity style={[styles.removeButton, { backgroundColor: mainColor }]} onPress={() => toggleFavorite(item.id)}>
                      <Ionicons name="heart-dislike" size={20} color='#fff' />
                    </TouchableOpacity>
                  </View>
                </View>
                
                
              </View>
            )}
            // رسالة عندما لا توجد ملاحظات
            ListEmptyComponent={() => {
              return (
                <View>
                  {search.length > 0 ? (
                    <Text style={[styles.noNotes, { color: theme.primary }]}>{t("noFavoritesFound")}</Text>

                  ) :
                    (<Text style={[styles.noNotes, { color: theme.primary }]}>{t("noFavorites")}</Text>)
                  }
                </View>
              )
            }}
            
          />
        </View>
        
        
      </SafeAreaView>
      {/* طبقة الخلفية عند فتح الـ Drawer */}
      {drawerOpen && <TouchableOpacity style={styles.overlay} onPress={toggleDrawer} />}
      {/* عرض الـ Drawer */}
      <Drawer />
    </View>
  )
}

export default Favorites

const styles = StyleSheet.create({
    container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    height: 70,
    justifyContent: 'center',  
    alignItems: 'center',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    right: 20,
    top: 22,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    width: Dimensions.get('window').width * 0.75,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 10, 
    borderRadius: 5,
    paddingTop: 40,
    },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 50,
    textAlign: 'right',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  menuText: {
    fontSize: 18,
    marginRight: 15,
    color: '#333',
  },
  activeMenuItem: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  showNotes: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EEF2FF",
  },
  searchbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
  },
  search:{
      flex: 1,
      fontSize: 16,
      textAlign: 'right',
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
    justifyContent: 'space-between',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "right"
  },
  noteContent: {
    fontSize: 14,
    textAlign: "right",
    color: 'gray',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    color: "#333"
  },
});